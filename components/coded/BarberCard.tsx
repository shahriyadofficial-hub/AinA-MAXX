"use client";

import React from "react";
import { Scissors, Printer, CheckCircle2 } from "lucide-react";
import type { BarberCard as BarberCardData } from "@/lib/ai/types";

interface BarberCardProps {
  card: BarberCardData;
  locale: "en" | "bn";
  referenceVisual?: string;
}

/**
 * Show-to-barber reference card (muse-image).
 * Bilingual numbered steps, lengths, and fade spec — designed to be shown
 * on a phone screen at a local barber shop. No face photo, no scores.
 */
export function BarberCard({ card, locale, referenceVisual }: BarberCardProps) {
  const bn = locale === "bn";
  const instructions = bn ? card.instructionsBn : card.instructionsEn;

  return (
    <article className="overflow-hidden rounded-aina border border-aina-cerulean/40 bg-aina-graphite shadow-glow-cerulean">
      <header className="flex items-start justify-between gap-3 bg-aina-cerulean/15 px-4 py-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-aina-light-cerulean">
            <Scissors className="h-3.5 w-3.5" />
            {bn ? "বারবার রেফারেন্স কার্ড" : "Barber Reference Card"}
          </p>
          <h3 className="mt-1 font-display text-base font-bold text-white">
            {bn ? card.styleNameBn : card.styleNameEn}
          </h3>
          <p className="text-xs text-neutral-400">
            {bn ? card.styleNameEn : card.styleNameBn}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-aina-light-cerulean">
          muse-image
        </span>
      </header>

      {referenceVisual && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={referenceVisual}
          alt="Haircut reference visual: front, side and back views"
          className="w-full border-y border-white/5"
        />
      )}

      <div className="grid grid-cols-3 gap-2 px-4 pt-3 text-center">
        {[
          { label: bn ? "উপরে" : "Top", value: card.topLength },
          { label: bn ? "পাশে" : "Sides", value: card.sidesLength },
          { label: bn ? "ফেড" : "Fade", value: card.fadeType },
        ].map((spec) => (
          <div key={spec.label} className="rounded-xl bg-black/30 px-2 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-aina-light-cerulean">
              {spec.label}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-neutral-200">{spec.value}</p>
          </div>
        ))}
      </div>

      <ol className="space-y-2 px-4 py-4">
        {instructions.map((step, i) => (
          <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-neutral-200">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-aina-rose text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className={bn ? "font-bengali" : undefined}>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mx-4 mb-4 rounded-xl bg-black/30 p-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-white">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          {bn ? "যত্ন ও রক্ষণাবেক্ষণ" : "Care & maintenance"}
        </p>
        <p className={`mt-1 text-xs leading-relaxed text-neutral-300 ${bn ? "font-bengali" : ""}`}>
          {bn ? card.maintenanceBn : card.maintenanceEn}
        </p>
      </div>

      <footer className="flex items-center justify-between border-t border-white/5 px-4 py-3">
        <p className="text-xs text-neutral-500">
          {bn
            ? "নাপিতকে এই কার্ডটি দেখান · হেয়ারলাইন স্বাভাবিক রাখুন"
            : "Show this card to your barber · Keep the hairline natural"}
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95"
        >
          <Printer className="h-3.5 w-3.5" />
          {bn ? "প্রিন্ট" : "Print"}
        </button>
      </footer>
    </article>
  );
}

export default BarberCard;
