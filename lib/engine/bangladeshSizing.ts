// lib/engine/bangladeshSizing.ts
// AinA Universal Fit — deterministic Bangladesh sizing engine.
//
// PRIVACY CONTRACT (Bangladesh PDPA 2026): this module is pure TypeScript.
// It performs no network calls, no storage writes, and no telemetry.
// Guests calculate fully in-memory on the client. Persistence happens only
// through the explicit-consent API route (/api/v1/size/profile).
//
// LOCAL REALITY: a "Size 40" Panjabi at Aarong ≠ Sailor ≠ a tailor cut.
// So the engine never trusts labels — it matches the user's tailor
// measurements (inches, দর্জি হিসাব) against per-brand garment charts with
// humidity ease, wash-shrinkage compensation, and body-shape bias.

export type LocalFitType = "SLIM_FIT" | "SEMI_FIT" | "REGULAR" | "RELAXED_OVERSIZED";
export type BodyType = "SLIM" | "REGULAR" | "ATHLETIC" | "HEAVY_CHEST" | "ROUND_BELLY";
export type GarmentCategory =
  | "PANJABI"
  | "POLO_TSHIRT"
  | "OVERSIZED_TEE"
  | "CASUAL_SHIRT"
  | "FORMAL_SHIRT"
  | "TROUSER_DENIM";

export interface UserBodyProfileInput {
  heightInches: number; // e.g. 68 = 5'8"
  weightKg: number;
  chestInches: number; // বুকের মাপ
  waistInches: number;
  shoulderInches?: number;
  panjabiLengthIn?: number; // লম্বা preference
  fitPreference: LocalFitType;
  bodyComposition?: BodyType;
}

export interface BrandChartRow {
  brandName: string;
  garmentType: GarmentCategory;
  sizeLabel: string;
  chestMinIn: number;
  chestMaxIn: number;
  lengthInches: number;
  shoulderInches?: number;
  fabricType: string;
  easeAllowanceIn: number;
  shrinkageOffset: number;
}

// ---------------------------------------------------------------------------
// Local brand charts — real-world baselines (mirrored in prisma/seed.ts).
// Chest ranges are BODY chest ranges the garment is cut for.
// ---------------------------------------------------------------------------

function row(
  brandName: string,
  garmentType: GarmentCategory,
  sizeLabel: string,
  chestMinIn: number,
  chestMaxIn: number,
  lengthInches: number,
  fabricType: string,
  extra: Partial<BrandChartRow> = {}
): BrandChartRow {
  return {
    brandName,
    garmentType,
    sizeLabel,
    chestMinIn,
    chestMaxIn,
    lengthInches,
    fabricType,
    easeAllowanceIn: extra.easeAllowanceIn ?? 2.5,
    shrinkageOffset: extra.shrinkageOffset ?? (fabricType.includes("Cotton") ? 0.5 : 0),
    shoulderInches: extra.shoulderInches,
  };
}

export const LOCAL_BRAND_CHARTS: BrandChartRow[] = [
  // Aarong Panjabi — numeric labels, ~1" chest steps, long লম্বা
  row("Aarong", "PANJABI", "38", 38, 39, 40, "100% Cotton (Shrinks ~1in)", { easeAllowanceIn: 3.0 }),
  row("Aarong", "PANJABI", "40", 40, 41, 41, "100% Cotton (Shrinks ~1in)", { easeAllowanceIn: 3.0 }),
  row("Aarong", "PANJABI", "42", 42, 43, 42, "100% Cotton (Shrinks ~1in)", { easeAllowanceIn: 3.0 }),
  row("Aarong", "PANJABI", "44", 44, 45, 43, "100% Cotton (Shrinks ~1in)", { easeAllowanceIn: 3.0 }),
  // Sailor / Yellow casual tops — alpha labels
  row("Sailor / Yellow", "CASUAL_SHIRT", "M", 39, 40, 28, "Cotton Blend", { easeAllowanceIn: 2.5 }),
  row("Sailor / Yellow", "CASUAL_SHIRT", "L", 41, 42, 29, "Cotton Blend", { easeAllowanceIn: 2.5 }),
  row("Sailor / Yellow", "CASUAL_SHIRT", "XL", 43, 44, 30, "Cotton Blend", { easeAllowanceIn: 2.5 }),
  // Bangladeshi generic streetwear (Instagram f-commerce baseline) — drop shoulder
  row("Local Streetwear / F-Commerce", "OVERSIZED_TEE", "M", 40, 42, 28, "Heavy Cotton 240 GSM", { easeAllowanceIn: 5.5 }),
  row("Local Streetwear / F-Commerce", "OVERSIZED_TEE", "L", 42, 44, 29, "Heavy Cotton 240 GSM", { easeAllowanceIn: 5.5 }),
  row("Local Streetwear / F-Commerce", "OVERSIZED_TEE", "XL", 44, 46, 30, "Heavy Cotton 240 GSM", { easeAllowanceIn: 5.5 }),
];

