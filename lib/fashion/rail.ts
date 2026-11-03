// lib/fashion/rail.ts
// AinA Drip — RAIL: 3D Virtual Hanger Carousel.
// Pure data + physics helpers (no React, no network, no secrets).
// The 3D scene consumes these helpers so every behaviour is unit-testable
// without rendering a single frame.
//
// Photography: `image` is a real garment photograph (Unsplash, verified in
// lib/media/photos.ts) used by the 2D fallback track and Quick View; the
// procedural SVG `cutout` is retained as an offline last-resort only.

import { PRODUCT_PHOTOS, squareUrl } from "@/lib/media/photos";

export interface RailProduct {
  id: string;
  title: string;
  brand: string;
  priceBDT: number;
  /** One-line construction note shown in the HUD. */
  microDescription: string;
  /** Bengali micro-line for bilingual HUD. */
  microBn: string;
  inStock: boolean;
  /** Garment body colour (procedural PBR material). */
  colorHex: string;
  /** Accent colour for trims / back print. */
  accentColor: string;
  /** Real garment photograph (2D fallback track + Quick View). */
  image: string;
  /** Offline SVG cutout (last-resort if the CDN is unreachable). */
  cutout: string;
  availableSizes: string[];
  /** Short label printed on the back of the garment (visible at 180°). */
  backLabel: string;
}

// ---------------------------------------------------------------------------
// Curated rail — Dhaka streetwear staples, BDT pricing, bilingual.
// Cutout artwork is an inline SVG data-URI (offline-safe, zero paid calls).
// ---------------------------------------------------------------------------

