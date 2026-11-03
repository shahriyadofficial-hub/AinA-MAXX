// lib/fashion/orzr.ts
// ORZR by Tsuru Kawagoe — Interactive Layered 2D Fashion Rack & Accessory Archive.
// Pure data contract + rack geometry math (no React, no network, no secrets).
// Non-transactional archive: no prices, no cart — tactile discovery only.
//
// Asset note: `layers.base` follows the archive contract
// (/assets/orzr/*.png). Until real transparent PNG cutouts are placed in
// public/assets/orzr/, `silhouette` provides an inline high-contrast SVG
// fallback so the experience renders identically offline. `photo` is a real
// editorial photograph (Unsplash, verified in lib/media/photos.ts) shown as
// the archive's photographic plate alongside the layered silhouette.

import { PRODUCT_PHOTOS, photoUrl } from "@/lib/media/photos";

export type OrzrCategory = "CLOTHING" | "ACCESSORY";

export interface OrzrItem {
  id: string;
  name: string;
  category: OrzrCategory;
  /** e.g. "01 / 04" — position within its category archive. */
  number: string;
  description: string;
  details: string[];
  /** Material metadata label, e.g. "MATERIAL: HEAVY COTTON". */
  material: string;
  layers: {
    /** Transparent PNG cutout (archive contract path). */
    base: string;
    shadow?: string;
  };
  /** Inline SVG silhouette used until the PNG asset exists. */
  silhouette: string;
  /** Real editorial photograph for the archive plate (Unsplash CDN). */
  photo: string;
}

