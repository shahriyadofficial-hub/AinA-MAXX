// lib/fashion/lookbook.ts
// AinA Drip — Shoppable Lookbook data model & pure bundle/selection logic.
// No React, no network, no secrets: safe to import from client components,
// server code, and unit tests alike.

export interface Hotspot {
  id: string;
  productId: string;
  /** Horizontal position as a percentage of the look image width (0–100). */
  xPercent: number;
  /** Vertical position as a percentage of the look image height (0–100). */
  yPercent: number;
  label: string;
}

export type LookProductCategory = "top" | "bottom" | "shoes" | "accessory";

export interface LookProduct {
  id: string;
  name: string;
  brand: string;
  category: LookProductCategory;
  priceBDT: number;
  /** Product cutout / thumbnail image (SVG data-URI friendly). */
  image: string;
  availableSizes: string[];
  inStock: boolean;
  /**
   * Maisonblock gate: true only when the merchant supplied verified,
   * granular per-size garment measurements. Never infer this client-side —
   * it must come from seller metadata.
   */
  hasAccurateSizing?: boolean;
  /** Alias used by some seller feeds; either flag unlocks the engine. */
  verifiedSizing?: boolean;
  /** Verified per-size measurements (cm) powering the Maisonblock engine. */
  garmentMeasurements?: {
    sizes: string[];
    measurements: Record<string, { chest_cm: number; length_cm: number; sleeve_cm?: number; waist_cm?: number }>;
  };
}

/** Single source of truth for the Maisonblock merchant-verification gate. */
export function hasVerifiedSizing(product: Pick<LookProduct, "hasAccurateSizing" | "verifiedSizing" | "garmentMeasurements">): boolean {
  return Boolean((product.hasAccurateSizing || product.verifiedSizing) && product.garmentMeasurements);
}

export interface LookbookItem {
  id: string;
  /** e.g. "04 Studio Day", "05 Monsoon Minimalist" */
  title: string;
  titleBn: string;
  occasion: string;
  occasionBn: string;
  ghostText: string;
  accentColor: string;
  /** Two-stop gradient used to render the model panel (no stock photos needed). */
  modelGradient: [string, string];
  /** Full-height cutout/look photograph. Inline SVG keeps the demo offline-safe. */
  modelImage: string;
  hotspots: Hotspot[];
  products: LookProduct[];
  /** e.g. 10 → 10% off the full-look bundle */
  bundleDiscountPercent: number;
}

// ---------------------------------------------------------------------------
// Inline SVG artwork (data URIs) — deterministic, offline, zero paid API calls.
// The model panel is a stylised full-height silhouette; product thumbs are
// garment glyphs. Both honour the AinA tokens (#0A0A0A / #FF2D95 / #007BA7).
// ---------------------------------------------------------------------------

function svgUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function modelArt(input: {
  top: string;
  bottom: string;
  shoes: string;
  accent: string;
  label: string;
}): string {
  const { top, bottom, shoes, accent, label } = input;
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 560" role="img" aria-label="${label}">` +
      `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="#1A1A1D"/><stop offset="1" stop-color="#0A0A0A"/></linearGradient></defs>` +
      `<rect width="360" height="560" fill="url(#bg)"/>` +
      `<ellipse cx="180" cy="512" rx="118" ry="16" fill="${accent}" opacity="0.28"/>` +
      // head + neck (silhouette only — no facial detail, no scoring)
      `<circle cx="180" cy="86" r="34" fill="#2A2A2E"/>` +
      `<rect x="168" y="112" width="24" height="22" rx="8" fill="#2A2A2E"/>` +
      // top garment
      `<path d="M118 140 Q180 118 242 140 L262 268 Q180 288 98 268 Z" fill="${top}"/>` +
      `<rect x="172" y="140" width="16" height="118" rx="8" fill="${accent}" opacity="0.85"/>` +
      // arms
      `<path d="M104 148 Q78 236 92 306 L116 300 Q106 232 122 168 Z" fill="${top}"/>` +
      `<path d="M256 148 Q282 236 268 306 L244 300 Q254 232 238 168 Z" fill="${top}"/>` +
      // bottom garment
      `<path d="M112 272 L248 272 L240 452 L196 452 L182 330 L168 452 L120 452 Z" fill="${bottom}"/>` +
      // shoes
      `<path d="M118 452 L170 452 L176 478 Q146 488 112 480 Z" fill="${shoes}"/>` +
      `<path d="M190 452 L244 452 L250 480 Q216 488 186 478 Z" fill="${shoes}"/>` +
      `<rect x="150" y="238" width="60" height="10" rx="5" fill="${accent}"/>` +
      `</svg>`
  );
}

