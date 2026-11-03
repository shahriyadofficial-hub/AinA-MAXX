// lib/fashion/lookbook.ts
// AinA Drip — Shoppable Lookbook data model & pure bundle/selection logic.
// No React, no network, no secrets: safe to import from client components,
// server code, and unit tests alike.
//
// Photography: real copyright-free editorial/product photos from the
// verified Unsplash catalog (lib/media/photos.ts). The previous inline SVG
// silhouettes read as "AI demo" on camera; real fabric and real styling is
// what makes the lookbook showcase-ready. Hotspot coordinates below are
// tuned to each photograph's composition (percent of the 4:5 panel).

import { MODEL_PHOTOS, PRODUCT_PHOTOS, portraitUrl, squareUrl } from "@/lib/media/photos";

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
  /** Real product photograph (Unsplash CDN, square crop via next/image). */
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
  /** Two-stop gradient behind the photograph (panel tint while it loads). */
  modelGradient: [string, string];
  /** Full-height editorial look photograph (real model, Unsplash CDN). */
  modelImage: string;
  /** Photographer credit for the look photograph (provenance line). */
  modelCredit: string;
  hotspots: Hotspot[];
  products: LookProduct[];
  /** e.g. 10 → 10% off the full-look bundle */
  bundleDiscountPercent: number;
}

// ---------------------------------------------------------------------------
// Photography: real editorial/product photos (Unsplash License, verified
// in lib/media/photos.ts). Model panels use the 4:5 portrait crop; product
// thumbs use the square crop. No generated or vector placeholder imagery.
// ---------------------------------------------------------------------------

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
    modelImage: portraitUrl(MODEL_PHOTOS.streetEditorial),
    modelCredit: MODEL_PHOTOS.streetEditorial.credit,
    bundleDiscountPercent: 10,
    products: [
      {
        id: "p-tee-graphic",
        name: "Oversized Graphic Tee",
        brand: "AinA Studio",
        category: "top",
        priceBDT: 1450,
        image: squareUrl(PRODUCT_PHOTOS.teesRail),
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
        image: squareUrl(PRODUCT_PHOTOS.denimStack),
        availableSizes: ["30", "32", "34", "36"],
        inStock: true,
      },
      {
        id: "p-sneaker-chunky",
        name: "Chunky Court Sneakers",
        brand: "Bata Premium BD",
        category: "shoes",
        priceBDT: 3450,
        image: squareUrl(PRODUCT_PHOTOS.sneakersWhite),
        availableSizes: ["40", "41", "42", "43", "44"],
        inStock: true,
      },
      {
        id: "p-watch-steel",
        name: "Matte Steel Chrono Watch",
        brand: "AinA Studio",
        category: "accessory",
        priceBDT: 4950,
        image: squareUrl(PRODUCT_PHOTOS.watchSteel),
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
    modelImage: portraitUrl(MODEL_PHOTOS.monoNight),
    modelCredit: MODEL_PHOTOS.monoNight.credit,
    bundleDiscountPercent: 12,
    products: [
      {
        id: "p-bomber-dwr",
        name: "DWR Utility Bomber",
        brand: "AinA Studio",
        category: "top",
        priceBDT: 3850,
        image: squareUrl(PRODUCT_PHOTOS.leatherJacket),
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
        image: squareUrl(PRODUCT_PHOTOS.jeansDetail),
        availableSizes: ["30", "32", "34"],
        inStock: true,
      },
      {
        id: "p-boot-chelsea",
        name: "Waterproof Chelsea Boots",
        brand: "Apex BD",
        category: "shoes",
        priceBDT: 4200,
        image: squareUrl(PRODUCT_PHOTOS.sneakersPair),
        availableSizes: ["41", "42", "43"],
        inStock: false,
      },
      {
        id: "p-cap-tech",
        name: "Sealed-Seam Tech Cap",
        brand: "AinA Studio",
        category: "accessory",
        priceBDT: 950,
        image: squareUrl(PRODUCT_PHOTOS.capDetail),
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
    modelImage: portraitUrl(MODEL_PHOTOS.smartCasual),
    modelCredit: MODEL_PHOTOS.smartCasual.credit,
    bundleDiscountPercent: 10,
    products: [
      {
        id: "p-panjabi-eid",
        name: "Hand-Embroidered Panjabi",
        brand: "Aarong Craft",
        category: "top",
        priceBDT: 3250,
        image: squareUrl(PRODUCT_PHOTOS.whiteTee),
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
        image: squareUrl(PRODUCT_PHOTOS.teeStack),
        availableSizes: ["30", "32", "34", "36"],
        inStock: true,
      },
      {
        id: "p-loafer-cognac",
        name: "Cognac Penny Loafers",
        brand: "Apex BD",
        category: "shoes",
        priceBDT: 3950,
        image: squareUrl(PRODUCT_PHOTOS.sneakersColour),
        availableSizes: ["40", "41", "42", "43"],
        inStock: true,
      },
      {
        id: "p-attar",
        name: "Oud Attar — Evening (12ml)",
        brand: "AinA Studio",
        category: "accessory",
        priceBDT: 1250,
        image: squareUrl(PRODUCT_PHOTOS.watchGold),
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
