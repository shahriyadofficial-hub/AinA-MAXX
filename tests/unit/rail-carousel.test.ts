// tests/unit/rail-carousel.test.ts
// RAIL: 3D Virtual Hanger Carousel — pure physics/data contract tests.
import { describe, expect, it } from "vitest";
import {
  RAIL_PRODUCTS,
  centerScale,
  clampRailIndex,
  formatRailBdt,
  pendulumSwayDeg,
  railAnnouncement,
  rubberBandOffset,
  snapIndexFromOffset,
  visibleIndices,
} from "@/lib/fashion/rail";

describe("RAIL catalogue data contracts", () => {
  it("ships 6–8 streetwear products with complete HUD fields", () => {
    expect(RAIL_PRODUCTS.length).toBeGreaterThanOrEqual(6);
    expect(RAIL_PRODUCTS.length).toBeLessThanOrEqual(8);
    for (const p of RAIL_PRODUCTS) {
      expect(p.id).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.brand).toBeTruthy();
      expect(p.priceBDT).toBeGreaterThan(0);
      expect(p.microDescription.length).toBeGreaterThan(10);
      expect(p.microBn.length).toBeGreaterThan(0);
      expect(p.availableSizes.length).toBeGreaterThan(0);
      expect(p.backLabel).toBeTruthy();
      expect(p.image.startsWith("https://images.unsplash.com/")).toBe(true);
      expect(p.cutout.startsWith("data:image/svg+xml,")).toBe(true);
      expect(p.colorHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("has unique product ids", () => {
    const ids = RAIL_PRODUCTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes the spec hero product and at least one out-of-stock item", () => {
    const hoodie = RAIL_PRODUCTS.find((p) => p.title.includes("Heavyweight Oversized Hoodie"));
    expect(hoodie).toBeDefined();
    expect(hoodie?.priceBDT).toBe(3850);
    expect(RAIL_PRODUCTS.some((p) => !p.inStock)).toBe(true);
  });
});

describe("clampRailIndex", () => {
  it("clamps into [0, total-1] and rounds", () => {
    expect(clampRailIndex(-3, 7)).toBe(0);
    expect(clampRailIndex(99, 7)).toBe(6);
    expect(clampRailIndex(2.6, 7)).toBe(3);
    expect(clampRailIndex(2, 7)).toBe(2);
  });

  it("handles degenerate input", () => {
    expect(clampRailIndex(2, 0)).toBe(0);
    expect(clampRailIndex(Number.NaN, 7)).toBe(0);
  });
});

describe("rubberBandOffset", () => {
  it("passes in-bounds offsets through untouched", () => {
    expect(rubberBandOffset(3, 0, 6)).toBe(3);
    expect(rubberBandOffset(0, 0, 6)).toBe(0);
    expect(rubberBandOffset(6, 0, 6)).toBe(6);
  });

  it("compresses overshoot beyond both boundaries (diminishing resistance)", () => {
    const low = rubberBandOffset(-4, 0, 6);
    const high = rubberBandOffset(10, 0, 6);
    expect(low).toBeGreaterThan(-4);
    expect(low).toBeLessThan(0);
    expect(high).toBeGreaterThan(6);
    expect(high).toBeLessThan(10);
    // Monotonic: more pull → more offset, but always sub-linear.
    expect(rubberBandOffset(-8, 0, 6)).toBeLessThan(low);
    expect(Math.abs(rubberBandOffset(-8, 0, 6))).toBeLessThan(8);
  });

  it("is bounded even for extreme pulls", () => {
    expect(Math.abs(rubberBandOffset(-1000, 0, 6))).toBeLessThan(1000 * 0.35 + 1);
  });
});

describe("snapIndexFromOffset", () => {
  it("rounds to the nearest item", () => {
    expect(snapIndexFromOffset(2.4, 0, 7)).toBe(2);
    expect(snapIndexFromOffset(2.6, 0, 7)).toBe(3);
  });

  it("a flick advances one extra item in the flick direction", () => {
    expect(snapIndexFromOffset(2.1, 0.8, 7)).toBe(3);
    expect(snapIndexFromOffset(2.9, -0.8, 7)).toBe(2);
  });

  it("never snaps outside the catalogue", () => {
    expect(snapIndexFromOffset(-2, -1, 7)).toBe(0);
    expect(snapIndexFromOffset(20, 1, 7)).toBe(6);
  });
});

describe("pendulumSwayDeg", () => {
  it("is clamped to ±10 degrees", () => {
    expect(pendulumSwayDeg(100)).toBe(10);
    expect(pendulumSwayDeg(-100)).toBe(-10);
  });

  it("follows swipe direction and is zero at rest", () => {
    expect(pendulumSwayDeg(0)).toBe(0);
    expect(pendulumSwayDeg(1)).toBeGreaterThan(0);
    expect(pendulumSwayDeg(-1)).toBeLessThan(0);
    expect(Number.isFinite(pendulumSwayDeg(Number.NaN))).toBe(true);
    expect(pendulumSwayDeg(Number.NaN)).toBe(0);
  });
});

describe("centerScale", () => {
  it("is exactly 1.15 at the centre and 1.0 one item away", () => {
    expect(centerScale(0)).toBeCloseTo(1.15, 5);
    expect(centerScale(1)).toBeCloseTo(1.0, 5);
    expect(centerScale(-1)).toBeCloseTo(1.0, 5);
  });

  it("interpolates linearly and never exceeds the band", () => {
    expect(centerScale(0.5)).toBeCloseTo(1.075, 5);
    expect(centerScale(5)).toBeCloseTo(1.0, 5);
  });
});

describe("visibleIndices (lazy i−1, i, i+1 window)", () => {
  it("returns three indices in the middle of the rail", () => {
    expect(visibleIndices(3, 7)).toEqual([2, 3, 4]);
  });

  it("clamps at both ends of the rail", () => {
    expect(visibleIndices(0, 7)).toEqual([0, 1]);
    expect(visibleIndices(6, 7)).toEqual([5, 6]);
  });

  it("handles tiny and empty catalogues", () => {
    expect(visibleIndices(0, 1)).toEqual([0]);
    expect(visibleIndices(0, 0)).toEqual([]);
  });
});

describe("railAnnouncement (screen-reader contract)", () => {
  it("matches the exact spec format", () => {
    const p = RAIL_PRODUCTS[0];
    expect(railAnnouncement(p, 0, RAIL_PRODUCTS.length)).toBe(
      `Product 1 of ${RAIL_PRODUCTS.length}: ${p.title}, ${p.priceBDT} BDT`
    );
    expect(railAnnouncement(p, 2, 7)).toBe(`Product 3 of 7: ${p.title}, ${p.priceBDT} BDT`);
  });
});

describe("formatRailBdt", () => {
  it("formats with the taka sign and en-IN grouping", () => {
    expect(formatRailBdt(3850)).toBe("৳3,850");
    expect(formatRailBdt(125000)).toBe("৳1,25,000");
  });
});
