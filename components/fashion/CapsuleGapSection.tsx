"use client";

// components/fashion/CapsuleGapSection.tsx
// AinA Drip · Experience 3 — Capsule Gap & Wardrobe Matching.
// "What Goes With What" occasion combos (Eid / Campus / Monsoon / Office /
// Evening) built from owned items + gap analysis against a lean capsule.

import React, { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, CloudRain, GraduationCap, MoonStar, Sparkles, Sun } from "lucide-react";
import {
  DEMO_WARDROBE,
  OCCASIONS,
  analyseCapsuleGaps,
  buildOccasionCombo,
  countPossibleOutfits,
  type OccasionId,
} from "@/lib/fashion/wardrobe";
import { formatLookBdt } from "@/lib/fashion/lookbook";

const OCCASION_ICON: Record<OccasionId, React.ComponentType<{ className?: string }>> = {
  eid: MoonStar,
  campus: GraduationCap,
  monsoon: CloudRain,
  office: Sun,
  evening: Sparkles,
};

export function CapsuleGapSection() {
  const [occasion, setOccasion] = useState<OccasionId>("monsoon");
  const gaps = useMemo(() => analyseCapsuleGaps(DEMO_WARDROBE), []);
  const combo = useMemo(() => buildOccasionCombo(DEMO_WARDROBE, occasion), [occasion]);
  const outfits = useMemo(() => countPossibleOutfits(DEMO_WARDROBE), []);
  const Icon = OCCASION_ICON[occasion];

  return (
    <section aria-labelledby="capsule-heading" className="space-y-4">
      <div className="px-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-aina-light-cerulean">Experience 03 · Capsule Gap & Matching</p>
        <h2 id="capsule-heading" className="mt-1 font-display text-xl font-extrabold text-white sm:text-2xl">
          What goes with what — for Dhaka weather
        </h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-neutral-400 sm:text-sm">
          Your {DEMO_WARDROBE.length} owned pieces already make <strong className="text-white">{outfits}+ verified outfits</strong>.
          Pick an occasion and AinA builds the combo from your wardrobe, flagging only the true gaps.
        </p>
      </div>

      {/* Occasion switcher */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Choose an occasion">
        {OCCASIONS.map((o) => {
          const OIcon = OCCASION_ICON[o.id];
          const active = o.id === occasion;
          return (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setOccasion(o.id)}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-xs font-bold transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                active ? "bg-aina-cerulean text-white shadow-glow-cerulean" : "border border-white/10 bg-white/5 text-neutral-300 hover:text-white"
              }`}
            >
              <OIcon className="h-4 w-4" /> {o.labelEn} <span className="font-bengali font-medium opacity-80">{o.labelBn}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        {/* Occasion combo */}
        <div className="rounded-[28px] border border-white/10 bg-aina-graphite/80 p-5 shadow-2xl backdrop-blur-xl lg:col-span-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 font-display text-base font-extrabold text-white">
                <Icon className="h-5 w-5 text-aina-light-cerulean" /> {combo.labelEn} combo · <span className="font-bengali text-sm font-medium text-neutral-400">{combo.labelBn}</span>
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">{combo.weatherNote}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-2xl font-extrabold text-white">{combo.readyPercent}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">wardrobe ready</p>
            </div>
          </div>

          {/* Readiness bar */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={combo.readyPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`${combo.labelEn} combo readiness`}>
            <div className="h-full rounded-full bg-gradient-to-r from-aina-cerulean to-aina-rose transition-all duration-500" style={{ width: `${combo.readyPercent}%` }} />
          </div>

          <ul className="mt-4 space-y-2.5">
            {combo.slots.map((slot) => (
              <li key={`${slot.category}-${slot.itemName}`} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3.5 py-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white">
                    <span className="mr-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-aina-light-cerulean">{slot.category}</span>
                    {slot.itemName}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">{slot.why}</p>
                </div>
              </li>
            ))}
            {combo.missingCategories.map((cat) => (
              <li key={`missing-${cat}`} className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-3.5 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-xs leading-relaxed text-amber-200">
                  <span className="mr-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">{cat}</span>
                  Not in your wardrobe yet — see the gap suggestion on the right.
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Gap analysis */}
        <div className="space-y-2.5 lg:col-span-5">
          <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-neutral-400">Capsule gap analysis · Dhaka lean capsule</h3>
          {gaps.map((gap) => (
            <article key={gap.category} className="rounded-2xl border border-white/10 bg-aina-graphite/70 px-4 py-3.5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-white">{gap.label}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    gap.status === "covered"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : gap.status === "thin"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-aina-rose/15 text-aina-rose"
                  }`}
                >
                  {gap.have}/{gap.recommended} · {gap.status}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                <div
                  className={`h-full rounded-full ${gap.status === "covered" ? "bg-emerald-400" : gap.status === "thin" ? "bg-amber-400" : "bg-aina-rose"}`}
                  style={{ width: `${Math.min(100, (gap.have / gap.recommended) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">
                {gap.suggestion}
                {gap.suggestionPriceBDT > 0 ? <span className="font-semibold text-white"> · {formatLookBdt(gap.suggestionPriceBDT)}</span> : null}
              </p>
            </article>
          ))}
          <p className="px-1 text-[11px] leading-relaxed text-neutral-500">
            Gap logic is effort-based, never body-based: AinA suggests pieces that unlock more outfits per taka — not changes to you.
          </p>
        </div>
      </div>
    </section>
  );
}

export default CapsuleGapSection;
