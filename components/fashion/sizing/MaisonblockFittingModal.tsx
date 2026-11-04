"use client";

// components/fashion/sizing/MaisonblockFittingModal.tsx
// Maisonblock Fitting Engine — premium size recommendation for Verified
// Precision Merchants only.
//
// PRIVACY (PDPA 2026): body dimensions live exclusively in React state and
// sessionStorage (tab-scoped, cleared with the tab). Nothing is fetched,
// posted, logged, or written to any backend. The engine is deterministic
// and runs 100% on-device (lib/fashion/maisonblock.ts).
//
// Layout: desktop = centered 2-column modal (max-w-3xl); mobile = bottom
// sheet (max-h-[85vh]) with a 3-step snapping flow. All motion uses GPU
// transforms/opacity only — no layout animation, no extra libraries.

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { BadgeCheck, ChevronDown, ChevronLeft, Lock, Ruler, ShieldCheck, Sparkles, X } from "lucide-react";
import { formatLookBdt, type LookProduct } from "@/lib/fashion/lookbook";
import {
  HEIGHT_MAX_CM,
  HEIGHT_MIN_CM,
  WEIGHT_MAX_KG,
  WEIGHT_MIN_KG,
  formatHeightImperial,
  formatMeasurement,
  kgToLbs,
  recommendSize,
  type ChestShape,
  type FitPreference,
  type HipShape,
  type StomachShape,
  type UserFitInput,
} from "@/lib/fashion/maisonblock";

const FIT_STORAGE_KEY = "aina-maisonblock-fit-v1";

type UnitSystem = "metric" | "imperial";

interface MaisonblockFittingModalProps {
  open: boolean;
  product: LookProduct | null;
  onClose: () => void;
  /** Binds the recommended size into the card's variant selector. */
  onSelectSize: (productId: string, size: string) => void;
}

const DEFAULT_INPUT: UserFitInput = {
  heightCm: 170,
  weightKg: 68,
  chestShape: "regular",
  stomachShape: "regular",
  hipShape: "regular",
  fitPreference: "regular",
};

const CHEST_OPTIONS: Array<{ id: ChestShape; label: string }> = [
  { id: "slim", label: "Slim" },
  { id: "regular", label: "Regular" },
  { id: "athletic", label: "Athletic" },
  { id: "broad", label: "Broad" },
];
const STOMACH_OPTIONS: Array<{ id: StomachShape; label: string }> = [
  { id: "flat", label: "Flat" },
  { id: "regular", label: "Regular" },
  { id: "full", label: "Full" },
];
const HIP_OPTIONS: Array<{ id: HipShape; label: string }> = [
  { id: "slim", label: "Slim" },
  { id: "regular", label: "Regular" },
  { id: "wide", label: "Wide" },
];
const FIT_OPTIONS: Array<{ id: FitPreference; label: string; hint: string }> = [
  { id: "fitted", label: "Fitted", hint: "Close, clean lines" },
  { id: "regular", label: "Regular", hint: "Everyday drape" },
  { id: "relaxed", label: "Relaxed / Oversized", hint: "Street silhouette" },
];

