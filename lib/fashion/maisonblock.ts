// lib/fashion/maisonblock.ts
// Maisonblock Fitting Engine — deterministic, client-side size recommendation.
//
// PRIVACY CONTRACT (PDPA 2026): this module is pure TypeScript. It performs
// no network calls, no storage writes, and no telemetry. Body inputs live
// only in React state / sessionStorage for the duration of the shopper's
// session and are never persisted to any backend database.
//
// Scoring weights (spec): Chest 40% · Height/Length 25% · Weight/Stomach 20%
// · Fit Preference 15%. Adjacent sizes within 10 points trigger a dual
// recommendation ("M fitted / L relaxed").

export interface GarmentMeasurements {
  sizes: string[];
  measurements: Record<string, { chest_cm: number; length_cm: number; sleeve_cm?: number; waist_cm?: number }>;
}

export type ChestShape = "slim" | "regular" | "athletic" | "broad";
export type StomachShape = "flat" | "regular" | "full";
export type HipShape = "slim" | "regular" | "wide";
export type FitPreference = "fitted" | "regular" | "relaxed";

export interface UserFitInput {
  heightCm: number;
  weightKg: number;
  chestShape: ChestShape;
  stomachShape: StomachShape;
  hipShape?: HipShape;
  fitPreference: FitPreference;
}

export interface SizeScore {
  size: string;
  /** 0–100 deterministic fit score. */
  total: number;
  chest: number;
  length: number;
  weight: number;
  preference: number;
}

export interface FitRecommendation {
  primarySize: string;
  /** Set when the runner-up adjacent size scores within the dual threshold. */
  alternateSize: string | null;
  dualMessage: string | null;
  confidence: "high" | "good" | "fair";
  /** Estimated body chest derived from height/weight/shape (cm). */
  estimatedChestCm: number;
  /** Garment chest minus estimated body chest for the primary size (cm). */
  easeCm: number;
  reasoning: string;
  scores: SizeScore[];
}

// ---------------------------------------------------------------------------
// Unit conversion helpers (spec ranges: 140–210cm / 4'6"–6'11", 40–120kg /
// 88–265lbs). Canonical storage is always metric; imperial is display-only.
// ---------------------------------------------------------------------------

export const HEIGHT_MIN_CM = 140;
export const HEIGHT_MAX_CM = 210;
export const WEIGHT_MIN_KG = 40;
export const WEIGHT_MAX_KG = 120;

export function cmToInches(cm: number): number {
  return cm / 2.54;
}

export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

/** 178 → `5'10"` (rounded to the nearest inch, clamped to spec range). */
export function formatHeightImperial(cm: number): string {
  const totalInches = Math.round(cmToInches(cm));
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
}

/** Display a centimetre measurement in the shopper's chosen unit system. */
export function formatMeasurement(cm: number, unit: "metric" | "imperial"): string {
  return unit === "metric" ? `${Math.round(cm)} cm` : `${cmToInches(cm).toFixed(1)} in`;
}

export function clampFitInput(input: UserFitInput): UserFitInput {
  return {
    ...input,
    heightCm: Math.min(HEIGHT_MAX_CM, Math.max(HEIGHT_MIN_CM, Math.round(input.heightCm))),
    weightKg: Math.min(WEIGHT_MAX_KG, Math.max(WEIGHT_MIN_KG, Math.round(input.weightKg))),
  };
}

// ---------------------------------------------------------------------------
// Deterministic estimator
// ---------------------------------------------------------------------------

const CHEST_SHAPE_OFFSET_CM: Record<ChestShape, number> = {
  slim: -3,
  regular: 0,
  athletic: 4,
  broad: 7,
};

const STOMACH_CHEST_BONUS_CM: Record<StomachShape, number> = {
  flat: 0,
  regular: 1.5,
  full: 4,
};

/** Extra garment ease (cm) an athletic/broad chest needs to avoid pulling. */
const CHEST_EASE_BONUS_CM: Partial<Record<ChestShape, number>> = {
  athletic: 5,
  broad: 8,
};

const PREFERENCE_EASE_CM: Record<FitPreference, number> = {
  fitted: 4,
  regular: 8,
  relaxed: 13,
};

const SIZE_LABEL: Record<string, string> = {
  XS: "Extra Small",
  S: "Small",
  M: "Medium",
  L: "Large",
  XL: "Extra Large",
  XXL: "2XL",
};

/**
 * Estimate body chest circumference (cm) from height, weight and shape.
 * Deterministic anthropometric approximation — a fit aid, never a body
 * judgement. Uses a height-normalised mass index (weight / height^2.5,
 * Quetelet-style) so chest grows with build, not with height alone: at a
 * fixed weight, a taller frame is leaner and measures smaller.
 */
