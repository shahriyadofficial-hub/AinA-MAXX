"use client";

// components/fashion/sizing/UniversalFitModal.tsx
// AinA Universal Fit (Bangladesh Edition) — bilingual tailor-mode modal.
//
// Quick Tailor Mode (মাত্র ৩টি ইনপুট): height (ft/in), chest (বুকের মাপ),
// weight (ওজন) + fit preference. Live deterministic verdicts across
// Aarong / Sailor-Yellow / Local F-Commerce charts. One tap binds the
// recommended size into the Lookbook sidebar variant selector.
//
// PDPA 2026: guests calculate fully in-memory. Saving is opt-in only —
// encrypted on-device storage, or account storage behind explicit consent.
// One-tap erasure wipes both.

import React, { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Eraser, Ruler, ShieldCheck, X } from "lucide-react";
import type { LookProduct } from "@/lib/fashion/lookbook";
import {
  brandChartForProduct,
  formatHeightImperial,
  garmentTypeForProduct,
  inchesToCm,
  type BodyType,
} from "@/lib/engine/bangladeshSizing";
import { FIT_OPTIONS, useUniversalFitEngine } from "./UniversalFitEngine";

interface UniversalFitModalProps {
  open: boolean;
  product: LookProduct | null;
  onClose: () => void;
  /** Binds the chosen size into the sidebar variant selector. */
  onSelectSize: (productId: string, size: string) => void;
}

const BODY_OPTIONS: { value: BodyType; en: string; bn: string }[] = [
  { value: "SLIM", en: "Slim", bn: "ছিপছিপে" },
  { value: "REGULAR", en: "Regular", bn: "স্বাভাবিক" },
  { value: "ATHLETIC", en: "Athletic", bn: "খেলোয়াড়ি" },
  { value: "HEAVY_CHEST", en: "Heavy Chest", bn: "ভারী বুক" },
  { value: "ROUND_BELLY", en: "Round Belly", bn: "পেট আছে" },
];

