// tests/unit/telemetry.test.ts
import { describe, it, expect } from "vitest";
import {
  estimateCostUsd,
  summarizeTelemetry,
  DEMO_ACTIONS,
  META_CREDIT_BUDGET_USD,
  type AiInteractionLike,
} from "@/lib/telemetry/telemetry";

function interaction(partial: Partial<AiInteractionLike>): AiInteractionLike {
  return {
    feature: "coach_chat",
    modelId: "muse-spark-1.3",
    provider: "meta_model_api",
    status: "succeeded",
    latencyMs: 1000,
    inputTokens: 100,
    outputTokens: 200,
    createdAt: "2026-10-30T08:00:00.000Z",
    ...partial,
  };
}

describe("Cost estimation vs the $150 Meta credit budget", () => {
  it("estimates blended per-1K token costs per model", () => {
    expect(estimateCostUsd("muse-spark-1.3", 500, 500)).toBeCloseTo(0.004);
    expect(estimateCostUsd("muse-wonder", 1000, 0)).toBeCloseTo(0.006);
    expect(estimateCostUsd("gemini-2.5-flash", 0, 2000)).toBeCloseTo(0.002);
    expect(estimateCostUsd("unknown-model", 1000, 0)).toBeCloseTo(0.004);
  });

  it("keeps the demo well inside the $150 budget", () => {
    const summary = summarizeTelemetry([
      interaction({}),
      interaction({ feature: "roadmap_generation", inputTokens: 420, outputTokens: 1150 }),
    ]);
    expect(summary.budgetUsd).toBe(META_CREDIT_BUDGET_USD);
    expect(summary.estimatedCostUsd).toBeLessThan(1);
    expect(summary.budgetRemainingUsd).toBeGreaterThan(149);
    expect(summary.budgetUsedPercent).toBeLessThan(1);
  });
});

describe("Telemetry aggregation", () => {
  it("counts calls, tokens, fallbacks, and safety rejections", () => {
    const summary = summarizeTelemetry([
      interaction({}),
      interaction({ status: "fallback_used", latencyMs: 200 }),
      interaction({ status: "rejected_safety", latencyMs: 50 }),
      interaction({ modelId: "muse-wonder", feature: "ingredient_conflict_check" }),
    ]);

    expect(summary.totalCalls).toBe(4);
    expect(summary.succeeded).toBe(2);
    expect(summary.fallbacksUsed).toBe(1);
    expect(summary.safetyRejections).toBe(1);
    expect(summary.totalTokens).toBe(4 * 300);
    expect(summary.avgLatencyMs).toBeGreaterThan(0);
    expect(summary.p95LatencyMs).toBeGreaterThanOrEqual(summary.avgLatencyMs);
  });

  it("groups usage by model and feature, most frequent first", () => {
    const summary = summarizeTelemetry([
      interaction({}),
      interaction({}),
      interaction({ modelId: "muse-image", feature: "hair_guidance" }),
    ]);
    expect(summary.byModel[0].model).toBe("muse-spark-1.3");
    expect(summary.byModel[0].calls).toBe(2);
    expect(summary.byFeature[0]).toEqual({ feature: "coach_chat", calls: 2 });
    expect(summary.recent).toHaveLength(3);
  });

  it("handles an empty interaction log", () => {
    const summary = summarizeTelemetry([]);
    expect(summary.totalCalls).toBe(0);
    expect(summary.estimatedCostUsd).toBe(0);
    expect(summary.budgetRemainingUsd).toBe(150);
    expect(summary.byModel).toEqual([]);
  });

  it("prefers stored estimated costs when present", () => {
    const summary = summarizeTelemetry([
      interaction({ estimatedCostUsd: 0.25, inputTokens: 999999 }),
    ]);
    expect(summary.estimatedCostUsd).toBe(0.25);
  });
});

describe("Judge demo action catalog", () => {
  it("covers the five 1-click judge flows (a–e)", () => {
    expect(DEMO_ACTIONS.map((a) => a.id)).toEqual([
      "login",
      "roadmap",
      "conflict",
      "barber",
      "cutout",
    ]);
  });

  it("routes each action to its real API endpoint and model", () => {
    const byId = Object.fromEntries(DEMO_ACTIONS.map((a) => [a.id, a]));
    expect(byId.login.endpoint).toBe("/api/v1/me");
    expect(byId.roadmap.endpoint).toBe("/api/v1/roadmaps");
    expect(byId.roadmap.model).toBe("muse-spark-1.3");
    expect(byId.conflict.model).toBe("muse-wonder");
    expect(byId.barber.model).toBe("muse-image");
    expect(byId.cutout.model).toBe("sam-3.1");
    expect(byId.cutout.endpoint).toBe("/api/v1/wardrobe/cutout");
  });

  it("every action has bilingual labels", () => {
    for (const action of DEMO_ACTIONS) {
      expect(action.labelEn.length).toBeGreaterThan(3);
      expect(action.labelBn.length).toBeGreaterThan(3);
    }
  });
});
