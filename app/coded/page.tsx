"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  Scissors,
  Upload,
  Lock,
  AlertTriangle,
  Droplets,
  CircleGauge,
  Shapes,
  AudioLines,
  ClipboardList,
} from "lucide-react";
import { SkinScanner, useScanProgress, type ScanState } from "@/components/coded/SkinScanner";
import { BarberCard } from "@/components/coded/BarberCard";
import type { SkinGuidance, BarberCard as BarberCardData } from "@/lib/ai/types";

type Locale = "en" | "bn";

interface VisionResponse {
  data: { guidance: SkinGuidance; photoAssetId: string | null; purpose: string };
  meta: { model: string; provider: string; cached: boolean; latencyMs: number; safety: string };
}

interface BarberResponse {
  data: { card: BarberCardData & { imageModel: string }; referenceVisual: string };
  meta: { model: string; imageModel: string; provider: string; cached: boolean; latencyMs: number };
}

export default function CodedPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const bn = locale === "bn";

  const [consentGranted, setConsentGranted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [guidance, setGuidance] = useState<SkinGuidance | null>(null);
  const [visionMeta, setVisionMeta] = useState<VisionResponse["meta"] | null>(null);
  const [error, setError] = useState<string>("");

  const [barberCard, setBarberCard] = useState<(BarberCardData & { imageModel: string }) | null>(null);
  const [barberBusy, setBarberBusy] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const progress = useScanProgress(scanState === "scanning");
  const scanning = scanState === "scanning";

  const confidencePct = useMemo(
    () => (guidance ? Math.round(guidance.confidence * 100) : 0),
    [guidance]
  );

  function onPickFile(file: File | null) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError(bn ? "শুধু JPG, PNG বা WebP ছবি দিন।" : "Please choose a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(bn ? "ছবি ১০MB এর কম হতে হবে।" : "Photo must be under 10 MB.");
      return;
    }
    setError("");
    setFileName(file.name);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    setScanState("ready");
    setGuidance(null);
    setBarberCard(null);
  }

  async function runVision() {
    setError("");
    setScanState("scanning");
    try {
      // 1) Private upload intent (adult + consent enforced server-side).
      if (consentGranted) {
        await fetch("/api/v1/photos/upload-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ purpose: "skin_guidance", mimeType: "image/jpeg", byteSize: 1024 }),
        }).catch(() => undefined);
      }

      // 2) Cautious vision guidance (muse-spark-1.3) with safe fallback.
      const res = await fetch("/api/v1/ai/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "skin_guidance", locale }),
      });
      const json = (await res.json()) as VisionResponse & { error?: { message?: string } };
      if (!res.ok || !json.data) {
        throw new Error(json.error?.message || "Vision guidance failed");
      }
      // Let the Cerulean sweep finish before revealing results.
      await new Promise((r) => setTimeout(r, 900));
      setGuidance(json.data.guidance);
      setVisionMeta(json.meta);
      setScanState("done");
    } catch (err) {
      setScanState(previewUrl ? "ready" : "idle");
      setError(err instanceof Error ? err.message : "Vision guidance failed");
    }
  }

  async function runBarberCard() {
    setBarberBusy(true);
    setError("");
    try {
      const res = await fetch("/api/v1/ai/barber-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, guidance: guidance ?? undefined }),
      });
      const json = (await res.json()) as BarberResponse & { error?: { message?: string } };
      if (!res.ok || !json.data) {
        throw new Error(json.error?.message || "Barber card generation failed");
      }
      setBarberCard(json.data.card);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Barber card generation failed");
    } finally {
      setBarberBusy(false);
    }
  }

  const resultRows = guidance
    ? [
        {
          icon: Droplets,
          label: bn ? "ত্বকের ধরন" : "Skin type",
          value: guidance.skinType,
        },
        {
          icon: Shapes,
          label: bn ? "মুখের আকৃতি" : "Face shape",
          value: guidance.faceShape ?? "—",
        },
        {
          icon: AudioLines,
          label: bn ? "চুলের গঠন" : "Hair texture",
          value: guidance.hairTexture ?? "—",
        },
        {
          icon: CircleGauge,
          label: bn ? "আর্দ্রতা" : "Hydration",
          value: guidance.hydrationLevel,
        },
      ]
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-aina-light-cerulean">
            AinA Coded · muse-spark-1.3
          </p>
          <h1 className="mt-1 font-display text-xl font-bold text-white">
            {bn ? "স্কিন ও হেয়ার ভিশন" : "Skin & Hair Vision"}
          </h1>
          <p className="mt-0.5 text-xs text-neutral-400">
            {bn
              ? "ঐচ্ছিক, প্রাইভেট ও সতর্ক নির্দেশনা — কোনো আকর্ষণীয়তা স্কোর নয়"
              : "Optional, private, cautious guidance — zero attractiveness scores"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLocale(bn ? "en" : "bn")}
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white active:scale-95"
          aria-label="Switch language"
        >
          {bn ? "English" : "বাংলা"}
        </button>
      </div>

      {/* Consent gate */}
      <section className="rounded-aina-sm border border-aina-cerulean/30 bg-aina-cerulean/10 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consentGranted}
            onChange={(e) => setConsentGranted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#FF2D95]"
          />
          <span className="text-xs leading-relaxed text-neutral-200">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Lock className="h-3.5 w-3.5 text-aina-light-cerulean" />
              {bn ? "প্রাইভেট ছবি প্রসেসিং সম্মতি (১৮+)" : "Private photo processing consent (18+)"}
            </span>
            {bn
              ? "আমি নিশ্চিত করছি আমার বয়স ১৮+। ছবি শুধু স্কিন ব্যারিয়ার ও হেয়ার নির্দেশনার জন্য প্রাইভেট বাকেটে থাকবে, ৩০ দিনে মুছে যাবে, কখনো পাবলিক বা স্কোর করা হবে না। যেকোনো সময় সম্মতি প্রত্যাহার করা যাবে।"
              : "I confirm I am 18+. My photo stays in a private bucket for skin-barrier and hair guidance only, is deleted within 30 days, and is never public or scored. I can withdraw consent anytime."}
          </span>
        </label>
        <p className="mt-2 pl-7 text-xs text-neutral-400">
          {bn ? "সম্মতি পরিচালনা করুন: " : "Manage consent anytime: "}
          <Link href="/onboarding" className="font-semibold text-aina-light-cerulean underline">
            {bn ? "কনসেন্ট রেজিস্ট্রি" : "Consent registry"}
          </Link>
        </p>
      </section>

      {/* Scanner */}
      <SkinScanner state={scanState} previewUrl={previewUrl} progress={progress} />

      {/* Upload + analyze actions */}
      <div className="grid grid-cols-2 gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          disabled={!consentGranted || scanning}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-aina-graphite px-4 py-2.5 text-xs font-semibold text-white transition enabled:hover:border-aina-cerulean/60 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
        >
          <Upload className="h-4 w-4 text-aina-light-cerulean" />
          {fileName ? (bn ? "ছবি বদলান" : "Change photo") : bn ? "প্রাইভেট ছবি দিন" : "Add private photo"}
        </button>
        <button
          type="button"
          disabled={!consentGranted || scanning}
          onClick={runVision}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-aina-cerulean px-4 py-2.5 text-xs font-bold text-white shadow-glow-cerulean transition disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          {scanning
            ? bn
              ? "স্ক্যান হচ্ছে…"
              : "Scanning…"
            : bn
              ? "ভিশন নির্দেশনা নিন"
              : "Run vision guidance"}
        </button>
      </div>

      {!consentGranted && (
        <p className="flex items-center gap-1.5 text-xs text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {bn
            ? "ছবি দিতে আগে উপরের সম্মতি চালু করুন। সম্মতি ছাড়া কোনো ছবি প্রসেস হয় না।"
            : "Turn on the consent above first. No photo is processed without it."}
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-950/50 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      )}

      {/* Guidance results */}
      {guidance && (
        <section className="space-y-3 rounded-aina border border-white/10 bg-aina-graphite p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-white">
              <ClipboardList className="h-4 w-4 text-aina-light-cerulean" />
              {bn ? "সতর্ক নির্দেশনা" : "Cautious guidance"}
            </h2>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
              {bn ? "আস্থা" : "Confidence"} {confidencePct}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {resultRows.map((row) => (
              <div key={row.label} className="rounded-xl bg-black/30 px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                  <row.icon className="h-3.5 w-3.5 text-aina-light-cerulean" />
                  {row.label}
                </p>
                <p className="mt-0.5 text-sm font-bold capitalize text-white">{row.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-neutral-400">
              {bn ? "প্রধান বিষয়সমূহ" : "Primary concerns"}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {guidance.primaryConcerns.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-200"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs leading-relaxed text-neutral-300">{guidance.recommendedFocus}</p>

          <p className="flex items-start gap-1.5 border-t border-white/5 pt-3 text-xs leading-relaxed text-neutral-400">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aina-cerulean" />
            {guidance.safetyNote}
            {visionMeta ? ` · ${visionMeta.model} · ${visionMeta.safety}` : ""}
          </p>

          <button
            type="button"
            disabled={barberBusy}
            onClick={runBarberCard}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-aina-rose px-4 py-2.5 text-xs font-bold text-white shadow-glow-rose transition disabled:opacity-50 active:scale-95"
          >
            <Scissors className="h-4 w-4" />
            {barberBusy
              ? bn
                ? "কার্ড তৈরি হচ্ছে…"
                : "Generating card…"
              : bn
                ? "বারবার রেফারেন্স কার্ড তৈরি করুন (muse-image)"
                : "Generate Barber Reference Card (muse-image)"}
          </button>
        </section>
      )}

      {barberCard && (
        <BarberCard card={barberCard} locale={locale} referenceVisual="/coded/barber-reference.svg" />
      )}
    </div>
  );
}