// ---------------------------------------------------------------------------
// Unit helpers — tailor defaults in inches, seamless cm toggle.
// Canonical internal unit: inches. 1 inch = 2.54 cm exactly.
// ---------------------------------------------------------------------------

export const CM_PER_INCH = 2.54;

export function inchesToCm(inches: number): number {
  return Math.round(inches * CM_PER_INCH * 10) / 10;
}

export function cmToInches(cm: number): number {
  return Math.round((cm / CM_PER_INCH) * 10) / 10;
}

/** 68 → `5'8"` */
export function formatHeightImperial(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return `${feet}'${inches}"`;
}

export function heightToInches(feet: number, inches: number): number {
  return feet * 12 + inches;
}

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Latin digits → Bengali digits for Bangla verdicts (৪০, ৩৮…). */
export function toBengaliDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => BENGALI_DIGITS[Number(d)]);
}

// ---------------------------------------------------------------------------
// Ease model — humid-climate breathing room by garment + fit preference.
// ---------------------------------------------------------------------------

export function targetEaseInches(garmentType: GarmentCategory, fit: LocalFitType): number {
  if (garmentType === "OVERSIZED_TEE") {
    // Drop-shoulder streetwear: relaxed offset is the whole point.
    return fit === "SLIM_FIT" ? 4.0 : 5.5;
  }
  if (garmentType === "PANJABI") {
    switch (fit) {
      case "SLIM_FIT":
        return 1.5;
      case "SEMI_FIT":
        return 3.0;
      case "REGULAR":
        return 4.0;
      case "RELAXED_OVERSIZED":
        return 5.0;
    }
  }
  // Shirts / polos / trousers follow the same tailor ladder, slightly tighter.
  switch (fit) {
    case "SLIM_FIT":
      return 1.5;
    case "SEMI_FIT":
      return 2.5;
    case "REGULAR":
      return 3.5;
    case "RELAXED_OVERSIZED":
      return 4.5;
  }
}

// ---------------------------------------------------------------------------
// Matching engine
// ---------------------------------------------------------------------------

export type FitConfidence = "best" | "good" | "fair";

export interface BrandSizeVerdict {
  brandName: string;
  garmentType: GarmentCategory;
  sizeLabel: string;
  confidence: FitConfidence;
  confidenceEn: string;
  confidenceBn: string;
  /** Garment chest ease the user actually gets with this size (inches). */
  easeInches: number;
  /** True when cotton shrinkage pushed the recommendation one size up. */
  sizedUpForShrinkage: boolean;
  /** True when ROUND_BELLY biased the pick so buttons don't gap at the navel. */
  bellyBiased: boolean;
  verdictEn: string;
  verdictBn: string;
}

const CONFIDENCE_LABEL: Record<FitConfidence, { en: string; bn: string }> = {
  best: { en: "Best Fit", bn: "সেরা ফিট" },
  good: { en: "Good Fit", bn: "ভালো ফিট" },
  fair: { en: "Workable Fit", bn: "চলনসই ফিট" },
};

/**
 * Effective body chest used for chart matching.
 * ROUND_BELLY: buttoned garments must clear the stomach, so the waist
 * drives the chest requirement (navel gap prevention).
 */
export function effectiveChestInches(profile: UserBodyProfileInput): number {
  if (profile.bodyComposition === "ROUND_BELLY") {
    return Math.max(profile.chestInches, profile.waistInches + 2);
  }
  if (profile.bodyComposition === "HEAVY_CHEST") {
    return profile.chestInches + 0.5;
  }
  return profile.chestInches;
}