function productArt(input: { bg: string; glyph: string; accent: string; label: string }): string {
  const { bg, glyph, accent, label } = input;
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="${label}">` +
      `<rect width="120" height="120" rx="20" fill="${bg}"/>` +
      `<path d="${glyph}" fill="${accent}"/>` +
      `</svg>`
  );
}

const GLYPH: Record<LookProductCategory, string> = {
  // tee / shirt silhouette
  top: "M38 30 L58 22 Q60 30 70 30 L82 30 L94 48 L80 56 L80 94 L40 94 L40 56 L26 48 Z",
  // trouser silhouette
  bottom: "M40 22 L80 22 L84 96 L68 96 L61 52 L54 96 L38 96 Z",
  // shoe silhouette
  shoes: "M22 74 Q44 58 62 62 L96 74 L98 88 L22 88 Z M22 88 L98 88 L98 94 L22 94 Z",
  // watch / accessory silhouette
  accessory:
    "M52 14 L68 14 L68 30 L52 30 Z M52 90 L68 90 L68 106 L52 106 Z M60 34 A26 26 0 1 0 60 86 A26 26 0 1 0 60 34 Z",
};

// ---------------------------------------------------------------------------
// Curated looks — real Bangladeshi-context styling, BDT pricing, bilingual.
// ---------------------------------------------------------------------------

export const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: "look-04-studio-day",
    title: "04 Studio Day",
    titleBn: "০৪ স্টুডিও ডে",
    occasion: "Campus · Studio",
    occasionBn: "ক্যাম্পাস · স্টুডিও",
    ghostText: "STUDIO DAY",
    accentColor: "#FF2D95",
    modelGradient: ["#2A1420", "#0A0A0A"],
    modelImage: modelArt({
      top: "#F4F1EA",
      bottom: "#3E4A5A",
      shoes: "#EDEDED",
      accent: "#FF2D95",
      label: "Studio Day look — oversized graphic tee, wide trousers, chunky sneakers",
    }),
    bundleDiscountPercent: 10,
    products: [
      {
        id: "p-tee-graphic",
        name: "Oversized Graphic Tee",
        brand: "AinA Studio",
        category: "top",
        priceBDT: 1450,
        image: productArt({ bg: "#F4F1EA", glyph: GLYPH.top, accent: "#FF2D95", label: "Oversized Graphic Tee" }),
        availableSizes: ["S", "M", "L", "XL"],
        inStock: true,
        // AinA Studio is a Verified Precision Merchant for this SKU.
        hasAccurateSizing: true,
        garmentMeasurements: {
          sizes: ["S", "M", "L", "XL"],
          measurements: {
            S: { chest_cm: 96, length_cm: 66, sleeve_cm: 22 },
            M: { chest_cm: 104, length_cm: 69, sleeve_cm: 23 },
            L: { chest_cm: 112, length_cm: 72, sleeve_cm: 24 },
            XL: { chest_cm: 120, length_cm: 75, sleeve_cm: 25 },
          },
        },
      },
      {
        id: "p-trouser-wide",
        name: "Wide-Leg Pleated Trousers",
        brand: "Dhaka Tailor Lab",
        category: "bottom",
        priceBDT: 2250,
        image: productArt({ bg: "#3E4A5A", glyph: GLYPH.bottom, accent: "#3FB6E0", label: "Wide-Leg Pleated Trousers" }),
        availableSizes: ["30", "32", "34", "36"],
        inStock: true,
      },
      {
        id: "p-sneaker-chunky",
        name: "Chunky Court Sneakers",
        brand: "Bata Premium BD",
        category: "shoes",
        priceBDT: 3450,
        image: productArt({ bg: "#EDEDED", glyph: GLYPH.shoes, accent: "#0A0A0A", label: "Chunky Court Sneakers" }),
        availableSizes: ["40", "41", "42", "43", "44"],
        inStock: true,
      },
      {
        id: "p-watch-steel",
        name: "Matte Steel Chrono Watch",
        brand: "AinA Studio",
        category: "accessory",
        priceBDT: 4950,
        image: productArt({ bg: "#1A1A1D", glyph: GLYPH.accessory, accent: "#3FB6E0", label: "Matte Steel Chrono Watch" }),
        availableSizes: ["One Size"],
        inStock: true,
      },
    ],
    hotspots: [
      { id: "hs-tee", productId: "p-tee-graphic", xPercent: 50, yPercent: 34, label: "Oversized Graphic Tee" },
      { id: "hs-trouser", productId: "p-trouser-wide", xPercent: 42, yPercent: 62, label: "Wide-Leg Pleated Trousers" },
      { id: "hs-sneaker", productId: "p-sneaker-chunky", xPercent: 58, yPercent: 86, label: "Chunky Court Sneakers" },
      { id: "hs-watch", productId: "p-watch-steel", xPercent: 76, yPercent: 52, label: "Matte Steel Chrono Watch" },
    ],
  },
  {
    id: "look-05-monsoon-minimalist",
    title: "05 Monsoon Minimalist",
    titleBn: "০৫ বর্ষা মিনিমালিস্ট",
    occasion: "Monsoon · Commute",
    occasionBn: "বর্ষা · যাতায়াত",
    ghostText: "MONSOON CALM",
    accentColor: "#3FB6E0",
    modelGradient: ["#0E2432", "#0A0A0A"],
    modelImage: modelArt({
      top: "#27272A",
      bottom: "#1E293B",
      shoes: "#0F172A",
      accent: "#3FB6E0",
      label: "Monsoon Minimalist look — DWR bomber, quick-dry joggers, waterproof boots",
    }),
    bundleDiscountPercent: 12,
    products: [
      {
        id: "p-bomber-dwr",
        name: "DWR Utility Bomber",
        brand: "AinA Studio",
        category: "top",
        priceBDT: 3850,
        image: productArt({ bg: "#27272A", glyph: GLYPH.top, accent: "#3FB6E0", label: "DWR Utility Bomber" }),
        availableSizes: ["M", "L", "XL"],
        inStock: true,
        hasAccurateSizing: true,
        garmentMeasurements: {
          sizes: ["M", "L", "XL"],
          measurements: {
            M: { chest_cm: 108, length_cm: 68, sleeve_cm: 62 },
            L: { chest_cm: 116, length_cm: 71, sleeve_cm: 64 },
            XL: { chest_cm: 124, length_cm: 74, sleeve_cm: 66 },
          },
        },
      },
      {
        id: "p-jogger-ripstop",
        name: "Quick-Dry Ripstop Joggers",
        brand: "Dhaka Tailor Lab",
        category: "bottom",
        priceBDT: 1950,
        image: productArt({ bg: "#1E293B", glyph: GLYPH.bottom, accent: "#3FB6E0", label: "Quick-Dry Ripstop Joggers" }),
        availableSizes: ["30", "32", "34"],
        inStock: true,
      },
      {
        id: "p-boot-chelsea",
        name: "Waterproof Chelsea Boots",
        brand: "Apex BD",
        category: "shoes",
        priceBDT: 4200,
        image: productArt({ bg: "#0F172A", glyph: GLYPH.shoes, accent: "#3FB6E0", label: "Waterproof Chelsea Boots" }),
        availableSizes: ["41", "42", "43"],
        inStock: false,
      },
      {
        id: "p-cap-tech",
        name: "Sealed-Seam Tech Cap",
        brand: "AinA Studio",
        category: "accessory",
        priceBDT: 950,
        image: productArt({ bg: "#1A1A1D", glyph: GLYPH.accessory, accent: "#FF2D95", label: "Sealed-Seam Tech Cap" }),
        availableSizes: ["One Size"],
        inStock: true,
      },
    ],
    hotspots: [
      { id: "hs-bomber", productId: "p-bomber-dwr", xPercent: 50, yPercent: 32, label: "DWR Utility Bomber" },
      { id: "hs-jogger", productId: "p-jogger-ripstop", xPercent: 44, yPercent: 64, label: "Quick-Dry Ripstop Joggers" },
      { id: "hs-boot", productId: "p-boot-chelsea", xPercent: 57, yPercent: 86, label: "Waterproof Chelsea Boots" },
      { id: "hs-cap", productId: "p-cap-tech", xPercent: 50, yPercent: 14, label: "Sealed-Seam Tech Cap" },
    ],
  },
  {
    id: "look-06-eid-evening",
    title: "06 Eid Evening",
    titleBn: "০৬ ঈদ সন্ধ্যা",
    occasion: "Eid · Evening",
    occasionBn: "ঈদ · সন্ধ্যা",
    ghostText: "EID EVENING",
    accentColor: "#FF2D95",
    modelGradient: ["#241428", "#0A0A0A"],
    modelImage: modelArt({
      top: "#E8DFC8",
      bottom: "#F1EDE2",
      shoes: "#78350F",
      accent: "#FF2D95",
      label: "Eid Evening look — embroidered panjabi, relaxed slacks, leather loafers",
    }),
    bundleDiscountPercent: 10,
    products: [
      {
        id: "p-panjabi-eid",
        name: "Hand-Embroidered Panjabi",
        brand: "Aarong Craft",
        category: "top",
        priceBDT: 3250,
        image: productArt({ bg: "#E8DFC8", glyph: GLYPH.top, accent: "#FF2D95", label: "Hand-Embroidered Panjabi" }),
        availableSizes: ["38", "40", "42", "44"],
        inStock: true,
        verifiedSizing: true,
        garmentMeasurements: {
          sizes: ["38", "40", "42", "44"],
          measurements: {
            "38": { chest_cm: 97, length_cm: 102, sleeve_cm: 58 },
            "40": { chest_cm: 102, length_cm: 105, sleeve_cm: 60 },
            "42": { chest_cm: 107, length_cm: 108, sleeve_cm: 62 },
            "44": { chest_cm: 112, length_cm: 111, sleeve_cm: 64 },
          },
        },
      },
      {
        id: "p-slack-ivory",
        name: "Ivory Relaxed Slacks",
        brand: "Dhaka Tailor Lab",
        category: "bottom",
        priceBDT: 1850,
        image: productArt({ bg: "#F1EDE2", glyph: GLYPH.bottom, accent: "#007BA7", label: "Ivory Relaxed Slacks" }),
        availableSizes: ["30", "32", "34", "36"],
        inStock: true,
      },
      {
        id: "p-loafer-cognac",
        name: "Cognac Penny Loafers",
        brand: "Apex BD",
        category: "shoes",
        priceBDT: 3950,
        image: productArt({ bg: "#78350F", glyph: GLYPH.shoes, accent: "#EDEDED", label: "Cognac Penny Loafers" }),
        availableSizes: ["40", "41", "42", "43"],
        inStock: true,
      },
      {
        id: "p-attar",
        name: "Oud Attar — Evening (12ml)",
        brand: "AinA Studio",
        category: "accessory",
        priceBDT: 1250,
        image: productArt({ bg: "#1A1A1D", glyph: GLYPH.accessory, accent: "#FF2D95", label: "Oud Attar Evening" }),
        availableSizes: ["12ml"],
        inStock: true,
      },
    ],
    hotspots: [
      { id: "hs-panjabi", productId: "p-panjabi-eid", xPercent: 50, yPercent: 33, label: "Hand-Embroidered Panjabi" },
      { id: "hs-slack", productId: "p-slack-ivory", xPercent: 43, yPercent: 63, label: "Ivory Relaxed Slacks" },
      { id: "hs-loafer", productId: "p-loafer-cognac", xPercent: 58, yPercent: 86, label: "Cognac Penny Loafers" },
      { id: "hs-attar", productId: "p-attar", xPercent: 74, yPercent: 50, label: "Oud Attar — Evening" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Pure pricing / selection helpers (unit-tested, no side effects)
// ---------------------------------------------------------------------------

export interface BundleSummary {
  itemCount: number;
  subtotalBDT: number;
  discountPercent: number;
  discountBDT: number;
  totalBDT: number;
  /** True only when every in-catalogue product of the look is selected. */
  isFullLook: boolean;
  savingsLabel: string;
}

/** Sum selected products; apply the bundle discount only for a full look. */
export function computeBundleSummary(
  look: LookbookItem,
  selectedIds: ReadonlySet<string> | readonly string[]
): BundleSummary {
  const selected = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);
  const chosen = look.products.filter((p) => selected.has(p.id));
  const subtotalBDT = chosen.reduce((sum, p) => sum + p.priceBDT, 0);
  const isFullLook = look.products.length > 0 && chosen.length === look.products.length;
  const discountPercent = isFullLook ? look.bundleDiscountPercent : 0;
  const discountBDT = Math.round((subtotalBDT * discountPercent) / 100);
  return {
    itemCount: chosen.length,
    subtotalBDT,
    discountPercent,
    discountBDT,
    totalBDT: subtotalBDT - discountBDT,
    isFullLook,
    savingsLabel: isFullLook ? `Full look −${discountPercent}% bundle` : "Add every piece for the bundle discount",
  };
}

/** Clamp a hotspot coordinate into the safe 4–96% band so markers never clip. */
export function clampHotspotPercent(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(96, Math.max(4, value));
}

export function findProduct(look: LookbookItem, productId: string): LookProduct | undefined {
  return look.products.find((p) => p.id === productId);
}

export function hotspotForProduct(look: LookbookItem, productId: string): Hotspot | undefined {
  return look.hotspots.find((h) => h.productId === productId);
}

/** BDT formatting consistent with the rest of AinA (en-IN grouping). */
export function formatLookBdt(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}
