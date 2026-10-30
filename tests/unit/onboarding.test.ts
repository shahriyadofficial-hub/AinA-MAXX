// tests/unit/onboarding.test.ts
import { describe, it, expect } from "vitest";
import { evaluateAgeGate } from "@/lib/auth/age-gate";
import { OnboardingPayloadSchema } from "@/lib/types/onboarding";

describe("PDPA 2026 Age Gate Logic", () => {
  const refDate = new Date("2026-10-30");

  it("strictly blocks users under 13", () => {
    // Born in 2015 -> 11 years old in 2026
    const assessment = evaluateAgeGate("2015-06-15", refDate);
    expect(assessment.status).toBe("blocked");
    expect(assessment.allowed).toBe(false);
    expect(assessment.canUploadPhotos).toBe(false);
    expect(assessment.canPersonalizeHealth).toBe(false);
    expect(assessment.messageEn).toContain("strictly prohibited");
  });

  it("routes users aged 13-17 to read-only Safe Mode", () => {
    // Born in 2011 -> 15 years old in 2026
    const assessment = evaluateAgeGate("2011-04-10", refDate);
    expect(assessment.status).toBe("safe_mode");
    expect(assessment.allowed).toBe(true);
    expect(assessment.canUploadPhotos).toBe(false);
    expect(assessment.canPersonalizeHealth).toBe(false);
    expect(assessment.messageEn).toContain("Safe Mode");
  });

  it("grants full access to adults 18 and older", () => {
    // Born in 2004 -> 22 years old in 2026
    const assessment = evaluateAgeGate("2004-01-20", refDate);
    expect(assessment.status).toBe("adult_full_access");
    expect(assessment.allowed).toBe(true);
    expect(assessment.canUploadPhotos).toBe(true);
    expect(assessment.canPersonalizeHealth).toBe(true);
  });
});

describe("Onboarding Payload Schema Validation", () => {
  it("accepts a complete, valid onboarding questionnaire submission", () => {
    const validData = {
      displayName: "Tahmid Rahman",
      birthDate: "2002-05-15",
      locale: "bn",
      goals: ["skin_barrier", "hair_volume"],
      skinType: "combination",
      hairType: "straight",
      budgetTier: "mid",
      availableMinutes: 15,
      consents: {
        photoProcessing: true,
        healthPersonalization: true,
      },
    };

    const res = OnboardingPayloadSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });

  it("rejects invalid budget tiers or empty goals", () => {
    const invalidData = {
      displayName: "Test User",
      birthDate: "2000-01-01",
      goals: [], // empty goals invalid
      budgetTier: "unlimited_luxury", // invalid tier
    };

    const res = OnboardingPayloadSchema.safeParse(invalidData);
    expect(res.success).toBe(false);
  });
});
