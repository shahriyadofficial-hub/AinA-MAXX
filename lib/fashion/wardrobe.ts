// lib/fashion/wardrobe.ts
// AinA Drip — Capsule gap analysis, occasion combos & digital wardrobe logic.
// Pure functions only (no React / network) so every rule is unit-testable.

import type { LookProductCategory } from "./lookbook";
import { PRODUCT_PHOTOS, squareUrl } from "@/lib/media/photos";

export type WardrobeCategory = LookProductCategory | "outerwear";
export type OccasionId = "eid" | "campus" | "monsoon" | "office" | "evening";

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeCategory;
  colorName: string;
  colorHex: string;
  priceBDT: number;
  wears: number;
  /** SAM 3.1 segmentation confidence 0–1, shown as provenance (never a score of the person). */
  samConfidence: number;
  cutoutReady: boolean;
  /** Real garment photograph (Unsplash CDN) shown on the wardrobe tile. */
  image: string;
}

export interface OccasionCombo {
  id: OccasionId;
  labelEn: string;
  labelBn: string;
  weatherNote: string;
  slots: Array<{ category: WardrobeCategory; itemName: string; why: string }>;
  missingCategories: WardrobeCategory[];
  readyPercent: number;
}

export const OCCASIONS: Array<{ id: OccasionId; labelEn: string; labelBn: string }> = [
  { id: "eid", labelEn: "Eid", labelBn: "ঈদ" },
  { id: "campus", labelEn: "Campus", labelBn: "ক্যাম্পাস" },
  { id: "monsoon", labelEn: "Monsoon", labelBn: "বর্ষা" },
  { id: "office", labelEn: "Office", labelBn: "অফিস" },
  { id: "evening", labelEn: "Evening", labelBn: "সন্ধ্যা" },
];

export const DEMO_WARDROBE: WardrobeItem[] = [
  { id: "w-kurta", name: "Obsidian Black Kurta", category: "top", colorName: "Obsidian", colorHex: "#18181B", priceBDT: 2450, wears: 14, samConfidence: 0.97, cutoutReady: true, image: squareUrl(PRODUCT_PHOTOS.whiteTee) },
  { id: "w-tee", name: "Heavyweight Prime Tee", category: "top", colorName: "Jet Black", colorHex: "#0D0D10", priceBDT: 1450, wears: 22, samConfidence: 0.96, cutoutReady: true, image: squareUrl(PRODUCT_PHOTOS.teesRail) },
  { id: "w-chinos", name: "Slim Pleat Chinos", category: "bottom", colorName: "Olive Earth", colorHex: "#3F4E3A", priceBDT: 2150, wears: 11, samConfidence: 0.95, cutoutReady: true, image: squareUrl(PRODUCT_PHOTOS.denimStack) },
  { id: "w-sneakers", name: "Bone White Lows", category: "shoes", colorName: "Bone White", colorHex: "#E4E4E7", priceBDT: 3450, wears: 18, samConfidence: 0.98, cutoutReady: true, image: squareUrl(PRODUCT_PHOTOS.sneakersWhite) },
  { id: "w-bomber", name: "DWR Utility Bomber", category: "outerwear", colorName: "Charcoal", colorHex: "#27272A", priceBDT: 3850, wears: 6, samConfidence: 0.94, cutoutReady: true, image: squareUrl(PRODUCT_PHOTOS.leatherJacket) },
  { id: "w-watch", name: "Matte Steel Chrono", category: "accessory", colorName: "Steel", colorHex: "#3A3A40", priceBDT: 4950, wears: 26, samConfidence: 0.93, cutoutReady: false, image: squareUrl(PRODUCT_PHOTOS.watchSteel) },
];

/** Cost per wear in BDT, rounded to whole taka. Guards divide-by-zero. */
export function costPerWearBDT(item: Pick<WardrobeItem, "priceBDT" | "wears">): number {
  if (item.wears <= 0) return item.priceBDT;
  return Math.round(item.priceBDT / item.wears);
}

export interface CapsuleGap {
  category: WardrobeCategory;
  label: string;
  have: number;
  recommended: number;
  status: "covered" | "thin" | "gap";
  suggestion: string;
  suggestionPriceBDT: number;
}