function loadStoredInput(): UserFitInput {
  try {
    if (typeof window === "undefined") return DEFAULT_INPUT;
    const raw = window.sessionStorage.getItem(FIT_STORAGE_KEY);
    if (!raw) return DEFAULT_INPUT;
    const parsed = JSON.parse(raw) as Partial<UserFitInput>;
    return { ...DEFAULT_INPUT, ...parsed };
  } catch {
    return DEFAULT_INPUT;
  }
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            aria-pressed={value === opt.id}
            onClick={() => onChange(opt.id)}
            className={`min-h-[40px] rounded-full px-3.5 text-xs font-bold transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
              value === opt.id ? "bg-white text-black" : "border border-white/15 bg-white/5 text-neutral-300 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function MaisonblockFittingModal({ open, product, onClose, onSelectSize }: MaisonblockFittingModalProps) {
  const [step, setStep] = useState(0);
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [input, setInput] = useState<UserFitInput>(DEFAULT_INPUT);
  const [chartOpen, setChartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Restore tab-session inputs (sessionStorage only — never localStorage,
  // never a server). Runs once when the modal first opens.
  useEffect(() => {
    if (open && !hydrated) {
      setInput(loadStoredInput());
      setHydrated(true);
    }
    if (open) setStep(0);
  }, [open, hydrated]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(FIT_STORAGE_KEY, JSON.stringify(input));
    } catch {
      // Private-mode storage denial must never break the fitting flow.
    }
  }, [input, open]);

  // Focus management + Escape to close.
  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const garment = product?.garmentMeasurements;
  const recommendation = useMemo(
    () => (garment ? recommendSize(garment, input) : null),
    [garment, input]
  );

  const patch = useCallback(<K extends keyof UserFitInput>(key: K, value: UserFitInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  }, []);

  if (!open || !product || !garment || !recommendation) return null;

  const heightDisplay = unit === "metric" ? `${input.heightCm} cm` : formatHeightImperial(input.heightCm);
  const weightDisplay = unit === "metric" ? `${input.weightKg} kg` : `${Math.round(kgToLbs(input.weightKg))} lbs`;

  const handleApply = (size: string) => {
    onSelectSize(product.id, size);
    onClose();
  };

  const stepContent = [
    // ── Step 1 · Measurements ──────────────────────────────────────────
    <div key="step-1" className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">Your measurements</h3>
        <div className="flex rounded-full border border-white/10 bg-white/5 p-0.5" role="group" aria-label="Unit system">
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              type="button"
              aria-pressed={unit === u}
              onClick={() => setUnit(u)}
              className={`min-h-[32px] rounded-full px-3 text-[11px] font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                unit === u ? "bg-aina-rose text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {u === "metric" ? "cm / kg" : "in / lbs"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="mb-height" className="text-xs font-semibold text-neutral-300">Height</label>
          <span className="rounded-full bg-aina-rose/15 px-2.5 py-1 font-display text-xs font-extrabold text-aina-rose" aria-live="polite">{heightDisplay}</span>
        </div>
        <input
          id="mb-height"
          type="range"
          min={HEIGHT_MIN_CM}
          max={HEIGHT_MAX_CM}
          step={1}
          value={input.heightCm}
          onChange={(e) => patch("heightCm", Number(e.target.value))}
          aria-valuetext={heightDisplay}
          className="maisonblock-range mt-2 w-full"
        />
        <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
          <span>{unit === "metric" ? "140 cm" : `4'6"`}</span>
          <span>{unit === "metric" ? "210 cm" : `6'11"`}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="mb-weight" className="text-xs font-semibold text-neutral-300">Weight</label>
          <span className="rounded-full bg-aina-rose/15 px-2.5 py-1 font-display text-xs font-extrabold text-aina-rose" aria-live="polite">{weightDisplay}</span>
        </div>
        <input
          id="mb-weight"
          type="range"
          min={WEIGHT_MIN_KG}
          max={WEIGHT_MAX_KG}
          step={1}
          value={input.weightKg}
          onChange={(e) => patch("weightKg", Number(e.target.value))}
          aria-valuetext={weightDisplay}
          className="maisonblock-range mt-2 w-full"
        />
        <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
          <span>{unit === "metric" ? "40 kg" : "88 lbs"}</span>
          <span>{unit === "metric" ? "120 kg" : "265 lbs"}</span>
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[11px] leading-relaxed text-neutral-400">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
        Private by design: these numbers stay in this tab only (session memory). Nothing is uploaded, stored, or shared — PDPA 2026.
      </p>
    </div>,

    // ── Step 2 · Body composition ──────────────────────────────────────
    <div key="step-2" className="space-y-4">
      <h3 className="text-sm font-bold text-white">Body shape & composition</h3>
      <OptionGroup label="Chest" options={CHEST_OPTIONS} value={input.chestShape} onChange={(v) => patch("chestShape", v)} />
      <OptionGroup label="Stomach" options={STOMACH_OPTIONS} value={input.stomachShape} onChange={(v) => patch("stomachShape", v)} />
      <OptionGroup label="Hips" options={HIP_OPTIONS} value={input.hipShape ?? "regular"} onChange={(v) => patch("hipShape", v)} />
      <p className="text-[11px] leading-relaxed text-neutral-500">
        Shape selectors adjust garment ease only — for example, an athletic or broad chest automatically reserves +5–8cm of chest room so shoulders never pull.
      </p>
    </div>,

    // ── Step 3 · Fit preference ────────────────────────────────────────
    <div key="step-3" className="space-y-4">
      <h3 className="text-sm font-bold text-white">How do you like it to fit?</h3>
      <div className="space-y-2" role="group" aria-label="Fit preference">
        {FIT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            aria-pressed={input.fitPreference === opt.id}
            onClick={() => patch("fitPreference", opt.id)}
            className={`flex min-h-[52px] w-full items-center justify-between rounded-2xl border px-4 text-left transition active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
              input.fitPreference === opt.id ? "border-aina-rose/70 bg-aina-rose/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"
            }`}
          >
            <span>
              <span className="block text-sm font-bold text-white">{opt.label}</span>
              <span className="block text-[11px] text-neutral-400">{opt.hint}</span>
            </span>
            <span className={`h-3 w-3 rounded-full ${input.fitPreference === opt.id ? "bg-aina-rose shadow-glow-rose" : "bg-white/20"}`} aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="text-[11px] leading-relaxed text-neutral-500">
        When two neighbouring sizes score within 10 points, Maisonblock shows both — one fitted, one relaxed — so the final call is always yours.
      </p>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      {/* Backdrop */}
      <button type="button" aria-label="Close fitting engine" onClick={onClose} className="maisonblock-fade absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Sheet (mobile) / Modal (desktop) */}
      <div className="maisonblock-sheet relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-aina-graphite shadow-2xl md:max-h-[90vh] md:max-w-3xl md:rounded-[28px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 pb-4 pt-5">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-aina-rose/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-aina-rose">
              <Sparkles className="h-3 w-3" aria-hidden="true" /> Maisonblock Fitting Engine
            </p>
            <h2 id={titleId} className="mt-2 font-display text-lg font-extrabold leading-snug text-white">
              Find My Fit · {product.name}
            </h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-neutral-400">
              <span>{product.brand} · {formatLookBdt(product.priceBDT)}</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified Precision Merchant
              </span>
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-1.5 px-5 pt-4" aria-label={`Step ${step + 1} of 3`}>
          {["Measurements", "Body Shape", "Fit Preference"].map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(idx)}
              aria-current={idx === step ? "step" : undefined}
              className={`min-h-[36px] flex-1 rounded-full px-2 text-[11px] font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                idx === step ? "bg-white text-black" : idx < step ? "bg-aina-cerulean/25 text-aina-light-cerulean" : "bg-white/5 text-neutral-400"
              }`}
            >
              {idx + 1}. {label}
            </button>
          ))}
        </div>

        {/* Body: 2-column on desktop */}
        <div className="grid flex-1 grid-cols-1 gap-0 overflow-y-auto md:grid-cols-2 md:overflow-hidden">
          {/* Left: inputs */}
          <div className="px-5 py-5 md:overflow-y-auto">{stepContent[step]}</div>

          {/* Right: live recommendation */}
          <div className="border-t border-white/10 bg-black/30 px-5 py-5 md:overflow-y-auto md:border-l md:border-t-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-aina-light-cerulean">Live Recommendation</p>

            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-aina-rose font-display text-2xl font-black text-white shadow-glow-rose" aria-label={`Recommended size ${recommendation.primarySize}`}>
                {recommendation.primarySize}
              </span>
              <div>
                <p className="text-sm font-extrabold text-white">
                  Size {recommendation.primarySize}
                  <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    {recommendation.confidence} match
                  </span>
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-400">
                  Est. chest {formatMeasurement(recommendation.estimatedChestCm, unit)} · Garment ease {formatMeasurement(Math.max(0, recommendation.easeCm), unit)}
                </p>
              </div>
            </div>

            <p aria-live="polite" className="mt-3 text-xs leading-relaxed text-neutral-300">{recommendation.reasoning}</p>

            {recommendation.dualMessage && (
              <p className="mt-2 rounded-2xl border border-aina-cerulean/30 bg-aina-cerulean/10 px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-aina-light-cerulean">
                {recommendation.dualMessage}
              </p>
            )}

            {/* Score breakdown (deterministic weights, shown honestly) */}
            <div className="mt-4 space-y-1.5">
              {recommendation.scores.slice(0, 4).map((s) => (
                <div key={s.size} className="flex items-center gap-2 text-[11px]">
                  <span className={`w-7 font-display font-extrabold ${s.size === recommendation.primarySize ? "text-aina-rose" : "text-neutral-400"}`}>{s.size}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={Math.round(s.total)} aria-valuemin={0} aria-valuemax={100} aria-label={`Size ${s.size} fit score`}>
                    <div className={`h-full rounded-full transition-[width] duration-300 ${s.size === recommendation.primarySize ? "bg-aina-rose" : "bg-aina-cerulean/70"}`} style={{ width: `${Math.round(s.total)}%` }} />
                  </div>
                  <span className="w-8 text-right font-semibold text-neutral-300">{Math.round(s.total)}</span>
                </div>
              ))}
              <p className="pt-1 text-[10px] leading-relaxed text-neutral-500">Weighted: Chest 40% · Length 25% · Weight & stomach 20% · Preference 15%</p>
            </div>

            {/* Apply actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApply(recommendation.primarySize)}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-aina-rose px-5 text-sm font-extrabold text-white shadow-glow-rose transition hover:bg-aina-rose/90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Ruler className="h-4 w-4" aria-hidden="true" /> Select Size {recommendation.primarySize}
              </button>
              {recommendation.alternateSize && (
                <button
                  type="button"
                  onClick={() => handleApply(recommendation.alternateSize!)}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-aina-cerulean/50 bg-aina-cerulean/15 px-4 text-sm font-bold text-aina-light-cerulean transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-light-cerulean"
                >
                  Size {recommendation.alternateSize} instead
                </button>
              )}
            </div>

            {/* Fallback size chart accordion */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <button
                type="button"
                aria-expanded={chartOpen}
                onClick={() => setChartOpen((v) => !v)}
                className="flex min-h-[44px] w-full items-center justify-between px-4 text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
              >
                <span>Full size chart · verified measurements ({unit === "metric" ? "cm" : "in"})</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${chartOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {chartOpen && (
                <div className="maisonblock-pop overflow-x-auto px-4 pb-4">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-neutral-500">
                        <th className="py-1.5 pr-2 font-bold">Size</th>
                        <th className="py-1.5 pr-2 font-bold">Chest</th>
                        <th className="py-1.5 pr-2 font-bold">Length</th>
                        <th className="py-1.5 font-bold">Sleeve</th>
                      </tr>
                    </thead>
                    <tbody>
                      {garment.sizes.map((size) => {
                        const m = garment.measurements[size];
                        if (!m) return null;
                        return (
                          <tr key={size} className={size === recommendation.primarySize ? "font-bold text-aina-rose" : "text-neutral-300"}>
                            <td className="py-1.5 pr-2">{size}</td>
                            <td className="py-1.5 pr-2">{formatMeasurement(m.chest_cm, unit)}</td>
                            <td className="py-1.5 pr-2">{formatMeasurement(m.length_cm, unit)}</td>
                            <td className="py-1.5">{m.sleeve_cm ? formatMeasurement(m.sleeve_cm, unit) : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-neutral-500">
              <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              Maisonblock runs entirely on your device. No body data is sent to AinA or the merchant.
            </p>
          </div>
        </div>

        {/* Footer step navigation */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-5 py-3.5">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-bold text-white transition active:scale-95 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back
          </button>
          <span className="text-[11px] font-semibold text-neutral-500">Step {step + 1} of 3 · Updates live as you adjust</span>
          <button
            type="button"
            disabled={step === 2}
            onClick={() => setStep((s) => Math.min(2, s + 1))}
            className="inline-flex min-h-[44px] items-center rounded-full bg-white px-4 text-xs font-extrabold text-black transition active:scale-95 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
          >
            {step === 2 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MaisonblockFittingModal;
