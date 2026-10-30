// lib/ai/providers/gemini.ts
import { computeCacheKey, getCachedAiResponse, setCachedAiResponse } from "@/lib/ai/cache";
import { runSafetyScreen } from "@/lib/ai/safety";

export const GEMINI_CONFIG = {
  MODEL: process.env.GEMINI_MODEL_ID || "gemini-2.5-flash",
  API_KEY: process.env.GEMINI_API_KEY || "",
  BASE_URL: "https://generativelanguage.googleapis.com/v1beta/models",
};

export interface GeminiCallParams {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface GeminiCallResult {
  text: string;
  model: string;
  cached: boolean;
  latencyMs: number;
}

export async function callGeminiFlash(params: GeminiCallParams): Promise<GeminiCallResult> {
  const startTime = Date.now();
  const apiKey = GEMINI_CONFIG.API_KEY;
  const model = GEMINI_CONFIG.MODEL;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured for fallback.");
  }

  // 1. Check Disk Cache
  const cacheKey = computeCacheKey(model, params.systemPrompt, params.userPrompt);
  const cached = getCachedAiResponse<GeminiCallResult>(cacheKey);
  if (cached) {
    return {
      ...cached,
      cached: true,
      latencyMs: Date.now() - startTime,
    };
  }

  // 2. Call Google Gemini API
  const url = `${GEMINI_CONFIG.BASE_URL}/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: `SYSTEM INSTRUCTIONS:\n${params.systemPrompt}\n\nUSER PROMPT:\n${params.userPrompt}` },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: params.maxTokens ?? 1500,
        temperature: params.temperature ?? 0.2,
        ...(params.jsonMode ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Flash API error (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const json = await response.json();
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const safety = runSafetyScreen(rawText);

  const result: GeminiCallResult = {
    text: safety.sanitizedText,
    model,
    cached: false,
    latencyMs: Date.now() - startTime,
  };

  // Cache response to disk
  setCachedAiResponse(cacheKey, result);
  return result;
}
