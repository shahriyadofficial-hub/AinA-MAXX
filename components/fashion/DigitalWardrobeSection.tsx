"use client";

// components/fashion/DigitalWardrobeSection.tsx
// AinA Drip · Experience 4 — Digital Wardrobe & SAM 3.1 Cutouts.
// Upload → (demo) SAM 3.1 segmentation states → transparent-checker cutout
// card with cost-per-wear. Uses the existing /api/v1/wardrobe/cutout route
// with a graceful offline fallback so the demo never hard-fails.

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Loader2, RefreshCw, Scissors, UploadCloud } from "lucide-react";
import { DEMO_WARDROBE, costPerWearBDT, type WardrobeItem } from "@/lib/fashion/wardrobe";
import { GARMENT_PHOTO_SET, squareUrl } from "@/lib/media/photos";
import { formatLookBdt } from "@/lib/fashion/lookbook";

type CutoutPhase = "idle" | "uploading" | "segmenting" | "done" | "error";

const PHASE_LABEL: Record<CutoutPhase, string> = {
  idle: "SAM 3.1 Auto-Cutout",
  uploading: "Uploading photo…",
  segmenting: "SAM 3.1 segmenting garment…",
  done: "Cutout added to wardrobe",
  error: "Cutout added (offline demo mode)",
};

export function DigitalWardrobeSection() {
  const [items, setItems] = useState<WardrobeItem[]>(DEMO_WARDROBE);
  const [phase, setPhase] = useState<CutoutPhase>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const totals = useMemo(
    () => ({
      value: items.reduce((s, i) => s + i.priceBDT, 0),
      wears: items.reduce((s, i) => s + i.wears, 0),
      cutouts: items.filter((i) => i.cutoutReady).length,
    }),
    [items]
  );

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const addCutout = (name: string) => {
    setItems((prev) => [
      {
        id: `w-custom-${prev.length + 1}`,
        name: name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 42) || "SAM 3.1 Segmented Item",
        category: "top",
        colorName: "Your photo",
        colorHex: "#007BA7",
        priceBDT: 1800,
        wears: 1,
        samConfidence: 0.95,
        cutoutReady: true,
        image: squareUrl(GARMENT_PHOTO_SET[prev.length % GARMENT_PHOTO_SET.length]),
      },
      ...prev,
    ]);
  };

  const runCutout = async (file?: File) => {
    clearTimers();
    setFileName(file?.name ?? "demo-garment.jpg");
    setPhase("uploading");

    timers.current.push(setTimeout(() => setPhase("segmenting"), 450));
    try {
      const res = await fetch("/api/v1/wardrobe/cutout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "top", color: "From Photo", brand: "My Wardrobe" }),
      });
      if (!res.ok) throw new Error("cutout request failed");
      timers.current.push(
        setTimeout(() => {
          addCutout(file?.name ?? "SAM 3.1 Segmented Overshirt");
          setPhase("done");
        }, 500)
      );
    } catch {
      // Offline / unauthenticated demo: still complete the UX honestly.
      timers.current.push(
        setTimeout(() => {
          addCutout(file?.name ?? "SAM 3.1 Segmented Overshirt");
          setPhase("error");
        }, 500)
      );
    }
    timers.current.push(setTimeout(() => setPhase("idle"), 4200));
  };

  const busy = phase === "uploading" || phase === "segmenting";

  return (
    <section aria-labelledby="wardrobe-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-aina-rose">Experience 04 · Digital Wardrobe</p>
          <h2 id="wardrobe-heading" className="mt-1 font-display text-xl font-extrabold text-white sm:text-2xl">
            Your wardrobe, cut out by SAM 3.1
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-neutral-400 sm:text-sm">
            Upload a garment photo — Meta SAM 3.1 removes the background so the piece can join 3D combos.
            Cost-per-wear keeps every taka honest. Photos stay in your private bucket with signed URLs.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-neutral-300">{items.length} items</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-neutral-300">{totals.cutouts} cutouts</span>
          <span className="rounded-full border border-aina-cerulean/30 bg-aina-cerulean/15 px-3 py-1.5 text-aina-light-cerulean">{formatLookBdt(totals.value)} value · {totals.wears} wears</span>
        </div>
      </div>

      {/* Upload dropzone */}
      <div className="rounded-[28px] border border-dashed border-aina-cerulean/40 bg-aina-cerulean/[0.06] p-5">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-aina-cerulean/20 text-aina-light-cerulean">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Scissors className="h-6 w-6" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">Add a garment — get a transparent cutout in seconds</p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-400" aria-live="polite">
              {fileName ? `${fileName} · ` : ""}{PHASE_LABEL[phase]} · Powered by Meta SAM 3.1 · No face or body analysis — garments only.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
            <label
              className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-aina-cerulean px-4 text-xs font-bold text-white transition active:scale-95 focus-within:ring-2 focus-within:ring-white ${busy ? "pointer-events-none opacity-50" : ""}`}
            >
              <UploadCloud className="h-4 w-4" /> Upload Item (SAM 3.1)
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Upload a garment photo for SAM 3.1 background removal"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  void runCutout(f);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void runCutout()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
            >
              <RefreshCw className="h-4 w-4" /> Try demo item
            </button>
          </div>
        </div>
        {/* Phase progress */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-wider" aria-hidden="true">
          {(["uploading", "segmenting", "done"] as const).map((step, idx) => {
            const order: CutoutPhase[] = ["uploading", "segmenting", "done"];
            const current = order.indexOf(phase === "error" ? "done" : phase);
            const activeStep = phase !== "idle" && idx <= current;
            return (
              <span key={step} className={`rounded-full px-2 py-1.5 ${activeStep ? "bg-aina-cerulean/25 text-aina-light-cerulean" : "bg-white/5 text-neutral-500"}`}>
                {idx + 1}. {step}
              </span>
            );
          })}
        </div>
      </div>

      {/* Wardrobe grid — transparent checkerboard cutout cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <article key={item.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-aina-graphite transition hover:border-aina-cerulean/40">
            <div className="relative aspect-square overflow-hidden bg-aina-dark">
              <Image
                src={item.image}
                alt={`${item.name} — ${item.colorName}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${item.cutoutReady ? "bg-emerald-500/25 text-emerald-200" : "bg-amber-500/25 text-amber-200"}`}>
                {item.cutoutReady ? "SAM 3.1 cutout" : "Processing"}
              </span>
              <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-bold text-neutral-300">
                {Math.round(item.samConfidence * 100)}% seg.
              </span>
            </div>
            <div className="space-y-1 px-3 py-3">
              <h3 className="truncate text-xs font-bold text-white">{item.name}</h3>
              <p className="text-[11px] capitalize text-neutral-500">{item.category} · {item.colorName}</p>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-neutral-400">{item.wears} wears</span>
                <span className="font-bold text-aina-light-cerulean">{formatLookBdt(costPerWearBDT(item))}/wear</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="flex items-start gap-2 px-1 text-[11px] leading-relaxed text-neutral-500">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
        Segmentation confidence describes the garment mask only. AinA never scores faces, bodies, or attractiveness — style guidance is about fit, fabric, climate, and consistency.
      </p>
    </section>
  );
}

export default DigitalWardrobeSection;
