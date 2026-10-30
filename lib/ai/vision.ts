// lib/ai/vision.ts
import type { SkinGuidance, BarberCard } from "@/lib/ai/types";

export const VISION_SAFETY_NOTE =
  "Educational guidance only. Not medical diagnosis. Focuses on skin barrier health, grooming consistency, and personal style — never face scoring or ranking.";

/**
 * Deterministic, schema-compliant fallback used when the live vision provider
 * is unavailable (offline demo, quota backoff, or cached test mode). It never
 * emits attractiveness scores, face ratings, or clinical diagnoses.
 */
export function getFallbackSkinGuidance(hint?: {
  skinType?: string;
  hairTexture?: string;
}): SkinGuidance {
  const skinType = (["oily", "dry", "combination", "sensitive", "normal"] as const).includes(
    hint?.skinType as never
  )
    ? (hint?.skinType as SkinGuidance["skinType"])
    : "combination";

  const hairTexture = (["straight", "wavy", "curly", "coily", "thinning"] as const).includes(
    hint?.hairTexture as never
  )
    ? (hint?.hairTexture as NonNullable<SkinGuidance["hairTexture"]>)
    : "wavy";

  return {
    skinType,
    faceShape: "oval",
    hairTexture,
    hydrationLevel: "balanced",
    primaryConcerns: [
      "T-zone shine in Dhaka humidity",
      "Mild dehydration from sun and dust",
      "Scalp freshness between washes",
    ],
    recommendedFocus:
      "Gentle soap-free cleansing, lightweight water-gel hydration, and daily SPF 50+ reapplied outdoors. Keep hair washed on a steady rhythm and avoid heavy oils on the scalp in humid weather.",
    confidence: 0.86,
    safetyNote: VISION_SAFETY_NOTE,
  };
}

export function getFallbackBarberCard(guidance?: Partial<SkinGuidance>): BarberCard {
  const faceShape = guidance?.faceShape ?? "oval";
  const hairTexture = guidance?.hairTexture ?? "wavy";

  return {
    styleNameEn: "Textured Crop with Low Skin Fade",
    styleNameBn: "লো স্কিন ফেডসহ টেক্সচার্ড ক্রপ",
    faceShape,
    hairTexture,
    topLength: "3–5 cm on top, textured and forward",
    sidesLength: "Low skin fade, blended from 0 to guard 2",
    fadeType: "Low skin fade — soft, natural blend",
    instructionsEn: [
      "Show this card and the reference visual to your barber before the cut starts.",
      "Keep 3–5 cm on top with point-cut texture; push the fringe slightly forward.",
      "Blend a low skin fade on the sides — start at guard 0 and blend up to guard 2.",
      "Keep the hairline natural; do not sharpen or push the front line back.",
      "Tidy the neckline with a clean taper, no hard razor line.",
    ],
    instructionsBn: [
      "কাট শুরু করার আগে এই কার্ড ও রেফারেন্স ছবি নাপিতকে দেখান।",
      "উপরে ৩–৫ সেমি রাখুন, পয়েন্ট-কাট টেক্সচার দিন; সামনের চুল হালকা সামনে রাখুন।",
      "পাশে লো স্কিন ফেড দিন — ০ গার্ড থেকে ২ গার্ড পর্যন্ত মসৃণভাবে মিলিয়ে দিন।",
      "কপালের হেয়ারলাইন স্বাভাবিক রাখুন; জোর করে পেছনে ঠেলবেন না।",
      "ঘাড়ের লাইন পরিষ্কার টেপার করুন, শক্ত রেজর লাইন দেবেন না।",
    ],
    maintenanceEn:
      "Refresh the fade every 2–3 weeks. Wash 2–3 times weekly, use a pea-sized matte paste on dry hair, and avoid heavy oil on the scalp in humid weather.",
    maintenanceBn:
      "প্রতি ২–৩ সপ্তাহে ফেড রিফ্রেশ করুন। সপ্তাহে ২–৩ বার চুল ধুয়ে নিন, শুকনো চুলে মটর-পরিমাণ ম্যাট পেস্ট ব্যবহার করুন, আর্দ্র আবহাওয়ায় স্ক্যাল্পে ভারী তেল এড়িয়ে চলুন।",
    visualDescription:
      "Front, side, and back reference views of a textured crop with a low skin fade: textured forward fringe on top, clean blended sides, natural hairline, and a tapered neckline. Neutral studio lighting, no face ranking or scoring overlays.",
    confidence: 0.88,
  };
}

/** Guard: reject any payload key that would imply scoring/ranking. */
const FORBIDDEN_KEYS = [
  "attractiveness",
  "attractivenessScore",
  "beautyScore",
  "faceRating",
  "score",
  "rating",
  "rank",
  "glowUpPercentage",
];

export function containsForbiddenScoring(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      return true;
    }
    if (nested && typeof nested === "object" && containsForbiddenScoring(nested)) {
      return true;
    }
  }
  return false;
}
