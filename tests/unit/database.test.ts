import { describe, it, expect } from "vitest";
import { PRODUCTS_SEED, ROUTINES_SEED, LOOKBOOK_OUTFITS_SEED } from "@/prisma/seed";

describe("AinA Database Seed Data Integrity", () => {
  it("contains exactly 12 verified Bangladeshi & global products with BDT prices", () => {
    expect(PRODUCTS_SEED).toHaveLength(12);
    for (const product of PRODUCTS_SEED) {
      expect(product.slug).toBeTruthy();
      expect(product.name).toBeTruthy();
      expect(product.currencyCode).toBe("BDT");
      expect(product.currentPrice).toBeGreaterThan(0);
      expect(product.isPublished).toBe(true);
      expect(["skincare", "haircare", "grooming"]).toContain(product.category);
    }
  });

  it("contains 4 curated routines with valid steps and safety notes", () => {
    expect(ROUTINES_SEED).toHaveLength(4);
    for (const routine of ROUTINES_SEED) {
      expect(routine.title).toBeTruthy();
      expect(routine.steps.length).toBeGreaterThanOrEqual(3);
      expect(routine.safetyNotes).toBeTruthy();
      expect(["skin", "hair"]).toContain(routine.category);
    }
  });

  it("contains 4 Lookbook curated outfits", () => {
    expect(LOOKBOOK_OUTFITS_SEED).toHaveLength(4);
    for (const outfit of LOOKBOOK_OUTFITS_SEED) {
      expect(outfit.title).toBeTruthy();
      expect(outfit.occasion).toBeTruthy();
      expect(outfit.notes).toBeTruthy();
    }
  });
});