export function UniversalFitModal({ open, product, onClose, onSelectSize }: UniversalFitModalProps) {
  const engine = useUniversalFitEngine();
  const { profile, setProfile } = engine;
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [notice, setNotice] = useState<string | null>(null);

  const garmentType = useMemo(
    () =>
      product
        ? garmentTypeForProduct({ brand: product.brand, name: product.name, category: product.category })
        : "CASUAL_SHIRT",
    [product]
  );
  const verdicts = useMemo(() => engine.verdictsFor(garmentType), [engine, garmentType]);
  const productBrand = product ? brandChartForProduct(product.brand) : null;
  const productVerdict = verdicts.find((v) => v.brandName === productBrand) ?? verdicts[0];

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !product) return null;

  const feet = Math.floor(profile.heightInches / 12);
  const inchesPart = Math.round(profile.heightInches - feet * 12);
  const chestDisplay = unit === "in" ? `${profile.chestInches}"` : `${inchesToCm(profile.chestInches)} cm`;

  const handleSelectSize = async () => {
    if (!productVerdict) return;
    onSelectSize(product.id, productVerdict.sizeLabel);
    await engine.saveToDevice();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[72] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`AinA Universal Fit for ${product.name}`}
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] border border-white/10 bg-aina-graphite shadow-2xl sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-aina-cerulean/30 bg-aina-cerulean/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-aina-light-cerulean">
              <Ruler className="h-3.5 w-3.5" /> AinA Universal Fit · Bangladesh Edition
            </p>
            <h2 className="mt-2.5 font-display text-xl font-black text-white">
              মাপে ঠিক হবে তো? <span className="text-neutral-400">· {product.name}</span>
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
              দর্জির হিসাব অনুযায়ী সাইজ — Aarong, Sailor বা লোকাল শপ, যেখান থেকেই কিনুন। No login needed. Your
              measurements stay on this device unless you choose to save them.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Universal Fit"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          {/* ── Left: Quick Tailor Mode inputs ─────────────────────────── */}
          <div className="space-y-5 px-6 py-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white">
                Quick Tailor Mode <span className="font-bengali font-medium normal-case tracking-normal text-neutral-400">· মাত্র ৩টি ইনপুট</span>
              </h3>
              <div className="flex rounded-full border border-white/10 p-0.5" role="group" aria-label="Measurement unit">
                {(["in", "cm"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    aria-pressed={unit === u}
                    onClick={() => setUnit(u)}
                    className={`min-h-[32px] rounded-full px-3 text-[11px] font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                      unit === u ? "bg-white text-black" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {u === "in" ? "ইঞ্চি (in)" : "সেমি (cm)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Height — feet/inches selector */}
            <div>
              <label htmlFor="uf-height-feet" className="text-xs font-bold text-neutral-300">
                উচ্চতা (Height) · <span className="text-aina-light-cerulean">{formatHeightImperial(profile.heightInches)}</span>
              </label>
              <div className="mt-2 flex gap-2">
                <select
                  id="uf-height-feet"
                  value={feet}
                  onChange={(e) => setProfile({ heightInches: Number(e.target.value) * 12 + inchesPart })}
                  className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-aina-black px-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
                >
                  {[4, 5, 6].map((f) => (
                    <option key={f} value={f}>{f} ft (ফুট)</option>
                  ))}
                </select>
                <select
                  aria-label="Height inches part"
                  value={inchesPart}
                  onChange={(e) => setProfile({ heightInches: feet * 12 + Number(e.target.value) })}
                  className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-aina-black px-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>{i} in (ইঞ্চি)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chest slider — বুকের মাপ */}
            <div>
              <label htmlFor="uf-chest" className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span>বুকের মাপ (Chest)</span>
                <span className="rounded-full bg-aina-rose/15 px-2.5 py-1 font-display text-xs font-black text-aina-rose">{chestDisplay}</span>
              </label>
              <input
                id="uf-chest"
                type="range"
                min={34}
                max={48}
                step={0.5}
                value={profile.chestInches}
                onChange={(e) => setProfile({ chestInches: Number(e.target.value) })}
                className="maisonblock-range mt-2.5 w-full"
                aria-valuetext={chestDisplay}
              />
              <p className="mt-1 flex justify-between text-[10px] text-neutral-500"><span>34"</span><span>48"</span></p>
            </div>

            {/* Weight slider — ওজন */}
            <div>
              <label htmlFor="uf-weight" className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span>ওজন (Weight)</span>
                <span className="rounded-full bg-aina-cerulean/15 px-2.5 py-1 font-display text-xs font-black text-aina-light-cerulean">{profile.weightKg} kg</span>
              </label>
              <input
                id="uf-weight"
                type="range"
                min={45}
                max={110}
                step={1}
                value={profile.weightKg}
                onChange={(e) => setProfile({ weightKg: Number(e.target.value) })}
                className="maisonblock-range mt-2.5 w-full"
                aria-valuetext={`${profile.weightKg} kilograms`}
              />
              <p className="mt-1 flex justify-between text-[10px] text-neutral-500"><span>45 kg</span><span>110 kg</span></p>
            </div>

            {/* Waist — drives ROUND_BELLY bias */}
            <div>
              <label htmlFor="uf-waist" className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span>কোমরের মাপ (Waist)</span>
                <span className="rounded-full bg-white/5 px-2.5 py-1 font-display text-xs font-black text-white">{profile.waistInches}"</span>
              </label>
              <input
                id="uf-waist"
                type="range"
                min={28}
                max={46}
                step={0.5}
                value={profile.waistInches}
                onChange={(e) => setProfile({ waistInches: Number(e.target.value) })}
                className="maisonblock-range mt-2.5 w-full"
                aria-valuetext={`${profile.waistInches} inches`}
              />
            </div>

            {/* Body composition */}
            <div>
              <p className="text-xs font-bold text-neutral-300">শরীরের গড়ন (Body Shape)</p>
              <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Body composition">
                {BODY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={profile.bodyComposition === opt.value}
                    onClick={() => setProfile({ bodyComposition: opt.value })}
                    className={`min-h-[40px] rounded-full px-3 text-[11px] font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                      profile.bodyComposition === opt.value
                        ? "bg-white text-black"
                        : "border border-white/15 bg-white/5 text-neutral-300 hover:text-white"
                    }`}
                  >
                    <span className="font-bengali">{opt.bn}</span> · {opt.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit preference */}
            <div>
              <p className="text-xs font-bold text-neutral-300">ফিট পছন্দ (Fit Preference)</p>
              <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Fit preference">
                {FIT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={profile.fitPreference === opt.value}
                    onClick={() => setProfile({ fitPreference: opt.value })}
                    className={`min-h-[40px] rounded-full px-3 text-[11px] font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                      profile.fitPreference === opt.value
                        ? "bg-aina-rose text-white shadow-glow-rose"
                        : "border border-white/15 bg-white/5 text-neutral-300 hover:text-white"
                    }`}
                  >
                    <span className="font-bengali">{opt.bn}</span> ({opt.en})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: cross-check bar + verdicts + consent ────────────── */}
          <div className="border-t border-white/10 px-6 py-5 md:border-l md:border-t-0">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white">
              Local Brand Cross-Check <span className="font-bengali font-medium normal-case tracking-normal text-neutral-400">· ব্র্যান্ড অনুযায়ী সাইজ</span>
            </h3>

            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white/5 text-[10px] uppercase tracking-wider text-neutral-400">
                    <th scope="col" className="px-3 py-2.5 font-bold">ব্র্যান্ড (Brand)</th>
                    <th scope="col" className="px-3 py-2.5 font-bold">সাইজ (Size)</th>
                    <th scope="col" className="px-3 py-2.5 font-bold">ফিট (Fit)</th>
                  </tr>
                </thead>
                <tbody>
                  {verdicts.map((v) => {
                    const isProductBrand = v.brandName === productBrand;
                    return (
                      <tr key={v.brandName} className={`border-t border-white/5 ${isProductBrand ? "bg-aina-rose/10" : ""}`}>
                        <td className="px-3 py-2.5 font-bold text-white">
                          {v.brandName}
                          {isProductBrand && <span className="ml-1.5 text-[9px] uppercase tracking-wide text-aina-rose">· এই পণ্য</span>}
                        </td>
                        <td className="px-3 py-2.5 font-display text-sm font-black text-white">{v.sizeLabel}</td>
                        <td className="px-3 py-2.5">
                          <span className={`font-bengali font-semibold ${v.confidence === "best" ? "text-emerald-400" : v.confidence === "good" ? "text-aina-light-cerulean" : "text-amber-400"}`}>
                            {v.confidenceBn}
                          </span>{" "}
                          <span className="text-neutral-400">({v.confidenceEn})</span>
                          {v.sizedUpForShrinkage && <span className="block text-[10px] text-amber-300">ধোয়ার সঙ্কোচন বিবেচনায় +১ সাইজ</span>}
                          {v.bellyBiased && <span className="block text-[10px] text-aina-light-cerulean">পেটের মাপ অনুযায়ী</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bilingual verdict for this product's brand */}
            {productVerdict && (
              <div aria-live="polite" className="mt-4 space-y-2 rounded-2xl border border-aina-cerulean/25 bg-aina-cerulean/10 px-4 py-3">
                <p className="text-xs font-semibold leading-relaxed text-white">{productVerdict.verdictEn}</p>
                <p className="font-bengali text-xs leading-relaxed text-neutral-200">{productVerdict.verdictBn}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSelectSize}
              disabled={!productVerdict}
              className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-aina-rose px-5 font-display text-sm font-black text-white shadow-glow-rose transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <BadgeCheck className="h-4 w-4" />
              <span className="font-bengali">এই সাইজে সিলেক্ট করুন</span> (Select Size {productVerdict?.sizeLabel})
            </button>

            {/* PDPA 2026 consent + erasure */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5">
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-neutral-300">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>
                  <span className="font-bengali">আপনার শারীরিক মাপ নিরাপদভাবে সংরক্ষিত হবে কেবল সাইজ সুপারিশের জন্য।</span>{" "}
                  PDPA 2026: guest calculations never leave this device. Account storage needs your consent.
                </span>
              </p>
              <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-xs font-semibold text-white">
                <input
                  type="checkbox"
                  checked={engine.consentGranted}
                  onChange={(e) => engine.setConsentGranted(e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-[#FF2D95]"
                />
                Save my profile to my AinA account (আমার অ্যাকাউন্টে সংরক্ষণ করুন)
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await engine.saveToAccount();
                    if (res.ok) await engine.saveToDevice();
                    setNotice(res.message);
                  }}
                  className="inline-flex min-h-[40px] items-center rounded-full border border-white/15 bg-white/5 px-3.5 text-[11px] font-bold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
                >
                  Save to Account
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await engine.saveToDevice();
                    setNotice("Saved encrypted on this device only (ainafit_profile).");
                  }}
                  className="inline-flex min-h-[40px] items-center rounded-full border border-white/15 bg-white/5 px-3.5 text-[11px] font-bold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
                >
                  Save on This Device
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Notice first: local erasure is instant; the account
                    // DELETE continues in the background (PDPA feedback
                    // must never wait on the network).
                    void engine.eraseEverywhere();
                    setNotice("সকল মাপ মুছে ফেলা হয়েছে — all measurement data erased from device and account.");
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/10 px-3.5 text-[11px] font-bold text-red-300 transition hover:bg-red-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  <span className="font-bengali">সকল মাপ মুছে ফেলুন</span> (Erase Data)
                </button>
              </div>
              {notice && (
                <p aria-live="polite" className="mt-2.5 text-[11px] font-semibold leading-relaxed text-emerald-300">{notice}</p>
              )}
              {engine.restoredFromDevice && (
                <p className="mt-2 text-[10px] text-neutral-500">Saved profile restored from this device · BDT-based telemetry only, no body data in analytics.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UniversalFitModal;
