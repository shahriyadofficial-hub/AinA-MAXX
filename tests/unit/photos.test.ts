// tests/unit/photos.test.ts
// Real-photography catalog contract: every wired photo must be a verified
// Unsplash CDN entry with usable alt text and provenance. This guards the
// showcase against dead stock links and accidental AI/vector placeholders.
import { describe, expect, it } from "vitest";
import {
  ALL_PHOTOS,
  GARMENT_PHOTO_SET,
  MODEL_PHOTOS,
  PRODUCT_PHOTOS,
  photoUrl,
  portraitUrl,
  squareUrl,
} from "@/lib/media/photos";

describe("Stock photo catalog (Unsplash, copyright-free)", () => {
  it("ships a rich editorial + product catalog with unique IDs", () => {
    expect(ALL_PHOTOS.length).toBeGreaterThanOrEqual(30);
    const ids = ALL_PHOTOS.map((photo) => photo.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(GARMENT_PHOTO_SET.length).toBeGreaterThanOrEqual(6);
  });

  it("every entry is a well-formed Unsplash photo with alt + credit", () => {
    for (const photo of ALL_PHOTOS) {
      expect(photo.id).toMatch(/^photo-\d{10,}-[a-z0-9]{8,}$/i);
      expect(photo.alt.length).toBeGreaterThan(12);
      expect(photo.credit.length).toBeGreaterThan(2);
      expect(photo.page.startsWith("https://unsplash.com/photos/")).toBe(true);
      // Alt text describes garments/scenes — never a rating of a person.
      expect(photo.alt.toLowerCase()).not.toMatch(/attractive|handsome score|rating/);
    }
  });

  it("builds sized CDN URLs for hero, portrait and square crops", () => {
    const hero = MODEL_PHOTOS.heroPortrait;
    expect(photoUrl(hero)).toContain("images.unsplash.com/photo-1506794778202-cad84cf45f1d");
    expect(photoUrl(hero, 640)).toContain("w=640");
    expect(portraitUrl(hero)).toContain("ar=4:5");
    expect(squareUrl(PRODUCT_PHOTOS.watchSteel)).toContain("ar=1:1");
    for (const url of [photoUrl(hero), portraitUrl(hero), squareUrl(hero)]) {
      expect(url).toContain("auto=format");
      expect(url).toContain("fit=crop");
      expect(url).not.toContain("data:image");
    }
  });

  it("keeps model and product sets disjoint so surfaces never cross-wire", () => {
    const modelIds = new Set(Object.values(MODEL_PHOTOS).map((photo) => photo.id));
    for (const photo of Object.values(PRODUCT_PHOTOS)) {
      expect(modelIds.has(photo.id)).toBe(false);
    }
  });
});
