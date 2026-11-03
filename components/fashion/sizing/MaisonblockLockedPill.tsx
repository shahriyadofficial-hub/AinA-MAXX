"use client";

// components/fashion/sizing/MaisonblockLockedPill.tsx
// Elegant locked teaser shown when a merchant has NOT supplied verified
// garment measurements. The Maisonblock engine stays dormant — no fake
// recommendations are ever produced from unverified data.

import React, { useId, useState } from "react";
import { Info, Lock } from "lucide-react";

export function MaisonblockLockedPill() {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <div className="relative mt-2.5">
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={tooltipId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-[36px] w-full items-center justify-center gap-2 rounded-full border border-dashed border-aina-cerulean/40 bg-aina-cerulean/[0.07] px-3 text-[11px] font-bold text-aina-light-cerulean transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-light-cerulean"
      >
        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Smart Size Fit · Coming Soon for Verified Precision Merchants</span>
        <Info className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
      </button>

      {open && (
        <p
          id={tooltipId}
          role="note"
          className="maisonblock-pop mt-2 rounded-2xl border border-aina-cerulean/30 bg-black/80 px-3.5 py-2.5 text-[11px] leading-relaxed text-neutral-300"
        >
          Maisonblock is a deterministic sizing engine — it activates only for brands that provide{" "}
          <strong className="text-white">verified per-size garment measurements</strong> (chest, length, sleeve in cm).
          This seller has not published verified measurements yet, so we will not guess your size. Your body inputs,
          when the engine is available, stay on your device only — never stored or sent to our servers (PDPA 2026).
        </p>
      )}
    </div>
  );
}

export default MaisonblockLockedPill;
