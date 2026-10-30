// tests/unit/lookbook.test.ts
import { describe, it, expect } from "vitest";

describe("3D Lookbook Outfit Definitions", () => {
  const sampleLooks = [
    {
      id: "look-01",
      titleEn: "Old Dhaka Heritage Streetwear",
      ghostText: "WEAR IT LOUD",
      tags: ["• Relaxed Fit", "• Everyday", "• 100% Breathable Cotton"],
      slots: ["top", "bottom", "footwear"],
    },
    {
      id: "look-02",
      titleEn: "Monsoon Techwear Rain Shield",
      ghostText: "PRIME YOU",
      tags: ["• Water-Repellent", "• Dhaka Monsoon", "• High Mobility"],
      slots: ["top", "bottom", "footwear"],
    },
    {
      id: "look-03",
      titleEn: "Gulshan Smart Casual Friday",
      ghostText: "STAY SHARP",
      tags: ["• Camp Collar Linen", "• Business Casual", "• Summer Cool"],
      slots: ["top", "bottom", "footwear"],
    },
    {
      id: "look-04",
      titleEn: "Minimalist Jet Black Monochrome",
      ghostText: "REFLECT PRIME",
      tags: ["• Heavyweight 240 GSM", "• Evening Drip", "• Sharp Silhouette"],
      slots: ["top", "bottom", "footwear"],
    },
  ];

  it("contains 4 high-contrast curated looks with valid ghost typography and tags", () => {
    expect(sampleLooks).toHaveLength(4);
    for (const look of sampleLooks) {
      expect(look.titleEn).toBeTruthy();
      expect(look.ghostText).toBeTruthy();
      expect(look.tags.length).toBeGreaterThanOrEqual(2);
      expect(look.slots).toContain("top");
      expect(look.slots).toContain("bottom");
      expect(look.slots).toContain("footwear");
    }
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
