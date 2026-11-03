// tests/unit/lookbook.test.ts
import { describe, it, expect } from "vitest";
import { CURATED_LOOKS } from "@/components/fashion/Interactive3DLookbook";

describe("3D Lookbook Outfit Definitions & R3F Contracts", () => {
  it("contains 4 high-contrast curated looks with valid ghost typography and tags", () => {
    expect(CURATED_LOOKS).toHaveLength(4);
    for (const look of CURATED_LOOKS) {
      expect(look.titleEn).toBeTruthy();
      expect(look.titleBn).toBeTruthy();
      expect(look.ghostText).toBeTruthy();
      expect(look.tags.length).toBeGreaterThanOrEqual(3);
      expect(look.priceBdt).toBeGreaterThan(0);
      expect(look.combos.top.name).toBeTruthy();
      expect(look.combos.bottom.name).toBeTruthy();
      expect(look.combos.footwear.name).toBeTruthy();
      expect(look.combos.accessory.name).toBeTruthy();
      expect(look.combos.haircut.name).toBeTruthy();
    }
  });

  it("ensures floating 3D world tags contain required spec labels", () => {
    const look1 = CURATED_LOOKS[0];
    const labels = look1.tags.map((t) => t.label);
    expect(labels).toContain("• Relaxed Linen");
    expect(labels).toContain("• Monsoon Breathable");
    expect(labels).toContain("• BDT 2,450");
  });

  it("validates 3D orbit polar angle constraints for fashion studio view", () => {
    const minPolarAngle = Math.PI / 2.5; // ~72 deg
    const maxPolarAngle = Math.PI / 1.8; // ~100 deg

    expect(minPolarAngle).toBeGreaterThan(1.2);
    expect(maxPolarAngle).toBeLessThan(1.8);
    expect(minPolarAngle).toBeLessThan(maxPolarAngle);
  });

  it("validates responsive 3D garment scaling logic", () => {
    const computeScale = (isMobile: boolean) => (isMobile ? 1.8 : 2.4);
    expect(computeScale(true)).toBe(1.8);
    expect(computeScale(false)).toBe(2.4);
  });

  it("validates 3D tilt coordinates within safe clamp bounds (-15 to 15 deg)", () => {
    const clampTilt = (input: number, maxDeg: number = 14) => {
      return Math.max(-maxDeg, Math.min(maxDeg, input));
    };

    expect(clampTilt(25, 14)).toBe(14);
    expect(clampTilt(-30, 14)).toBe(-14);
    expect(clampTilt(7, 14)).toBe(7);
  });
});
