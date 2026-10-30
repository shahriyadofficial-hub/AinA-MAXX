// tests/unit/vision.test.ts
import { describe, it, expect } from "vitest";
import { SkinGuidanceSchema, BarberCardSchema } from "@/lib/ai/types";
import {
  getFallbackSkinGuidance,
  getFallbackBarberCard,
  containsForbiddenScoring,
  VISION_SAFETY_NOTE,
} from "@/lib/ai/vision";
import { runSafetyScreen } from "@/lib/ai/safety";

describe("AinA Coded — Vision Guidance (muse-spark-1.3)", () => {
  it("fallback guidance validates against SkinGuidanceSchema", () => {
    const guidance = getFallbackSkinGuidance({ skinType: "oily", hairTexture: "curly" });
    const parsed = SkinGuidanceSchema.safeParse(guidance);
    expect(parsed.success).toBe(true);
    expect(guidance.skinType).toBe("oily");
    expect(guidance.hairTexture).toBe("curly");
    expect(guidance.faceShape).toBeTruthy();
    expect(guidance.confidence).toBeGreaterThan(0);
    expect(guidance.confidence).toBeLessThanOrEqual(1);
  });

  it("guidance contains zero attractiveness scoring fields or language", () => {
    const guidance = getFallbackSkinGuidance();
    expect(containsForbiddenScoring(guidance)).toBe(false);
    const screen = runSafetyScreen(JSON.stringify(guidance));
    expect(screen.passed).toBe(true);
    expect(guidance.safetyNote).toBe(VISION_SAFETY_NOTE);
    expect(JSON.stringify(guidance).toLowerCase()).not.toContain("attractiveness score");
    expect(JSON.stringify(guidance).toLowerCase()).not.toContain("/10");
  });

  it("rejects payloads that smuggle in scoring keys", () => {
    expect(containsForbiddenScoring({ skinType: "oily", attractivenessScore: 8 })).toBe(true);
    expect(containsForbiddenScoring({ nested: { faceRating: 7 } })).toBe(true);
    expect(containsForbiddenScoring({ skinType: "oily" })).toBe(false);
  });

  it("ignores invalid self-reported hints and stays schema-valid", () => {
    const guidance = getFallbackSkinGuidance({ skinType: "shiny", hairTexture: "spiky" });
    expect(SkinGuidanceSchema.safeParse(guidance).success).toBe(true);
    expect(guidance.skinType).toBe("combination");
    expect(guidance.hairTexture).toBe("wavy");
  });
});

describe("AinA Coded — Barber Reference Card (muse-image)", () => {
  it("fallback card validates against BarberCardSchema with bilingual steps", () => {
    const card = getFallbackBarberCard({ faceShape: "square", hairTexture: "straight" });
    const parsed = BarberCardSchema.safeParse(card);
    expect(parsed.success).toBe(true);
    expect(card.faceShape).toBe("square");
    expect(card.instructionsEn.length).toBeGreaterThanOrEqual(3);
    expect(card.instructionsBn.length).toBe(card.instructionsEn.length);
    expect(card.visualDescription.length).toBeGreaterThan(10);
  });

  it("barber card contains zero scoring language in both languages", () => {
    const card = getFallbackBarberCard();
    const screen = runSafetyScreen(JSON.stringify(card));
    expect(screen.passed).toBe(true);
    expect(containsForbiddenScoring(card)).toBe(false);
  });

  it("card keeps the hairline natural and fade practical for humidity", () => {
    const card = getFallbackBarberCard();
    const allText = [...card.instructionsEn, card.maintenanceEn].join(" ").toLowerCase();
    expect(allText).toContain("natural");
    expect(card.fadeType.toLowerCase()).toContain("fade");
    expect(card.topLength).toBeTruthy();
    expect(card.sidesLength).toBeTruthy();
  });
});