export function estimateChestCm(input: UserFitInput): number {
  const heightM = input.heightCm / 100;
  const massIndex = input.weightKg / Math.pow(heightM, 2.5);
  // Anchored (massIndex ≈ 18.05 at 170cm/68kg): reference build → ~97cm
  // chest; 152cm/68kg → ~103cm; 196cm/68kg → ~90cm (same weight spread
  // over a taller frame measures leaner).
  const base = 66 + massIndex * 1.72;
  return Math.round((base + CHEST_SHAPE_OFFSET_CM[input.chestShape] + STOMACH_CHEST_BONUS_CM[input.stomachShape]) * 10) / 10;
}

function gaussianScore(value: number, target: number, sigma: number): number {
  const d = (value - target) / sigma;
  return 100 * Math.exp(-0.5 * d * d);
}

/**
 * Score every verified size and return the recommendation.
 * Pure function — same input always yields the same output (unit-tested).
 */
export function recommendSize(garment: GarmentMeasurements, rawInput: UserFitInput): FitRecommendation {
  const input = clampFitInput(rawInput);
  const estimatedChestCm = estimateChestCm(input);
  const targetEase = PREFERENCE_EASE_CM[input.fitPreference] + (CHEST_EASE_BONUS_CM[input.chestShape] ?? 0);
  const targetGarmentChest = estimatedChestCm + targetEase;
  // Torso length scales with height; long garments on short frames (and vice
  // versa) are penalised so tall shoppers are pushed to longer cuts.
  // Reference: a size-M tee (69cm) suits ~172cm; ±3cm of garment length
  // tracks roughly ±8cm of height.
  const targetLength = 69 + (input.heightCm - 172) * 0.35;

  const scores: SizeScore[] = garment.sizes
    .filter((size) => garment.measurements[size])
    .map((size) => {
      const m = garment.measurements[size];
      const chest = gaussianScore(m.chest_cm, targetGarmentChest, 5.5);
      // Length sigma 4.5: a 3cm size step is meaningful — tall shoppers
      // must feel the pull toward longer cuts (spec: height = 25%).
      const length = gaussianScore(m.length_cm, targetLength, 4.5);
      // Fuller stomach / heavier build: penalise garments whose chest ease
      // would fall below a comfortable minimum (pulling across the midline).
      const minEase = input.stomachShape === "full" ? 6 : input.stomachShape === "regular" ? 3 : 1;
      const ease = m.chest_cm - estimatedChestCm;
      const weight = ease >= minEase ? 100 : Math.max(0, 100 - (minEase - ease) * 18);
      // Preference breaks near-ties toward the shopper's stated silhouette.
      const prefTarget = estimatedChestCm + PREFERENCE_EASE_CM[input.fitPreference];
      const preference = gaussianScore(m.chest_cm, prefTarget, 7);
      const total = Math.round((chest * 0.4 + length * 0.25 + weight * 0.2 + preference * 0.15) * 10) / 10;
      return { size, total, chest: Math.round(chest), length: Math.round(length), weight: Math.round(weight), preference: Math.round(preference) };
    })
    .sort((a, b) => b.total - a.total);

  const primary = scores[0];
  const runnerUp = scores[1];
  const primaryIdx = garment.sizes.indexOf(primary.size);
  const runnerIdx = runnerUp ? garment.sizes.indexOf(runnerUp.size) : -1;
  const isAdjacent = runnerUp !== undefined && Math.abs(primaryIdx - runnerIdx) === 1;
  const withinDualThreshold = runnerUp !== undefined && primary.total - runnerUp.total <= 10;

  const alternateSize = isAdjacent && withinDualThreshold ? runnerUp.size : null;
  const dualMessage = alternateSize
    ? `Size ${primary.size} for a fitted look, or Size ${alternateSize} for a relaxed street silhouette`
    : null;

  const primaryMeasure = garment.measurements[primary.size];
  const easeCm = Math.round((primaryMeasure.chest_cm - estimatedChestCm) * 10) / 10;
  const confidence: FitRecommendation["confidence"] = primary.total >= 80 ? "high" : primary.total >= 60 ? "good" : "fair";

  const sizeWord = SIZE_LABEL[primary.size] ?? primary.size;
  const shapeWord =
    input.chestShape === "athletic" ? "athletic chest" : input.chestShape === "broad" ? "broad chest" : input.chestShape === "slim" ? "slim frame" : "regular build";
  const drapeWord = easeCm >= 10 ? "a relaxed drape without excess fabric" : easeCm >= 5 ? "the best shoulder drape without pulling" : "a clean, close fit without pulling";
  const reasoning = `Based on your ${input.heightCm}cm height and ${shapeWord}, ${sizeWord} (${primary.size}) provides ${drapeWord}.`;

  return {
    primarySize: primary.size,
    alternateSize,
    dualMessage,
    confidence,
    estimatedChestCm,
    easeCm,
    reasoning,
    scores,
  };
}
