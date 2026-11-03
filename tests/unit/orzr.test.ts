// tests/unit/orzr.test.ts
// ORZR — catalog contract + rack geometry math tests.
import { describe, expect, it } from "vitest";
import {
  ORZR_CATALOG,
  clampOrzrIndex,
  orzrAnnouncement,
  orzrCounter,
  orzrItemsByCategory,
  rackTransform,
  rackTransformCss,
  snapOrzrIndex,
  wheelStep,
} from "@/lib/fashion/orzr";

describe("ORZR catalog contract", () => {
  it("ships clothing and accessory archives with complete metadata", () => {
    const clothing = orzrItemsByCategory("CLOTHING");
    const accessories = orzrItemsByCategory("ACCESSORY");
    expect(clothing.length).toBeGreaterThanOrEqual(3);
    expect(accessories.length).toBeGreaterThanOrEqual(2);
    for (const item of ORZR_CATALOG) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBe(item.name.toUpperCase());
      expect(item.number).toMatch(/^\d{2} \/ \d{2}$/);
      expect(item.description.length).toBeGreaterThan(20);
      expect(item.details.length).toBeGreaterThanOrEqual(3);
      expect(item.material.startsWith("MATERIAL: ")).toBe(true);
      expect(item.layers.base.startsWith("/assets/orzr/")).toBe(true);
      expect(item.silhouette.startsWith("data:image/svg+xml,")).toBe(true);
    }
  });

  it("includes the two spec seed items verbatim", () => {
    const shirt = ORZR_CATALOG.find((i) => i.id === "oversized-shirt");
    expect(shirt?.name).toBe("OVERSIZED SHIRT");
    expect(shirt?.number).toBe("01 / 04");
    expect(shirt?.details).toContain("100% Japanese Cotton");
    const ring = ORZR_CATALOG.find((i) => i.id === "form-ring");
    expect(ring?.name).toBe("FORM RING");
    expect(ring?.category).toBe("ACCESSORY");
    expect(ring?.details).toContain("925 Sterling Silver");
  });

  it("is strictly non-transactional: no price or cart fields anywhere", () => {
    for (const item of ORZR_CATALOG) {
      const keys = Object.keys(item).join(" ").toLowerCase();
      expect(keys).not.toMatch(/price|bdt|cart|checkout|buy/);
    }
  });

  it("numbers items sequentially within each category", () => {
    for (const category of ["CLOTHING", "ACCESSORY"] as const) {
      const items = orzrItemsByCategory(category);
      items.forEach((item, i) => {
        expect(item.number).toBe(
          `${String(i + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`
        );
      });
    }
  });
});

describe("rackTransform (page-flip geometry)", () => {
  it("centre item is flat, full scale, fully opaque", () => {
    const t = rackTransform(0);
    expect(t.rotateY).toBe(0);
    expect(t.scale).toBe(1);
    expect(t.translateZ).toBe(0);
    expect(t.opacity).toBe(1);
  });

  it("immediate neighbours match the spec flip exactly", () => {
    const left = rackTransform(-1);
    expect(left.rotateY).toBe(35);
    expect(left.scale).toBeCloseTo(0.85, 5);
    expect(left.translateZ).toBe(-80);
    expect(left.opacity).toBeCloseTo(0.4, 5);

    const right = rackTransform(1);
    expect(right.rotateY).toBe(-35);
    expect(right.scale).toBeCloseTo(0.85, 5);
    expect(right.translateZ).toBe(-80);
    expect(right.opacity).toBeCloseTo(0.4, 5);
  });

  it("interpolates smoothly at half-distance and clamps beyond neighbours", () => {
    const half = rackTransform(0.5);
    expect(half.rotateY).toBeCloseTo(-17.5, 5);
    expect(half.opacity).toBeCloseTo(0.7, 5);
    const far = rackTransform(3);
    expect(far.rotateY).toBe(-35);
    expect(far.opacity).toBeCloseTo(0.4, 5);
    expect(far.zIndex).toBeLessThan(rackTransform(0).zIndex);
  });

  it("reduced motion collapses the transform to none", () => {
    expect(rackTransformCss(1, true)).toBe("none");
    expect(rackTransformCss(0, false)).toContain("rotateY(0deg)");
    expect(rackTransformCss(-1, false)).toContain("rotateY(35deg)");
  });
});

describe("index helpers", () => {
  it("clampOrzrIndex bounds and rounds", () => {
    expect(clampOrzrIndex(-2, 4)).toBe(0);
    expect(clampOrzrIndex(9, 4)).toBe(3);
    expect(clampOrzrIndex(1.6, 4)).toBe(2);
    expect(clampOrzrIndex(Number.NaN, 4)).toBe(0);
    expect(clampOrzrIndex(1, 0)).toBe(0);
  });

  it("snapOrzrIndex rounds, flicks, and clamps", () => {
    expect(snapOrzrIndex(1.4, 0, 4)).toBe(1);
    expect(snapOrzrIndex(1.6, 0, 4)).toBe(2);
    expect(snapOrzrIndex(1.1, 0.8, 4)).toBe(2);
    expect(snapOrzrIndex(1.9, -0.8, 4)).toBe(1);
    expect(snapOrzrIndex(-3, -1, 4)).toBe(0);
    expect(snapOrzrIndex(30, 1, 4)).toBe(3);
  });

  it("wheelStep ignores small deltas and maps direction", () => {
    expect(wheelStep(4)).toBe(0);
    expect(wheelStep(120)).toBe(1);
    expect(wheelStep(-120)).toBe(-1);
  });
});

describe("announcement + counter (a11y contract)", () => {
  it("matches the spec announcement format", () => {
    const item = ORZR_CATALOG[0];
    expect(orzrAnnouncement(item, 0, 4)).toBe("Viewing item 1 of 4: OVERSIZED SHIRT");
    expect(orzrAnnouncement(item, 2, 4)).toBe("Viewing item 3 of 4: OVERSIZED SHIRT");
  });

  it("formats two-digit counters", () => {
    expect(orzrCounter(0, 4)).toBe("01 / 04");
    expect(orzrCounter(3, 4)).toBe("04 / 04");
    expect(orzrCounter(0, 3)).toBe("01 / 03");
  });
});