function silhouetteUri(body: string, detail: string, kind: "garment" | "ring" | "strap" | "frame"): string {
  let shape = "";
  if (kind === "garment") {
    shape =
      `<path d="M70 30 Q100 48 130 30 L172 58 L148 92 L148 218 L52 218 L52 92 L28 58 Z" fill="${body}"/>` +
      `<path d="M88 40 Q100 50 112 40 L112 218 L88 218 Z" fill="${detail}" opacity="0.5"/>` +
      `<rect x="52" y="204" width="96" height="9" fill="${detail}"/>`;
  } else if (kind === "ring") {
    shape =
      `<circle cx="100" cy="118" r="62" fill="none" stroke="${body}" stroke-width="17"/>` +
      `<path d="M52 78 A62 62 0 0 1 148 78" fill="none" stroke="${detail}" stroke-width="5" opacity="0.8"/>` +
      `<rect x="82" y="38" width="36" height="14" fill="${detail}"/>`;
  } else if (kind === "strap") {
    shape =
      `<rect x="84" y="18" width="32" height="204" rx="14" fill="${body}"/>` +
      `<circle cx="100" cy="120" r="46" fill="${detail}"/>` +
      `<circle cx="100" cy="120" r="34" fill="#000"/>` +
      `<path d="M100 96 L100 120 L118 132" stroke="${body}" stroke-width="5" fill="none"/>`;
  } else {
    shape =
      `<rect x="34" y="84" width="132" height="66" rx="30" fill="none" stroke="${body}" stroke-width="11"/>` +
      `<path d="M34 104 L14 96 M166 104 L186 96" stroke="${body}" stroke-width="9"/>` +
      `<rect x="58" y="102" width="84" height="30" rx="15" fill="${detail}" opacity="0.55"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" role="img">${shape}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const ORZR_CATALOG: OrzrItem[] = [
  {
    id: "oversized-shirt",
    name: "OVERSIZED SHIRT",
    category: "CLOTHING",
    number: "01 / 04",
    description:
      "Boxy drop-shoulder cut in dry-handle poplin. Engineered collar stand with double-folded cuff construction.",
    details: ["100% Japanese Cotton", "Relaxed Proportion", "Cold Wash Only"],
    material: "MATERIAL: DRY POPLIN",
    layers: { base: "/assets/orzr/shirt-base.png", shadow: "/assets/orzr/shirt-shadow.png" },
    photo: photoUrl(PRODUCT_PHOTOS.whiteTee, 900),
    silhouette: silhouetteUri("#EDEDE8", "#8A8A84", "garment"),
  },
  {
    id: "heavy-hoodie",
    name: "HEAVYWEIGHT HOODIE",
    category: "CLOTHING",
    number: "02 / 04",
    description:
      "450 GSM French terry with a sculpted double-layer hood. Garment-dyed, then brushed once for a matte hand.",
    details: ["450 GSM French Terry", "Double-layer Hood", "Garment-dyed"],
    material: "MATERIAL: HEAVY COTTON",
    layers: { base: "/assets/orzr/hoodie-base.png", shadow: "/assets/orzr/hoodie-shadow.png" },
    photo: photoUrl(PRODUCT_PHOTOS.hoodieFlat, 900),
    silhouette: silhouetteUri("#232326", "#FF2D95", "garment"),
  },
  {
    id: "tailored-trouser",
    name: "TAILORED WIDE TROUSER",
    category: "CLOTHING",
    number: "03 / 04",
    description:
      "Single-pleat wide leg in compact twill. Cut long, hemmed by hand, built to pool over a heavy sole.",
    details: ["Compact Cotton Twill", "Single Pleat", "Hand-finished Hem"],
    material: "MATERIAL: COMPACT TWILL",
    layers: { base: "/assets/orzr/trouser-base.png" },
    photo: photoUrl(PRODUCT_PHOTOS.denimStack, 900),
    silhouette: silhouetteUri("#3E4A5A", "#3FB6E0", "garment"),
  },
  {
    id: "monsoon-shell",
    name: "MONSOON SHELL JACKET",
    category: "CLOTHING",
    number: "04 / 04",
    description:
      "Sealed-seam DWR shell for Dhaka rain. Storm placket, two-way zip, and a hood that disappears into the collar.",
    details: ["DWR Sealed Seams", "Two-way Zip", "Packable Hood"],
    material: "MATERIAL: RIPSTOP NYLON",
    layers: { base: "/assets/orzr/shell-base.png", shadow: "/assets/orzr/shell-shadow.png" },
    photo: photoUrl(PRODUCT_PHOTOS.leatherJacket, 900),
    silhouette: silhouetteUri("#1E293B", "#3FB6E0", "garment"),
  },
  {
    id: "form-ring",
    name: "FORM RING",
    category: "ACCESSORY",
    number: "01 / 03",
    description:
      "Carved solid 925 sterling silver band with brutalist bevel contours and satin-brushed raw finish.",
    details: ["925 Sterling Silver", "Hand-finished in Tokyo", "Weight: 18g"],
    material: "MATERIAL: STERLING SILVER",
    layers: { base: "/assets/orzr/ring-base.png" },
    photo: photoUrl(PRODUCT_PHOTOS.watchGold, 900),
    silhouette: silhouetteUri("#C9C9CE", "#FFFFFF", "ring"),
  },
  {
    id: "chrono-strap",
    name: "ARCHIVE CHRONO",
    category: "ACCESSORY",
    number: "02 / 03",
    description:
      "Matte black case on a raw-cut leather strap. No logo on the dial — the archive number is engraved on the caseback.",
    details: ["316L Steel Case", "Raw-cut Leather Strap", "Engraved Caseback"],
    material: "MATERIAL: STEEL / LEATHER",
    layers: { base: "/assets/orzr/chrono-base.png" },
    photo: photoUrl(PRODUCT_PHOTOS.watchFlat, 900),
    silhouette: silhouetteUri("#3A3A40", "#1A1A1A", "strap"),
  },
  {
    id: "frame-01",
    name: "FRAME 01 EYEWEAR",
    category: "ACCESSORY",
    number: "03 / 03",
    description:
      "Hand-polished acetate frame with a squared brutalist brow line. Five-barrel hinges, zero branding on the temple.",
    details: ["Italian Acetate", "Five-barrel Hinges", "Hand-polished"],
    material: "MATERIAL: ACETATE",
    layers: { base: "/assets/orzr/frame-base.png" },
    photo: photoUrl(PRODUCT_PHOTOS.sunglasses, 900),
    silhouette: silhouetteUri("#EDEDE8", "#8A8A84", "frame"),
  },
];

export function orzrItemsByCategory(category: OrzrCategory): OrzrItem[] {
  return ORZR_CATALOG.filter((item) => item.category === category);
}

// ---------------------------------------------------------------------------
// Pure rack geometry helpers (unit-tested, no side effects)
// ---------------------------------------------------------------------------

export interface RackTransform {
  rotateY: number;
  scale: number;
  translateZ: number;
  opacity: number;
  zIndex: number;
}

/**
 * Page-flip transform for an item at signed distance `d` from the active
 * centre (d < 0 = left of centre, d > 0 = right). Matches the ORZR spec:
 * centre = rotateY(0) scale(1) translateZ(0) opacity(1); immediate
 * neighbours = rotateY(∓35°) scale(0.85) translateZ(−80px) opacity(0.4).
 * Beyond one item away, values clamp so distant pieces stay readable ghosts.
 */
export function rackTransform(distance: number): RackTransform {
  const d = Number.isFinite(distance) ? distance : 0;
  const clamped = Math.max(-1, Math.min(1, d));
  const abs = Math.abs(clamped);
  // `+ 0` normalises -0 (from -35 * 0) so centre values are exactly +0.
  return {
    rotateY: -35 * clamped + 0,
    scale: 1 - 0.15 * abs,
    translateZ: -80 * abs + 0,
    opacity: 1 - 0.6 * abs,
    zIndex: 10 - Math.round(Math.abs(d)),
  };
}

/** CSS transform string for the rack (transform/opacity only — GPU-friendly). */
export function rackTransformCss(distance: number, reducedMotion: boolean): string {
  if (reducedMotion) return "none";
  const t = rackTransform(distance);
  return `rotateY(${t.rotateY}deg) scale(${t.scale}) translateZ(${t.translateZ}px)`;
}

/** Clamp an index into [0, total-1]. Non-finite input → 0. */
export function clampOrzrIndex(index: number, total: number): number {
  if (total <= 0 || !Number.isFinite(index)) return 0;
  return Math.min(total - 1, Math.max(0, Math.round(index)));
}

/**
 * Which item should the rack snap to after a drag, given a continuous
 * offset in item units and the release velocity (items/second).
 * A flick (|velocity| > 0.35) advances one extra item.
 */
export function snapOrzrIndex(offset: number, velocity: number, total: number): number {
  if (total <= 0) return 0;
  let target = Math.round(offset);
  if (velocity > 0.35) target += 1;
  if (velocity < -0.35) target -= 1;
  return clampOrzrIndex(target, total);
}

/** Convert a vertical wheel delta into a horizontal index step. */
export function wheelStep(deltaY: number, threshold = 24): number {
  if (!Number.isFinite(deltaY) || Math.abs(deltaY) < threshold) return 0;
  return deltaY > 0 ? 1 : -1;
}

/** Screen-reader announcement — ORZR spec format. */
export function orzrAnnouncement(item: OrzrItem, index: number, total: number): string {
  return `Viewing item ${index + 1} of ${total}: ${item.name}`;
}

/** Two-digit archive counter, e.g. "01 / 04". */
export function orzrCounter(index: number, total: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(index + 1)} / ${pad(total)}`;
}
