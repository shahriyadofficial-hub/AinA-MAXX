// tests/unit/ai-adapter.test.ts
import { describe, it, expect } from "vitest";
import {
  RoadmapDraftSchema,
  SkinGuidanceSchema,
  IngredientConflictSchema,
} from "@/lib/ai/types";
import { runSafetyScreen, assertSafePrompt } from "@/lib/ai/safety";
import { computeCacheKey, setCachedAiResponse, getCachedAiResponse } from "@/lib/ai/cache";
import { getCuratedFallbackRoadmap, analyzeIngredientConflicts } from "@/lib/ai/router";

describe("AinA AI Types & Zod Schemas", () => {
  it("validates a compliant 30-day roadmap draft", () => {
    const validRoadmap = {
      title: "Monsoon Barrier Reset",
      summary: "30-day roadmap for oily and dehydrated skin in Dhaka climate.",
      durationDays: 30,
      tasks: [
        {
          day: 1,
          category: "skin",
          title: "AM Gentle Cleanse",
          instructions: "Cleanse with lukewarm water.",
          estimatedMinutes: 2,
          isRestDay: false,
          needsProfessional: false,
        },
        {
          day: 2,
          category: "skin",
          title: "AM SPF 50 Application",
          instructions: "Apply two finger lengths of sunscreen.",
          estimatedMinutes: 3,
          isRestDay: false,
          needsProfessional: false,
        },
        {
          day: 3,
          category: "hair",
          title: "Scalp Clarifying Wash",
          instructions: "Clarify with ACV shampoo.",
          estimatedMinutes: 5,
          isRestDay: false,
          needsProfessional: false,
        },
        {
          day: 4,
          category: "habit",
          title: "Hydration check",
          instructions: "Drink 2.5L water.",
          estimatedMinutes: 1,
          isRestDay: false,
          needsProfessional: false,
        },
        {
          day: 5,
          category: "grooming",
          title: "Beard trim",
          instructions: "Tidy up beard neckline.",
          estimatedMinutes: 10,
          isRestDay: false,
          needsProfessional: false,
        },
        {
          day: 6,
          category: "fitness",
          title: "Core mobility",
          instructions: "15 min stretch.",
          estimatedMinutes: 15,
          isRestDay: false,
          needsProfessional: false,
        },
        {
          day: 7,
          category: "habit",
          title: "Weekly rest",
          instructions: "Rest and reflect.",
          estimatedMinutes: 5,
          isRestDay: true,
          needsProfessional: false,
        },
      ],
    };

    const res = RoadmapDraftSchema.safeParse(validRoadmap);
    expect(res.success).toBe(true);
  });

  it("validates skin guidance schema without attractiveness scores", () => {
    const validGuidance = {
      skinType: "combination",
      faceShape: "oval",
      hairTexture: "wavy",
      hydrationLevel: "balanced",
      primaryConcerns: ["excess sebum in T-zone", "mild dehydration"],
      recommendedFocus: "Gentle foaming cleanser and lightweight water gel moisturizer.",
      confidence: 0.92,
      safetyNote: "Educational guidance only.",
    };

    const res = SkinGuidanceSchema.safeParse(validGuidance);
    expect(res.success).toBe(true);
  });

  it("validates ingredient conflict schema", () => {
    const validConflict = {
      isConflict: true,
      severity: "medium",
      conflictingIngredients: ["Retinol", "Salicylic Acid"],
      explanationEn: "Layering both together can cause skin irritation.",
      explanationBn: "দুটো উপাদান একসাথে ব্যবহার করলে ত্বকে জ্বালাপোড়া হতে পারে।",
      climateAdvice: "Alternate usage on different nights.",
    };

    const res = IngredientConflictSchema.safeParse(validConflict);
    expect(res.success).toBe(true);
  });
});

describe("Deterministic Safety Filters", () => {
  it("intercepts attractiveness scores and looksmaxxing terminology", () => {
    const textWithScore = "Your face rating is 7/10 and looksmax score is high.";
    const result = runSafetyScreen(textWithScore);

    expect(result.passed).toBe(false);
    expect(result.flags.length).toBeGreaterThan(0);
    expect(result.sanitizedText).not.toContain("7/10");
    expect(result.sanitizedText).not.toContain("looksmax");
  });

  it("throws on unsafe user prompt containing face scoring requests", () => {
    expect(() => {
      assertSafePrompt("Rate my attractiveness on a scale of 1 to 10");
    }).toThrow(/Attractiveness ratings and face scoring/i);
  });

  it("passes safe skin barrier health prompts without flags", () => {
    const safeText = "How do I protect my skin barrier during Dhaka's humid summer?";
    const result = runSafetyScreen(safeText);

    expect(result.passed).toBe(true);
    expect(result.flags).toHaveLength(0);
  });
});

describe("Disk Cache ($150 Credit Protection)", () => {
  it("computes deterministic SHA-256 cache keys", () => {
    const key1 = computeCacheKey("muse-spark-1.3", "system prompt", "user query");
    const key2 = computeCacheKey("muse-spark-1.3", "system prompt", "user query");
    const key3 = computeCacheKey("muse-wonder", "system prompt", "user query");

    expect(key1).toBe(key2);
    expect(key1).not.toBe(key3);
  });

  it("stores and retrieves cached AI responses from disk", () => {
    const testKey = "test-credit-preservation-key";
    const testPayload = { message: "Safe cached response", tokens: 42 };

    setCachedAiResponse(testKey, testPayload);
    const retrieved = getCachedAiResponse(testKey);

    expect(retrieved).toEqual(testPayload);
  });
});

describe("AI Router Logic", () => {
  it("ensures curated fallback roadmap is 100% compliant with RoadmapDraftSchema", () => {
    const fallback = getCuratedFallbackRoadmap();
    const parseRes = RoadmapDraftSchema.safeParse(fallback);
    expect(parseRes.success).toBe(true);
    expect(fallback.tasks.length).toBeGreaterThanOrEqual(7);
  });

  it("identifies Retinol + Acid conflicts deterministically", async () => {
    const res = await analyzeIngredientConflicts("The Ordinary Retinol 0.5%", "Minimalist Salicylic Acid 2%");
    expect(res.data.isConflict).toBe(true);
    expect(res.data.severity).toBe("medium");
    expect(res.data.conflictingIngredients).toContain("Retinol");
  });
});
