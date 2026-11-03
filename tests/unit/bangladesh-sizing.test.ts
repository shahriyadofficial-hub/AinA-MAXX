// tests/unit/bangladesh-sizing.test.ts
// AinA Universal Fit (Bangladesh Edition) — deterministic engine tests.
import { describe, expect, it } from "vitest";
import {
  LOCAL_BRAND_CHARTS,
  cmToInches,
  effectiveChestInches,
  formatHeightImperial,
  garmentTypeForProduct,
  brandChartForProduct,
  heightToInches,
  inchesToCm,
  recommendAcrossBrands,
  targetEaseInches,
  toBengaliDigits,
  type UserBodyProfileInput,
} from "@/lib/engine/bangladeshSizing";

const BASE: UserBodyProfileInput = {
  heightInches: 67,
  weightKg: 68,
  chestInches: 40,
  waistInches: 33,
  fitPreference: "SEMI_FIT",
  bodyComposition: "REGULAR",
};

describe("unit conversion (tailor defaults)", () => {
  it("converts inches ↔ cm losslessly at tailor precision", () => {
    expect(inchesToCm(40)).toBe(101.6);
    expect(cmToInches(101.6)).toBe(40);
    expect(inchesToCm(38)).toBe(96.5);
  });

  it("formats height the way Dhaka tailors say it", () => {
    expect(formatHeightImperial(68)).toBe(`5'8"`);
    expect(formatHeightImperial(67)).toBe(`5'7"`);
    expect(heightToInches(5, 8)).toBe(68);
  });

  it("renders Bengali digits for Bangla verdicts", () => {
    expect(toBengaliDigits("40")).toBe("৪০");
    expect(toBengaliDigits(38)).toBe("৩৮");
    expect(toBengaliDigits("Size 42")).toBe("Size ৪২");
  });
});

describe("humid-climate ease model", () => {
  it("panjabi ease ladder matches the spec", () => {
    expect(targetEaseInches("PANJABI", "SLIM_FIT")).toBe(1.5);
    expect(targetEaseInches("PANJABI", "SEMI_FIT")).toBe(3.0);
    expect(targetEaseInches("PANJABI", "REGULAR")).toBe(4.0);
  });

  it("oversized tees get the drop-shoulder offset", () => {
    expect(targetEaseInches("OVERSIZED_TEE", "RELAXED_OVERSIZED")).toBe(5.5);
    expect(targetEaseInches("OVERSIZED_TEE", "SEMI_FIT")).toBe(5.5);
    expect(targetEaseInches("OVERSIZED_TEE", "SLIM_FIT")).toBe(4.0);
  });
});

describe("seeded brand charts (spec baselines)", () => {
  it("Aarong panjabi rows match the spec exactly", () => {
    const aarong = LOCAL_BRAND_CHARTS.filter((c) => c.brandName === "Aarong" && c.garmentType === "PANJABI");
    expect(aarong.map((c) => [c.sizeLabel, c.chestMinIn, c.chestMaxIn, c.lengthInches])).toEqual([
      ["38", 38, 39, 40],
      ["40", 40, 41, 41],
      ["42", 42, 43, 42],
      ["44", 44, 45, 43],
    ]);
  });

  it("Sailor/Yellow and F-Commerce rows match the spec", () => {
    const sailor = LOCAL_BRAND_CHARTS.filter((c) => c.brandName === "Sailor / Yellow");
    expect(sailor.map((c) => c.sizeLabel)).toEqual(["M", "L", "XL"]);
    expect(sailor[0]).toMatchObject({ chestMinIn: 39, chestMaxIn: 40, lengthInches: 28 });
    const fc = LOCAL_BRAND_CHARTS.filter((c) => c.brandName === "Local Streetwear / F-Commerce");
    expect(fc.map((c) => [c.sizeLabel, c.chestMinIn, c.chestMaxIn])).toEqual([
      ["M", 40, 42],
      ["L", 42, 44],
      ["XL", 44, 46],
    ]);
  });
});

