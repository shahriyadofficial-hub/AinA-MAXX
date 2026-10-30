// lib/ai/providers/meta.ts
import OpenAI from "openai";
import { computeCacheKey, getCachedAiResponse, setCachedAiResponse } from "@/lib/ai/cache";
import { runSafetyScreen } from "@/lib/ai/safety";

export const META_MODELS = {
  TEXT: process.env.META_MODEL_TEXT_ID || "muse-spark-1.3",
  REASONING: process.env.META_MODEL_REASONING_ID || "muse-wonder",
  IMAGE: process.env.META_MODEL_IMAGE_ID || "muse-image",
  SAM: process.env.META_MODEL_SAM_ID || "sam-3.1",
} as const;

export function createMetaClient() {
  const apiKey = process.env.MODEL_API_KEY;
  const baseURL = process.env.META_MODEL_API_BASE_URL || "https://api.meta.ai/v1";

  if (!apiKey) {
    throw new Error("MODEL_API_KEY is not configured in environment.");
  }

  return new OpenAI({
    baseURL,
    apiKey,
    timeout: Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 30000),
    maxRetries: 0, // We handle retries and 429 backoff custom logic
  });
}

export interface MetaCallParams {
  model?: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface MetaCallResult {
  text: string;
  model: string;
  cached: boolean;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes a call to Meta Model API with automatic $150 credit disk-caching
 * and intelligent HTTP 429 rate-limit backoff handler.
 */
export async function callMetaModel(params: MetaCallParams): Promise<MetaCallResult> {
  const model = params.model || META_MODELS.TEXT;
  const startTime = Date.now();

  // 1. Safety Screen on User Prompt
  const promptCheck = runSafetyScreen(params.userPrompt);
  if (!promptCheck.passed && promptCheck.flags.some(f => f.includes("AI-SAFE-01"))) {
    throw new Error("Safety Guardrail: Attractiveness ratings and face scoring are strictly prohibited.");
  }

  // 2. Disk Cache Check ($150 Credit Protection)
  const cacheKey = computeCacheKey(model, params.systemPrompt, params.userPrompt);
  const cached = getCachedAiResponse<MetaCallResult>(cacheKey);
  if (cached) {
    return {
      ...cached,
      cached: true,
      latencyMs: Date.now() - startTime,
    };
  }

  const client = createMetaClient();
  let attempts = 0;
  const maxAttempts = Number(process.env.AI_MAX_RETRIES || 2) + 1;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      // Use Chat Completions protocol supported by Meta Model API
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userPrompt },
        ],
        max_tokens: params.maxTokens ?? 1500,
        temperature: params.temperature ?? 0.2,
        ...(params.jsonMode ? { response_format: { type: "json_object" } } : {}),
      });

      const rawText = completion.choices[0]?.message?.content ?? "";
      const safety = runSafetyScreen(rawText);

      const result: MetaCallResult = {
        text: safety.sanitizedText,
        model,
        cached: false,
        latencyMs: Date.now() - startTime,
        inputTokens: completion.usage?.prompt_tokens,
        outputTokens: completion.usage?.completion_tokens,
      };

      // Persist to disk cache
      setCachedAiResponse(cacheKey, result);
      return result;
    } catch (err: unknown) {
      const errorObj = err as { status?: number; headers?: Record<string, string>; message?: string };

      // Handle 429 Rate Limits / Quota Exhaustion
      if (errorObj?.status === 429) {
        const retryAfter = errorObj?.headers?.["retry-after"] || errorObj?.headers?.["x-ratelimit-reset"];
        const waitSec = retryAfter ? parseInt(retryAfter, 10) : Math.pow(2, attempts) * 2;
        console.warn(`[MetaAPI 429] Rate limit reached. Backoff for ${waitSec}s (Attempt ${attempts}/${maxAttempts})...`);

        if (attempts < maxAttempts) {
          await sleep(Math.min(waitSec * 1000, 10000)); // Cap local wait at 10s before failover
          continue;
        }
      }

      // If last attempt or unrecoverable error, throw to let router failover to Gemini
      if (attempts >= maxAttempts) {
        throw err;
      }
      await sleep(1000 * attempts);
    }
  }

  throw new Error(`Meta Model API call failed after ${maxAttempts} attempts.`);
}