const CAPSULE_TARGETS: Array<{ category: WardrobeCategory; label: string; recommended: number; suggestion: string; suggestionPriceBDT: number }> = [
  { category: "top", label: "Tops", recommended: 3, suggestion: "Camp-Collar Linen Shirt — breathes in 85% humidity", suggestionPriceBDT: 1950 },
  { category: "bottom", label: "Bottoms", recommended: 2, suggestion: "Wide-Leg Pleated Trousers — one tailored anchor pair", suggestionPriceBDT: 2250 },
  { category: "shoes", label: "Shoes", recommended: 2, suggestion: "Waterproof Chelsea Boots — monsoon-proof second pair", suggestionPriceBDT: 4200 },
  { category: "outerwear", label: "Outerwear", recommended: 1, suggestion: "You are covered — DWR layer already in rotation", suggestionPriceBDT: 0 },
  { category: "accessory", label: "Accessories", recommended: 2, suggestion: "Sealed-Seam Tech Cap — finishes monsoon & campus looks", suggestionPriceBDT: 950 },
];

/** Compare the wardrobe against a lean Dhaka capsule target. */
export function analyseCapsuleGaps(items: readonly WardrobeItem[]): CapsuleGap[] {
  return CAPSULE_TARGETS.map((target) => {
    const have = items.filter((i) => i.category === target.category).length;
    const status: CapsuleGap["status"] = have >= target.recommended ? "covered" : have === 0 ? "gap" : "thin";
    return { ...target, have, status };
  });
}

/** Interchangeability estimate: tops × bottoms × shoes (+1 when an outer layer exists). */
export function countPossibleOutfits(items: readonly WardrobeItem[]): number {
  const count = (c: WardrobeCategory) => items.filter((i) => i.category === c).length;
  const base = count("top") * Math.max(1, count("bottom")) * Math.max(1, count("shoes"));
  return count("outerwear") > 0 ? base * 2 : base;
}

const OCCASION_RECIPES: Record<OccasionId, { weatherNote: string; picks: Array<{ category: WardrobeCategory; why: string }> }> = {
  eid: {
    weatherNote: "Festive evening — breathable formality, no heavy layers.",
    picks: [
      { category: "top", why: "Structured top reads formal in photos" },
      { category: "bottom", why: "Clean pleat keeps the silhouette sharp" },
      { category: "shoes", why: "Closed shoe for visits & prayers" },
      { category: "accessory", why: "One quiet accent — watch or attar" },
    ],
  },
  campus: {
    weatherNote: "All-day comfort — lightweight, crease-resistant, bag-friendly.",
    picks: [
      { category: "top", why: "Heavyweight tee holds shape through the day" },
      { category: "bottom", why: "Flex-waist chinos for rickshaw-to-class movement" },
      { category: "shoes", why: "Cushioned lows for campus walking" },
    ],
  },
  monsoon: {
    weatherNote: "85%+ humidity & sudden rain — DWR outer, quick-dry bottom, sealed footwear.",
    picks: [
      { category: "outerwear", why: "DWR shell sheds rain without trapping heat" },
      { category: "top", why: "Dark base hides splash marks" },
      { category: "bottom", why: "Quick-dry fabric, cropped above puddles" },
      { category: "shoes", why: "Vulcanised grip on wet pavement" },
    ],
  },
  office: {
    weatherNote: "Smart-casual — matte textures, no logos, humidity-safe grooming.",
    picks: [
      { category: "top", why: "Kurta or camp collar — polished, breathable" },
      { category: "bottom", why: "Tailored pleat, side adjusters" },
      { category: "shoes", why: "Minimal lows keep it office-clean" },
      { category: "accessory", why: "Steel chrono — understated anchor" },
    ],
  },
  evening: {
    weatherNote: "Night out — monochrome depth, one accent light source.",
    picks: [
      { category: "top", why: "Jet-black base for contrast lighting" },
      { category: "bottom", why: "Drape slack adds movement" },
      { category: "shoes", why: "Clean lows finish the monochrome line" },
      { category: "accessory", why: "Single metallic accent only" },
    ],
  },
};

/** Build an occasion combo from what the user actually owns; report what's missing. */
export function buildOccasionCombo(items: readonly WardrobeItem[], occasion: OccasionId): OccasionCombo {
  const recipe = OCCASION_RECIPES[occasion];
  const meta = OCCASIONS.find((o) => o.id === occasion) ?? OCCASIONS[0];
  const slots: OccasionCombo["slots"] = [];
  const missing: WardrobeCategory[] = [];

  for (const pick of recipe.picks) {
    const owned = items
      .filter((i) => i.category === pick.category)
      .sort((a, b) => b.wears - a.wears)[0];
    if (owned) slots.push({ category: pick.category, itemName: owned.name, why: pick.why });
    else missing.push(pick.category);
  }

  const readyPercent = recipe.picks.length === 0 ? 100 : Math.round((slots.length / recipe.picks.length) * 100);
  return { id: occasion, labelEn: meta.labelEn, labelBn: meta.labelBn, weatherNote: recipe.weatherNote, slots, missingCategories: missing, readyPercent };
}