describe("cross-brand recommendation", () => {
  it("chest 40 semi-fit → Aarong 40 with best confidence and bilingual verdict", () => {
    const verdicts = recommendAcrossBrands(BASE, "PANJABI");
    const aarong = verdicts.find((v) => v.brandName === "Aarong");
    expect(aarong?.sizeLabel).toBe("40");
    expect(aarong?.confidence).toBe("best");
    expect(aarong?.verdictEn).toContain("Aarong: Size 40 (Best Fit)");
    expect(aarong?.verdictEn).toContain("inches chest ease");
    expect(aarong?.verdictBn).toContain("সাইজ ৪০");
    expect(aarong?.verdictBn).toContain("সেরা ফিট");
  });

  it("the same body gets different labels at different brands (the core chaos)", () => {
    const panjabi = recommendAcrossBrands(BASE, "PANJABI")[0];
    const shirt = recommendAcrossBrands(BASE, "CASUAL_SHIRT")[0];
    const tee = recommendAcrossBrands(BASE, "OVERSIZED_TEE")[0];
    expect(panjabi.sizeLabel).toBe("40");
    expect(shirt.sizeLabel).toMatch(/^[MLX]+$/);
    expect(tee.sizeLabel).toMatch(/^[MLX]+$/);
    expect(shirt.brandName).toBe("Sailor / Yellow");
    expect(tee.brandName).toBe("Local Streetwear / F-Commerce");
  });

  it("slim fit pulls the panjabi recommendation tighter", () => {
    const slim = recommendAcrossBrands({ ...BASE, fitPreference: "SLIM_FIT" }, "PANJABI")[0];
    const regular = recommendAcrossBrands({ ...BASE, fitPreference: "REGULAR" }, "PANJABI")[0];
    expect(Number(slim.sizeLabel)).toBeLessThanOrEqual(Number(regular.sizeLabel));
  });
});

describe("body-shape modifiers", () => {
  it("ROUND_BELLY biases effective chest from the waist (navel-gap rule)", () => {
    const belly = { ...BASE, bodyComposition: "ROUND_BELLY" as const, chestInches: 38, waistInches: 40 };
    expect(effectiveChestInches(belly)).toBe(42);
    const verdict = recommendAcrossBrands(belly, "PANJABI")[0];
    expect(verdict.bellyBiased).toBe(true);
    expect(Number(verdict.sizeLabel)).toBeGreaterThanOrEqual(42);
    expect(verdict.verdictBn).toContain("পেটের মাপ");
  });

  it("regular bodies are not belly-biased", () => {
    expect(effectiveChestInches(BASE)).toBe(40);
    expect(recommendAcrossBrands(BASE, "PANJABI")[0].bellyBiased).toBe(false);
  });
});

describe("shrinkage compensation", () => {
  it("sizes up when the user sits at the top of a cotton size range", () => {
    // Chest 40.9 = top ~90% of Aarong 40's 40–41 range → wash-shrink size-up.
    const verdict = recommendAcrossBrands({ ...BASE, chestInches: 40.9 }, "PANJABI")[0];
    expect(verdict.sizedUpForShrinkage).toBe(true);
    expect(verdict.sizeLabel).toBe("42");
    expect(verdict.verdictEn).toContain("shrinkage");
  });

  it("does not size up mid-range", () => {
    const verdict = recommendAcrossBrands({ ...BASE, chestInches: 40.2 }, "PANJABI")[0];
    expect(verdict.sizedUpForShrinkage).toBe(false);
  });
});

describe("product mapping helpers", () => {
  it("maps lookbook products onto local garment types and charts", () => {
    expect(garmentTypeForProduct({ brand: "Aarong Craft", name: "Hand-Embroidered Panjabi", category: "top" })).toBe("PANJABI");
    expect(garmentTypeForProduct({ brand: "AinA Studio", name: "Oversized Graphic Tee", category: "top" })).toBe("OVERSIZED_TEE");
    expect(garmentTypeForProduct({ brand: "Dhaka Tailor Lab", name: "Wide-Leg Pleated Trousers", category: "bottom" })).toBe("TROUSER_DENIM");
    expect(brandChartForProduct("Aarong Craft")).toBe("Aarong");
    expect(brandChartForProduct("Sailor")).toBe("Sailor / Yellow");
    expect(brandChartForProduct("AinA Studio")).toBe("Local Streetwear / F-Commerce");
  });
});
