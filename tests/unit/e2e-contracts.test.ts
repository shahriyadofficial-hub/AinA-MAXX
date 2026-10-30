// tests/unit/e2e-contracts.test.ts
import { describe, it, expect } from "vitest";
import { DEMO_ACTIONS, summarizeTelemetry } from "@/lib/telemetry/telemetry";
import { getCuratedFallbackRoadmap } from "@/lib/roadmap/fallback";
import { analyzeIngredientConflicts, generateBarberCard } from "@/lib/ai/router";
import { runSafetyScreen } from "@/lib/ai/safety";
import { moderateVibePost, SHOP_PRODUCTS } from "@/lib/gamification/maxx";

describe("E2E Integration & Judge Demo Verification", () => {
  it("verifies all 5 Judge Demo actions are configured with valid endpoints and payloads", () => {
    expect(DEMO_ACTIONS).toHaveLength(5);
    const ids = DEMO_ACTIONS.map(a => a.id);
    expect(ids).toContain("login");
    expect(ids).toContain("roadmap");
    expect(ids).toContain("conflict");
    expect(ids).toContain("barber");
    expect(ids).toContain("cutout");

    for (const action of DEMO_ACTIONS) {
      expect(action.endpoint.startsWith("/api/v1/")).toBe(true);
      expect(action.labelEn).toBeDefined();
      expect(action.labelBn).toBeDefined();
    }
  });

  it("verifies Live Roadmap Fallback generation preserves zero attractiveness scoring", () => {
    const roadmap = getCuratedFallbackRoadmap();
    expect(roadmap.durationDays).toBe(30);
    expect(roadmap.tasks.length).toBeGreaterThanOrEqual(7);
    const screen = runSafetyScreen(JSON.stringify(roadmap));
    expect(screen.passed).toBe(true);
  });

  it("verifies muse-wonder conflict detection for Retinol + Salicylic Acid", async () => {
    const res = await analyzeIngredientConflicts(
      "The Ordinary Retinol 0.5% in Squalane",
      "Minimalist Salicylic Acid 2% Serum"
    );
    expect(res.data.isConflict).toBe(true);
    expect(res.data.severity).toBe("medium");
    expect(res.data.conflictingIngredients).toContain("Retinol");
  });

  it("verifies muse-image Barber Card generation contract", async () => {
    const res = await generateBarberCard({
      desiredStyle: "Textured Crop + Low Skin Fade",
      locale: "en",
    });
    expect(res.data.styleNameEn).toBeDefined();
    expect(res.data.instructionsEn.length).toBeGreaterThan(0);
    expect(res.data.instructionsBn.length).toBeGreaterThan(0);
  });

  it("verifies community moderation blocks looksmax/facial ratings", () => {
    const res = moderateVibePost("Rate my face 8/10 please");
    expect(res.status).toBe("rejected");
    expect(res.reason).toContain("effort-only");
  });

  it("verifies shop catalog has full Bangladeshi & global BDT products", () => {
    expect(SHOP_PRODUCTS.length).toBeGreaterThanOrEqual(12);
    expect(SHOP_PRODUCTS.every(p => p.priceBdt > 0)).toBe(true);
  });

  it("verifies telemetry HUD aggregation respects $150 Meta credit ceiling", () => {
    const hud = summarizeTelemetry([
      {
        feature: "roadmap_generation",
        modelId: "muse-spark-1.3",
        provider: "meta_model_api",
        status: "succeeded",
        latencyMs: 1200,
        inputTokens: 500,
        outputTokens: 1200,
        createdAt: new Date().toISOString(),
      },
    ]);
    expect(hud.budgetUsd).toBe(150);
    expect(hud.estimatedCostUsd).toBeLessThan(1.0);
    expect(hud.budgetRemainingUsd).toBeGreaterThan(149.0);
  });
});