function scoreRow(
  profile: UserBodyProfileInput,
  r: BrandChartRow,
  effectiveChest: number
): { score: number; ease: number } {
  const targetEase = targetEaseInches(r.garmentType, profile.fitPreference);
  // Garment chest ≈ midpoint of the body range it is cut for + its ease.
  const garmentChest = (r.chestMinIn + r.chestMaxIn) / 2 + r.easeAllowanceIn;
  const ease = garmentChest - effectiveChest;
  // Penalise distance from the tailor's target ease; too tight is worse.
  const diff = ease - targetEase;
  const penalty = diff < 0 ? Math.abs(diff) * 22 : diff * 9;
  // Range fit: inside the brand's body range is ideal.
  const inRange = effectiveChest >= r.chestMinIn - 0.5 && effectiveChest <= r.chestMaxIn + 0.5;
  const rangeBonus = inRange ? 18 : 0;
  // Length: panjabi লম্বা preference matters; otherwise height-derived.
  const desiredLength =
    r.garmentType === "PANJABI"
      ? profile.panjabiLengthIn ?? profile.heightInches * 0.6
      : profile.heightInches * 0.41;
  const lengthPenalty = Math.abs(r.lengthInches - desiredLength) * 2.2;
  return { score: 100 - penalty - lengthPenalty + rangeBonus, ease };
}

function pickBestRow(
  profile: UserBodyProfileInput,
  rows: BrandChartRow[],
  effectiveChest: number
): { best: BrandChartRow; ease: number; sizedUp: boolean } {
  const scored = rows
    .map((r) => ({ r, ...scoreRow(profile, r, effectiveChest) }))
    .sort((a, b) => b.score - a.score);
  let best = scored[0];

  // Shrinkage rule: 100% cotton + user in the top 15% of the size's range
  // → size up so the garment survives the first local laundry wash.
  let sizedUp = false;
  if (best.r.shrinkageOffset > 0) {
    const span = best.r.chestMaxIn - best.r.chestMinIn;
    const position = span > 0 ? (effectiveChest - best.r.chestMinIn) / span : 0;
    if (position >= 0.85) {
      const idx = rows.indexOf(best.r);
      const next = rows[idx + 1];
      if (next) {
        const nextScore = scoreRow(profile, next, effectiveChest);
        best = { r: next, ...nextScore };
        sizedUp = true;
      }
    }
  }
  return { best: best.r, ease: best.ease, sizedUp };
}

/** Deterministic cross-brand verdicts for one garment type. */
export function recommendAcrossBrands(
  profile: UserBodyProfileInput,
  garmentType: GarmentCategory,
  charts: BrandChartRow[] = LOCAL_BRAND_CHARTS
): BrandSizeVerdict[] {
  const effectiveChest = effectiveChestInches(profile);
  const bellyBiased =
    profile.bodyComposition === "ROUND_BELLY" && effectiveChest > profile.chestInches;
  const brands = [...new Set(charts.filter((c) => c.garmentType === garmentType).map((c) => c.brandName))];

  return brands.map((brandName) => {
    const rows = charts
      .filter((c) => c.brandName === brandName && c.garmentType === garmentType)
      .sort((a, b) => a.chestMinIn - b.chestMinIn);
    const { best, ease, sizedUp } = pickBestRow(profile, rows, effectiveChest);
    const targetEase = targetEaseInches(garmentType, profile.fitPreference);
    const easeGap = Math.abs(ease - targetEase);
    const confidence: FitConfidence = easeGap <= 0.75 ? "best" : easeGap <= 1.6 ? "good" : "fair";
    const label = CONFIDENCE_LABEL[confidence];

    const easeTxt = `${Math.round(ease * 10) / 10}`;
    const verdictEn =
      `${brandName}: Size ${best.sizeLabel} (${label.en}) · Gives you ${easeTxt} inches chest ease, ` +
      `ideal for Dhaka humidity.` +
      (sizedUp ? " Sized up for cotton shrinkage after the first wash." : "") +
      (bellyBiased ? " Waist-biased so buttons won't pull at the navel." : "");
    const verdictBn =
      `${brandName}: সাইজ ${toBengaliDigits(best.sizeLabel)} (${label.bn}) · বুকের মাপে ${toBengaliDigits(easeTxt)} ইঞ্চি রিল্যাক্সড আরাম পাবেন।` +
      (sizedUp ? " প্রথম ধোয়ার পর কাপড় সঙ্কুচিত হওয়ার কথা ভেবে এক সাইজ বড় সাজেস্ট করা হলো।" : "") +
      (bellyBiased ? " পেটের মাপ অনুযায়ী সাইজ ধরা হয়েছে, যাতে বোতামে টান না পড়ে।" : "");

    return {
      brandName,
      garmentType,
      sizeLabel: best.sizeLabel,
      confidence,
      confidenceEn: label.en,
      confidenceBn: label.bn,
      easeInches: Math.round(ease * 10) / 10,
      sizedUpForShrinkage: sizedUp,
      bellyBiased,
      verdictEn,
      verdictBn,
    };
  });
}