function cutout(input: { body: string; accent: string; label: string }): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" role="img" aria-label="${input.label}">` +
    `<path d="M70 18 Q100 34 130 18 L168 44 L146 76 L146 210 L54 210 L54 76 L32 44 Z" fill="${input.body}"/>` +
    `<path d="M86 30 Q100 40 114 30 L114 210 L86 210 Z" fill="${input.accent}" opacity="0.55"/>` +
    `<rect x="54" y="196" width="92" height="10" rx="5" fill="${input.accent}"/>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const RAIL_PRODUCTS: RailProduct[] = [
  {
    id: "rail-hoodie-heavy",
    title: "Heavyweight Oversized Hoodie",
    brand: "AinA Studio",
    priceBDT: 3850,
    microDescription: "Crafted in 450 GSM French terry fleece. Dropped shoulders.",
    microBn: "৪৫০ GSM ফ্রেঞ্চ টেরি ফ্লিস। ড্রপড শোল্ডার।",
    inStock: true,
    colorHex: "#232326",
    accentColor: "#FF2D95",
    image: squareUrl(PRODUCT_PHOTOS.hoodieFlat),
    cutout: cutout({ body: "#232326", accent: "#FF2D95", label: "Heavyweight Oversized Hoodie" }),
    availableSizes: ["S", "M", "L", "XL"],
    backLabel: "AINA HEAVY 450",
  },
  {
    id: "rail-tee-graphic",
    title: "Oversized Graphic Tee — Neon Rickshaw",
    brand: "AinA Studio",
    priceBDT: 1450,
    microDescription: "240 GSM combed cotton. Back print by Dhaka street artists.",
    microBn: "২৪০ GSM কম্বড কটন। ব্যাক প্রিন্ট।",
    inStock: true,
    colorHex: "#F4F1EA",
    accentColor: "#FF2D95",
    image: squareUrl(PRODUCT_PHOTOS.teesRail),
    cutout: cutout({ body: "#F4F1EA", accent: "#FF2D95", label: "Oversized Graphic Tee" }),
    availableSizes: ["S", "M", "L", "XL"],
    backLabel: "RICKSHAW CLUB",
  },
  {
    id: "rail-bomber-dwr",
    title: "DWR Utility Bomber",
    brand: "AinA Studio",
    priceBDT: 3850,
    microDescription: "Water-repellent shell for monsoon commutes. Sealed zips.",
    microBn: "বর্ষার জন্য ওয়াটার-রিপেলেন্ট শেল।",
    inStock: true,
    colorHex: "#27272A",
    accentColor: "#3FB6E0",
    image: squareUrl(PRODUCT_PHOTOS.leatherJacket),
    cutout: cutout({ body: "#27272A", accent: "#3FB6E0", label: "DWR Utility Bomber" }),
    availableSizes: ["M", "L", "XL"],
    backLabel: "MONSOON PROOF",
  },
  {
    id: "rail-cargo-ripstop",
    title: "Ripstop Cargo Overshirt",
    brand: "Dhaka Tailor Lab",
    priceBDT: 2650,
    microDescription: "Six-pocket ripstop. Breathes through Dhaka humidity.",
    microBn: "ছয় পকেটের রিপস্টপ। আর্দ্রতায় আরামদায়ক।",
    inStock: true,
    colorHex: "#3E4A3A",
    accentColor: "#3FB6E0",
    image: squareUrl(PRODUCT_PHOTOS.shirtsRail),
    cutout: cutout({ body: "#3E4A3A", accent: "#3FB6E0", label: "Ripstop Cargo Overshirt" }),
    availableSizes: ["S", "M", "L"],
    backLabel: "TAILOR LAB 06",
  },
  {
    id: "rail-panjabi-eid",
    title: "Hand-Embroidered Panjabi",
    brand: "Aarong Craft",
    priceBDT: 3250,
    microDescription: "Hand-embroidered placket. Eid evening staple.",
    microBn: "হাতে সেলাই করা প্ল্যাকেট। ঈদের জন্য।",
    inStock: true,
    colorHex: "#E8DFC8",
    accentColor: "#FF2D95",
    image: squareUrl(PRODUCT_PHOTOS.whiteTee),
    cutout: cutout({ body: "#E8DFC8", accent: "#FF2D95", label: "Hand-Embroidered Panjabi" }),
    availableSizes: ["38", "40", "42", "44"],
    backLabel: "EID CRAFT",
  },
  {
    id: "rail-denim-jacket",
    title: "Washed Denim Trucker Jacket",
    brand: "Dhaka Tailor Lab",
    priceBDT: 3450,
    microDescription: "14oz selvedge-style denim. Stone-washed in Gazipur.",
    microBn: "১৪oz ডেনিম। স্টোন-ওয়াশড।",
    inStock: false,
    colorHex: "#2E3D55",
    accentColor: "#E8E8E5",
    image: squareUrl(PRODUCT_PHOTOS.denimStack),
    cutout: cutout({ body: "#2E3D55", accent: "#E8E8E5", label: "Washed Denim Trucker Jacket" }),
    availableSizes: ["M", "L", "XL"],
    backLabel: "GAZIPUR WASH",
  },
  {
    id: "rail-knit-crew",
    title: "Cerulean Knit Crew Sweater",
    brand: "AinA Studio",
    priceBDT: 2950,
    microDescription: "Mid-weight knit for AC-heavy offices and winter evenings.",
    microBn: "মিড-ওয়েট নিট। শীতের সন্ধ্যার জন্য।",
    inStock: true,
    colorHex: "#007BA7",
    accentColor: "#3FB6E0",
    image: squareUrl(PRODUCT_PHOTOS.knitDetail),
    cutout: cutout({ body: "#007BA7", accent: "#3FB6E0", label: "Cerulean Knit Crew Sweater" }),
    availableSizes: ["S", "M", "L", "XL"],
    backLabel: "CERULEAN KNIT",
  },
];

// ---------------------------------------------------------------------------
// Pure carousel physics helpers (unit-tested, no side effects)
// ---------------------------------------------------------------------------

/** Clamp an index into [0, total-1]. Non-finite input → 0. */
export function clampRailIndex(index: number, total: number): number {
  if (total <= 0 || !Number.isFinite(index)) return 0;
  return Math.min(total - 1, Math.max(0, Math.round(index)));
}

/**
 * Rubber-band resistance: offsets inside [min, max] pass through untouched;
 * overshoot beyond a boundary is compressed so the rail "stretches" with
 * diminishing returns (classic iOS-style banding).
 */
export function rubberBandOffset(offset: number, min: number, max: number, resistance = 0.35): number {
  if (!Number.isFinite(offset)) return min;
  if (offset < min) return min + (offset - min) * resistance;
  if (offset > max) return max + (offset - max) * resistance;
  return offset;
}

/**
 * Which item should the rail snap to, given a continuous scroll offset in
 * "item units" (0 = first item centred) and the release velocity.
 * A flick (|velocity| > 0.35 items/s) advances one extra item.
 */
export function snapIndexFromOffset(offset: number, velocity: number, total: number): number {
  if (total <= 0) return 0;
  let target = Math.round(offset);
  if (velocity > 0.35) target += 1;
  if (velocity < -0.35) target -= 1;
  return clampRailIndex(target, total);
}

/**
 * Pendulum sway (degrees) from swipe velocity. Clamped to ±10° so hangers
 * swing dramatically but never flip. Sign follows drag direction.
 */
export function pendulumSwayDeg(velocity: number): number {
  if (!Number.isFinite(velocity)) return 0;
  const deg = velocity * 6;
  return Math.min(10, Math.max(-10, deg));
}

/**
 * Centre emphasis: the item nearest the rail centre scales to 1.15,
 * falling off linearly to 1.0 one item away.
 */
export function centerScale(distanceItems: number): number {
  const d = Math.min(1, Math.abs(distanceItems));
  return 1 + 0.15 * (1 - d);
}

/**
 * Lazy-load window: only the active item and its immediate neighbours
 * mount real 3D geometry (i−1, i, i+1), clamped to the catalogue bounds.
 */
export function visibleIndices(active: number, total: number): number[] {
  if (total <= 0) return [];
  const center = clampRailIndex(active, total);
  const out: number[] = [];
  for (let i = center - 1; i <= center + 1; i += 1) {
    if (i >= 0 && i < total) out.push(i);
  }
  return out;
}

/** Screen-reader announcement — exact product spec format. */
export function railAnnouncement(product: RailProduct, index: number, total: number): string {
  return `Product ${index + 1} of ${total}: ${product.title}, ${product.priceBDT} BDT`;
}

/** BDT formatting consistent with the rest of AinA (en-IN grouping). */
export function formatRailBdt(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}
