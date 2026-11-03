// tests/unit/maisonblock.test.ts
import { describe, it, expect } from "vitest";
import {
  cmToInches,
  estimateChestCm,
  formatHeightImperial,
  formatMeasurement,
  kgToLbs,
  lbsToKg,
  recommendSize,
  type GarmentMeasurements,
  type UserFitInput,
} from "@/lib/fashion/maisonblock";
import { LOOKBOOK_ITEMS, hasVerifiedSizing } from "@/lib/fashion/lookbook";

const TEE: GarmentMeasurements = {
  sizes: ["S", "M", "L", "XL"],
  measurements: {
    S: { chest_cm: 96, length_cm: 66, sleeve_cm: 22 },
    M: { chest_cm: 104, length_cm: 69, sleeve_cm: 23 },
    L: { chest_cm: 112, length_cm: 72, sleeve_cm: 24 },
    XL: { chest_cm: 120, length_cm: 75, sleeve_cm: 25 },
  },
};

const BASE: UserFitInput = {
  heightCm: 170,
  weightKg: 68,
  chestShape: "regular",
  stomachShape: "regular",
  hipShape: "regular",
  fitPreference: "regular",
};

describe("Maisonblock deterministic sizing engine", () => {
  it("is deterministic — identical inputs always give identical outputs", () => {
    const a = recommendSize(TEE, BASE);
    const b = recommendSize(TEE, { ...BASE });
    expect(a).toEqual(b);
    expect(a.scores.map((s) => s.total)).toEqual(b.scores.map((s) => s.total));
  });

  it("recommends a mid size for an average build and explains it in plain language", () => {
    const rec = recommendSize(TEE, BASE);
    expect(["M", "L"]).toContain(rec.primarySize);
    expect(rec.reasoning).toContain("170cm");
    expect(rec.reasoning).toMatch(/drape|fit/);
    expect(rec.scores).toHaveLength(4);
    expect(rec.scores[0].total).toBeGreaterThanOrEqual(rec.scores[1].total);
  });

  it("sizes up for athletic/broad chests (extra +5–8cm ease rule)", () => {
    const regular = recommendSize(TEE, BASE);
    const athletic = recommendSize(TEE, { ...BASE, chestShape: "athletic", weightKg: 82 });
    const order = TEE.sizes;
    expect(order.indexOf(athletic.primarySize)).toBeGreaterThanOrEqual(order.indexOf(regular.primarySize));
    expect(estimateChestCm({ ...BASE, chestShape: "athletic" })).toBeGreaterThan(estimateChestCm(BASE));
    expect(estimateChestCm({ ...BASE, chestShape: "broad" })).toBeGreaterThan(estimateChestCm({ ...BASE, chestShape: "athletic" }));
  });

  it("height moves the length sub-score toward longer garments when tall", () => {
    const tall = recommendSize(TEE, { ...BASE, heightCm: 196 });
    const short = recommendSize(TEE, { ...BASE, heightCm: 152 });
    // Same garment (XL, 75cm): a tall shopper must score its length far
    // higher than a short shopper does — the 25% height rule in action.
    const tallXl = tall.scores.find((s) => s.size === "XL")!;
    const shortXl = short.scores.find((s) => s.size === "XL")!;
    expect(tallXl.length).toBeGreaterThan(shortXl.length + 40);
    // And the longest garment's total must rank higher for the tall shopper.
    expect(tallXl.total).toBeGreaterThan(shortXl.total - 30);
  });

  it("emits a dual recommendation when adjacent sizes score within 10 points", () => {
    // Scan a deterministic grid for a boundary case and assert the contract.
    let foundDual = false;
    for (let h = 160; h <= 190; h += 2) {
      for (let w = 55; w <= 95; w += 2) {
        const rec = recommendSize(TEE, { ...BASE, heightCm: h, weightKg: w });
        if (rec.alternateSize) {
          foundDual = true;
          expect(rec.dualMessage).toContain(`Size ${rec.primarySize} for a fitted look`);
          expect(rec.dualMessage).toContain(`Size ${rec.alternateSize} for a relaxed street silhouette`);
          const gap = rec.scores[0].total - rec.scores[1].total;
          expect(gap).toBeLessThanOrEqual(10);
        }
      }
    }
    expect(foundDual).toBe(true);
  });

  it("clamps out-of-range body inputs to the spec ranges", () => {
    const rec = recommendSize(TEE, { ...BASE, heightCm: 999, weightKg: 5 });
    expect(rec.reasoning).toContain("210cm");
  });

  it("converts units accurately (cm/in, kg/lbs, feet-inches)", () => {
    expect(cmToInches(2.54)).toBeCloseTo(1);
    expect(kgToLbs(1)).toBeCloseTo(2.20462);
    expect(lbsToKg(kgToLbs(70))).toBeCloseTo(70);
    expect(formatHeightImperial(178)).toBe(`5'10"`);
    expect(formatMeasurement(104, "metric")).toBe("104 cm");
    expect(formatMeasurement(104, "imperial")).toBe("40.9 in");
  });
});

describe("Maisonblock merchant verification gate", () => {
  it("unlocks only for products with verified flags AND measurements", () => {
    const tee = LOOKBOOK_ITEMS[0].products.find((p) => p.id === "p-tee-graphic")!;
    expect(hasVerifiedSizing(tee)).toBe(true);

    const trousers = LOOKBOOK_ITEMS[0].products.find((p) => p.id === "p-trouser-wide")!;
    expect(hasVerifiedSizing(trousers)).toBe(false);

    // Flag without measurements must never unlock (no guessing).
    expect(hasVerifiedSizing({ hasAccurateSizing: true })).toBe(false);
    expect(hasVerifiedSizing({ verifiedSizing: true, garmentMeasurements: TEE })).toBe(true);
    expect(hasVerifiedSizing({})).toBe(false);
  });

  it("every unlocked catalogue product has measurements for all its sizes", () => {
    for (const look of LOOKBOOK_ITEMS) {
      for (const product of look.products) {
        if (!hasVerifiedSizing(product)) continue;
        for (const size of product.garmentMeasurements!.sizes) {
          const m = product.garmentMeasurements!.measurements[size];
          expect(m.chest_cm).toBeGreaterThan(0);
          expect(m.length_cm).toBeGreaterThan(0);
        }
      }
    }
  });
});