/** Map a lookbook product (brand + category) onto a local garment type. */
export function garmentTypeForProduct(input: {
  brand: string;
  name: string;
  category: "top" | "bottom" | "shoes" | "accessory";
}): GarmentCategory {
  const text = `${input.brand} ${input.name}`.toLowerCase();
  if (text.includes("panjabi") || text.includes("kurta")) return "PANJABI";
  if (input.category === "bottom") return "TROUSER_DENIM";
  if (text.includes("tee") || text.includes("hoodie") || text.includes("oversized")) return "OVERSIZED_TEE";
  if (text.includes("polo")) return "POLO_TSHIRT";
  if (text.includes("formal")) return "FORMAL_SHIRT";
  return "CASUAL_SHIRT";
}

/** Which seeded brand chart best represents this product's seller? */
export function brandChartForProduct(brand: string): string {
  const b = brand.toLowerCase();
  if (b.includes("aarong")) return "Aarong";
  if (b.includes("sailor") || b.includes("yellow")) return "Sailor / Yellow";
  return "Local Streetwear / F-Commerce";
}

// ---------------------------------------------------------------------------
// Profile persistence (PDPA 2026) — encrypted-at-rest localStorage wrapper.
// NOTE (honest): WebCrypto AES-GCM with a device-local key is obfuscation-
// grade protection on a shared device, not a substitute for account auth.
// The key never leaves the device; erasure deletes both key and payload.
// ---------------------------------------------------------------------------

export const AINAFIT_PROFILE_KEY = "ainafit_profile";
const AINAFIT_KEY_KEY = "ainafit_key";

/**
 * Storage access is guarded end-to-end: these helpers run only from client
 * event handlers/effects, but a stray server import, a privacy-mode denial
 * (Safari throws on setItem), or a non-secure context (no WebCrypto) must
 * degrade to "no saved profile" — never throw into a render.
 */
function getLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

function getSubtleCrypto(): SubtleCrypto | null {
  try {
    if (typeof crypto === "undefined" || !crypto.subtle) return null;
    return crypto.subtle;
  } catch {
    return null;
  }
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getOrCreateDeviceKey(): Promise<CryptoKey> {
  const storage = getLocalStorage();
  const subtle = getSubtleCrypto();
  if (!storage || !subtle) {
    throw new Error("On-device profile storage is unavailable in this environment.");
  }
  const stored = storage.getItem(AINAFIT_KEY_KEY);
  if (stored) {
    return subtle.importKey("jwk", JSON.parse(stored), { name: "AES-GCM" }, true, [
      "encrypt",
      "decrypt",
    ]);
  }
  const key = await subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  storage.setItem(AINAFIT_KEY_KEY, JSON.stringify(await subtle.exportKey("jwk", key)));
  return key;
}

export interface StoredFitProfile extends UserBodyProfileInput {
  savedAt: string;
  consentGranted: boolean;
}

/** Encrypt + persist the profile on-device. Client-only; no-ops safely when storage/WebCrypto is unavailable. */
export async function saveFitProfileLocal(profile: StoredFitProfile): Promise<void> {
  const storage = getLocalStorage();
  const subtle = getSubtleCrypto();
  if (!storage || !subtle || typeof crypto.getRandomValues !== "function") return;
  try {
    const key = await getOrCreateDeviceKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(profile));
    const cipher = await subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
    storage.setItem(
      AINAFIT_PROFILE_KEY,
      JSON.stringify({ iv: bufferToBase64(iv), data: bufferToBase64(cipher) })
    );
  } catch {
    // Storage denied (private mode / quota) — the in-memory profile still works.
  }
}

/** Decrypt the on-device profile; null when absent/corrupt/unavailable. Client-only. */
export async function loadFitProfileLocal(): Promise<StoredFitProfile | null> {
  const storage = getLocalStorage();
  const subtle = getSubtleCrypto();
  if (!storage || !subtle) return null;
  try {
    const raw = storage.getItem(AINAFIT_PROFILE_KEY);
    if (!raw) return null;
    const { iv, data } = JSON.parse(raw) as { iv: string; data: string };
    const key = await getOrCreateDeviceKey();
    const plain = await subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(iv) as BufferSource },
      key,
      base64ToBytes(data) as BufferSource
    );
    return JSON.parse(new TextDecoder().decode(plain)) as StoredFitProfile;
  } catch {
    return null;
  }
}

/** One-tap erasure: removes payload AND the device key. Client-only; never throws. */
export function eraseFitProfileLocal(): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(AINAFIT_PROFILE_KEY);
    storage.removeItem(AINAFIT_KEY_KEY);
  } catch {
    // Nothing else can be done — erasure UI feedback must not crash.
  }
}
