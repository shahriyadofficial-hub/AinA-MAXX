"use client";

// components/roadmap/ConflictChecker.tsx
import React, { useState } from "react";
import { FlaskConical, ShieldCheck, AlertTriangle, CloudSun, Loader2 } from "lucide-react";
import type { IngredientConflict } from "@/lib/ai/types";

type Locale = "en" | "bn";

interface ConflictResponse {
  data: { conflict: IngredientConflict; productA: string; productB: string };
  meta: { model: string; provider: string; cached: boolean; latencyMs: number };
}

const PRESET_PAIRS: Array<{ labelEn: string; labelBn: string; a: string; b: string }> = [
  {
    labelEn: "Retinol + Acid (care needed)",
    labelBn: "রেটিনল + অ্যাসিড (সতর্কতা)",
    a: "The Ordinary Retinol 0.5% in Squalane",
    b: "Minimalist Salicylic Acid 2% Serum",
  },
  {
    labelEn: "Vitamin C + SPF (safe pair)",
    labelBn: "ভিটামিন সি + SPF (নিরাপদ জুটি)",
    a: "Simple Vitamin C Serum 10%",
    b: "Missha Aqua Sun Gel SPF 50+",
  },
  {
    labelEn: "Niacinamide + Hyaluronic Acid",
    labelBn: "নিয়াসিনামাইড + হায়ালুরোনিক অ্যাসিড",
    a: "The Ordinary Niacinamide 10% + Zinc 1%",
    b: "Cosrx Hyaluronic Acid Hydra Power Essence",
  },
];

const SEVERITY_STYLES: Record<IngredientConflict["severity"], string> = {
  none: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  high: "border-red-500/40 bg-red-500/10 text-red-300",
};

export function ConflictChecker({ locale = "en" }: { locale?: Locale }) {
  const bn = locale === "bn";
  const [productA, setProductA] = useState(PRESET_PAIRS[0].a);
  const [productB, setProductB] = useState(PRESET_PAIRS[0].b);
  const [result, setResult] = useState<ConflictResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function runCheck() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/v1/ai/conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productA, productB }),
      });
      const json = (await res.json()) as ConflictResponse & { error?: { message?: string } };
      if (!res.ok || !json.data) {
        throw new Error(json.error?.message || "Conflict check failed");
      }
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conflict check failed");
    } finally {
      setBusy(false);
    }
  }

  const conflict = result?.data.conflict;

  return (
    <section className="space-y-3 rounded-aina border border-aina-cerulean/30 bg-aina-graphite p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-white">
          <FlaskConical className="h-4 w-4 text-aina-light-cerulean" />
          {bn ? "উপাদান দ্বন্দ্ব যাচাই" : "Ingredient Conflict Checker"}
        </h2>
        <span className="rounded-full border border-aina-cerulean/40 bg-aina-cerulean/15 px-2.5 py-1 text-xs font-semibold text-aina-light-cerulean">
          muse-wonder
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESET_PAIRS.map((pair) => (
          <button
            key={pair.labelEn}
            type="button"
            onClick={() => {
              setProductA(pair.a);
              setProductB(pair.b);
              setResult(null);
            }}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-200 transition hover:border-aina-cerulean/60 active:scale-95"
          >
            {bn ? pair.labelBn : pair.labelEn}
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        <label className="block">
          <span className="text-xs font-semibold text-neutral-400">{bn ? "পণ্য ক" : "Product A"}</span>
          <input
            value={productA}
            onChange={(e) => setProductA(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-aina-cerulean"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-neutral-400">{bn ? "পণ্য খ" : "Product B"}</span>
          <input
            value={productB}
            onChange={(e) => setProductB(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-aina-cerulean"
          />
        </label>
      </div>

      <button
        type="button"
        disabled={busy || productA.trim().length < 2 || productB.trim().length < 2}
        onClick={runCheck}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-aina-cerulean px-4 py-2.5 text-xs font-bold text-white shadow-glow-cerulean transition disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
        {busy
          ? bn
            ? "muse-wonder যাচাই করছে…"
            : "Checking with muse-wonder…"
          : bn
            ? "muse-wonder দিয়ে যাচাই করুন"
            : "Check with muse-wonder"}
      </button>

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-950/50 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      )}

      {conflict && (
        <div className="space-y-2 border-t border-white/5 pt-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${SEVERITY_STYLES[conflict.severity]}`}
          >
            {conflict.isConflict ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            {conflict.isConflict
              ? bn
                ? `সতর্কতা · তীব্রতা: ${conflict.severity}`
                : `Use with care · Severity: ${conflict.severity}`
              : bn
                ? "একসাথে নিরাপদ"
                : "Safe together"}
          </span>

          {conflict.conflictingIngredients.length > 0 && (
            <p className="text-xs text-neutral-300">
              {bn ? "সংশ্লিষ্ট উপাদান: " : "Ingredients involved: "}
              {conflict.conflictingIngredients.join(" + ")}
            </p>
          )}

          <p className="text-xs leading-relaxed text-neutral-200">
            {bn ? conflict.explanationBn : conflict.explanationEn}
          </p>

          <p className="flex items-start gap-1.5 text-xs leading-relaxed text-aina-light-cerulean">
            <CloudSun className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {conflict.climateAdvice}
          </p>

          {result && (
            <p className="text-xs text-neutral-500">
              {result.meta.model} · {result.meta.provider} · {result.meta.latencyMs}ms
              {result.meta.cached ? " · cached" : ""}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
