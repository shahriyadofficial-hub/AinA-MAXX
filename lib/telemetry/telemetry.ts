// lib/telemetry/telemetry.ts
// Pure Judge Demo telemetry domain: per-model token cost estimation against
// the $150 Meta API credit budget, interaction aggregation, and the 1-click
// demo action catalog. No DB/network here so everything is unit-testable.

export const META_CREDIT_BUDGET_USD = 150;

/**
 * Blended USD cost per 1K tokens (input + output) used for HUD estimation.
 * These are planning estimates for the hackathon demo, clearly labelled as
 * estimates in the UI — never presented as billing truth.
 */
export const MODEL_COST_PER_1K_TOKENS_USD: Record<string, number> = {
  "muse-spark-1.3": 0.004,
  "muse-wonder": 0.006,
  "muse-image": 0.02,
  "sam-3.1": 0.01,
  "gemini-2.5-flash": 0.001,
};

const DEFAULT_COST_PER_1K = 0.004;

export function estimateCostUsd(model: string, inputTokens = 0, outputTokens = 0): number {
  const rate = MODEL_COST_PER_1K_TOKENS_USD[model] ?? DEFAULT_COST_PER_1K;
  return ((inputTokens + outputTokens) / 1000) * rate;
}

export interface AiInteractionLike {
  feature: string;
  modelId: string;
  provider: string;
  status: string;
  latencyMs: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCostUsd?: number | null;
  createdAt: string;
}

export interface TelemetrySummary {
  totalCalls: number;
  succeeded: number;
  fallbacksUsed: number;
  safetyRejections: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  estimatedCostUsd: number;
  budgetUsd: number;
  budgetUsedPercent: number;
  budgetRemainingUsd: number;
  byModel: Array<{
    model: string;
    calls: number;
    tokens: number;
    estimatedCostUsd: number;
    avgLatencyMs: number;
  }>;
  byFeature: Array<{ feature: string; calls: number }>;
  recent: AiInteractionLike[];
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

/** Aggregates raw ai_interactions rows into the HUD summary. */
export function summarizeTelemetry(interactions: AiInteractionLike[]): TelemetrySummary {
  const totalCalls = interactions.length;
  const succeeded = interactions.filter((i) => i.status === "succeeded").length;
  const fallbacksUsed = interactions.filter((i) => i.status === "fallback_used").length;
  const safetyRejections = interactions.filter((i) =>
    i.status.startsWith("rejected")
  ).length;

  const totalInputTokens = interactions.reduce((s, i) => s + (i.inputTokens ?? 0), 0);
  const totalOutputTokens = interactions.reduce((s, i) => s + (i.outputTokens ?? 0), 0);

  const latencies = interactions
    .map((i) => i.latencyMs)
    .filter((v): v is number => typeof v === "number");
  const avgLatencyMs =
    latencies.length === 0 ? 0 : Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

  const estimatedCostUsd = interactions.reduce(
    (s, i) =>
      s +
      (typeof i.estimatedCostUsd === "number"
        ? i.estimatedCostUsd
        : estimateCostUsd(i.modelId, i.inputTokens ?? 0, i.outputTokens ?? 0)),
    0
  );

  const modelMap = new Map<string, { calls: number; tokens: number; cost: number; latencySum: number }>();
  for (const i of interactions) {
    const entry = modelMap.get(i.modelId) ?? { calls: 0, tokens: 0, cost: 0, latencySum: 0 };
    entry.calls += 1;
    entry.tokens += (i.inputTokens ?? 0) + (i.outputTokens ?? 0);
    entry.cost +=
      typeof i.estimatedCostUsd === "number"
        ? i.estimatedCostUsd
        : estimateCostUsd(i.modelId, i.inputTokens ?? 0, i.outputTokens ?? 0);
    entry.latencySum += i.latencyMs ?? 0;
    modelMap.set(i.modelId, entry);
  }

  const featureMap = new Map<string, number>();
  for (const i of interactions) {
    featureMap.set(i.feature, (featureMap.get(i.feature) ?? 0) + 1);
  }

  const roundedCost = Math.round(estimatedCostUsd * 10000) / 10000;

  return {
    totalCalls,
    succeeded,
    fallbacksUsed,
    safetyRejections,
    totalInputTokens,
    totalOutputTokens,
    totalTokens: totalInputTokens + totalOutputTokens,
    avgLatencyMs,
    p95LatencyMs: percentile(latencies, 95),
    estimatedCostUsd: roundedCost,
    budgetUsd: META_CREDIT_BUDGET_USD,
    budgetUsedPercent:
      Math.round((roundedCost / META_CREDIT_BUDGET_USD) * 10000) / 100,
    budgetRemainingUsd: Math.round((META_CREDIT_BUDGET_USD - roundedCost) * 10000) / 10000,
    byModel: [...modelMap.entries()]
      .map(([model, v]) => ({
        model,
        calls: v.calls,
        tokens: v.tokens,
        estimatedCostUsd: Math.round(v.cost * 10000) / 10000,
        avgLatencyMs: v.calls === 0 ? 0 : Math.round(v.latencySum / v.calls),
      }))
      .sort((a, b) => b.calls - a.calls),
    byFeature: [...featureMap.entries()]
      .map(([feature, calls]) => ({ feature, calls }))
      .sort((a, b) => b.calls - a.calls),
    recent: interactions.slice(0, 8),
  };
}

// ---------------------------------------------------------------------------
// Judge Demo action catalog (1-click tests a–e)
// ---------------------------------------------------------------------------

export type DemoActionId = "login" | "roadmap" | "conflict" | "barber" | "cutout";

export interface DemoAction {
  id: DemoActionId;
  labelEn: string;
  labelBn: string;
  model: string;
  method: "GET" | "POST";
  endpoint: string;
  body?: Record<string, unknown>;
}

export const DEMO_ACTIONS: DemoAction[] = [
  {
    id: "login",
    labelEn: "Instant Demo Login",
    labelBn: "ইনস্ট্যান্ট ডেমো লগইন",
    model: "session",
    method: "GET",
    endpoint: "/api/v1/me",
  },
  {
    id: "roadmap",
    labelEn: "Live Roadmap Generation",
    labelBn: "লাইভ রোডম্যাপ তৈরি",
    model: "muse-spark-1.3",
    method: "POST",
    endpoint: "/api/v1/roadmaps",
    body: {
      goals: ["skin barrier health", "hair hydration"],
      skinType: "combination",
      hairType: "wavy",
      budgetTier: "budget",
      availableMinutes: 15,
      locale: "en",
    },
  },
  {
    id: "conflict",
    labelEn: "Conflict Analysis",
    labelBn: "দ্বন্দ্ব বিশ্লেষণ",
    model: "muse-wonder",
    method: "POST",
    endpoint: "/api/v1/ai/conflicts",
    body: {
      productA: "The Ordinary Retinol 0.5% in Squalane",
      productB: "Minimalist Salicylic Acid 2% Serum",
    },
  },
  {
    id: "barber",
    labelEn: "Barber Card",
    labelBn: "বারবার কার্ড",
    model: "muse-image",
    method: "POST",
    endpoint: "/api/v1/ai/barber-card",
    body: { desiredStyle: "Textured Crop + Low Skin Fade", locale: "en" },
  },
  {
    id: "cutout",
    labelEn: "Wardrobe Cutout",
    labelBn: "ওয়ারডরোব কাটআউট",
    model: "sam-3.1",
    method: "POST",
    endpoint: "/api/v1/wardrobe/cutout",
    body: { category: "top", color: "Jet Black", brand: "AinA Studio" },
  },
];

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(4)}`;
}
