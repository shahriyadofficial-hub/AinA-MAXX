// tests/unit/shoppable-lookbook.test.ts
import { describe, it, expect } from "vitest";
import {
  LOOKBOOK_ITEMS,
  clampHotspotPercent,
  computeBundleSummary,
  findProduct,
  formatLookBdt,
  hotspotForProduct,
} from "@/lib/fashion/lookbook";
import {
  DEMO_WARDROBE,
  analyseCapsuleGaps,
  buildOccasionCombo,
  costPerWearBDT,
  countPossibleOutfits,
} from "@/lib/fashion/wardrobe";

describe("Shoppable Lookbook data contracts (Try the Look)", () => {
  it("ships at least 3 looks, each with hotspots bound to real products", () => {
    expect(LOOKBOOK_ITEMS.length).toBeGreaterThanOrEqual(3);
    for (const look of LOOKBOOK_ITEMS) {
      expect(look.title).toMatch(/^\d{2}\s/); // "04 Studio Day" numbering
      expect(look.titleBn).toBeTruthy();
      expect(look.bundleDiscountPercent).toBeGreaterThan(0);
      expect(look.products.length).toBeGreaterThanOrEqual(3);
      expect(look.hotspots.length).toBe(look.products.length);
      for (const hotspot of look.hotspots) {
        expect(findProduct(look, hotspot.productId)).toBeDefined();
        expect(hotspot.xPercent).toBeGreaterThanOrEqual(0);
        expect(hotspot.xPercent).toBeLessThanOrEqual(100);
        expect(hotspot.yPercent).toBeGreaterThanOrEqual(0);
        expect(hotspot.yPercent).toBeLessThanOrEqual(100);
        expect(hotspot.label).toBeTruthy();
      }
      for (const product of look.products) {
        expect(product.priceBDT).toBeGreaterThan(0);
        expect(product.availableSizes.length).toBeGreaterThan(0);
        expect(hotspotForProduct(look, product.id)).toBeDefined();
      }
    }
  });

  it("applies the bundle discount only for a full look", () => {
    const look = LOOKBOOK_ITEMS[0];
    const all = new Set(look.products.map((p) => p.id));
    const full = computeBundleSummary(look, all);
    expect(full.isFullLook).toBe(true);
    expect(full.discountPercent).toBe(look.bundleDiscountPercent);
    expect(full.totalBDT).toBe(full.subtotalBDT - full.discountBDT);
    expect(full.discountBDT).toBeGreaterThan(0);

    const partial = computeBundleSummary(look, new Set([look.products[0].id]));
    expect(partial.isFullLook).toBe(false);
    expect(partial.discountBDT).toBe(0);
    expect(partial.totalBDT).toBe(look.products[0].priceBDT);

    const empty = computeBundleSummary(look, new Set<string>());
    expect(empty.totalBDT).toBe(0);
    expect(empty.itemCount).toBe(0);
  });

  it("clamps hotspot coordinates into the safe 4–96% band", () => {
    expect(clampHotspotPercent(-10)).toBe(4);
    expect(clampHotspotPercent(140)).toBe(96);
    expect(clampHotspotPercent(45)).toBe(45);
    expect(clampHotspotPercent(Number.NaN)).toBe(50);
  });

  it("formats BDT with en-IN grouping", () => {
    expect(formatLookBdt(12100)).toBe("৳12,100");
    expect(formatLookBdt(950)).toBe("৳950");
  });
});

describe("Capsule gap & wardrobe matching", () => {
  it("computes cost-per-wear with a divide-by-zero guard", () => {
    expect(costPerWearBDT({ priceBDT: 2450, wears: 14 })).toBe(175);
    expect(costPerWearBDT({ priceBDT: 1800, wears: 0 })).toBe(1800);
  });

  it("flags thin/gap categories against the Dhaka lean capsule", () => {
    const gaps = analyseCapsuleGaps(DEMO_WARDROBE);
    expect(gaps).toHaveLength(5);
    const shoes = gaps.find((g) => g.category === "shoes");
    expect(shoes?.status).toBe("thin"); // 1 owned, 2 recommended
    const outerwear = gaps.find((g) => g.category === "outerwear");
    expect(outerwear?.status).toBe("covered");
  });

  it("builds occasion combos from owned items and reports readiness", () => {
    const monsoon = buildOccasionCombo(DEMO_WARDROBE, "monsoon");
    expect(monsoon.slots.length).toBeGreaterThan(0);
    expect(monsoon.readyPercent).toBeGreaterThan(0);
    expect(monsoon.readyPercent).toBeLessThanOrEqual(100);
    expect(countPossibleOutfits(DEMO_WARDROBE)).toBeGreaterThan(0);
  });
});
