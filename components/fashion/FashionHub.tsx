"use client";

// components/fashion/FashionHub.tsx
// AinA Drip — Multi-Experience Fashion Hub.
// Scroll journey: 01 3D Hero → 02 Shoppable Lookbook → 03 RAIL Hanger
// Carousel → 04 Capsule Matching → 05 Digital Wardrobe.
// Sticky in-page nav with scroll-spy (IntersectionObserver).

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Layers, Rows3, Shirt, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";
import { ShoppableLookbookSection } from "./ShoppableLookbookSection";
import { CapsuleGapSection } from "./CapsuleGapSection";
import { DigitalWardrobeSection } from "./DigitalWardrobeSection";
import { RoutineBagProvider, useRoutineBag } from "@/lib/fashion/routine-bag";
import { formatRailBdt } from "@/lib/fashion/rail";

// Experience 1 reuses the proven R3F studio (WebGL + Lite fallback built in).
const Interactive3DLookbook = dynamic(
  () => import("./Interactive3DLookbook").then((m) => m.Interactive3DLookbook),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-[28px] border border-white/10 bg-aina-graphite/60" role="status">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-aina-rose border-t-transparent" aria-hidden="true" />
        <p className="text-xs text-neutral-400">Loading 3D Fashion Studio…</p>
      </div>
    ),
  }
);

// Experience 3 — RAIL shares the deferred R3F chunk with Experience 1.
const RailHangerCarousel = dynamic(
  () => import("./RailHangerCarousel").then((m) => m.RailHangerCarousel),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-[28px] border border-white/10 bg-aina-graphite/60" role="status">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-aina-cerulean border-t-transparent" aria-hidden="true" />
        <p className="text-xs text-neutral-400">Hanging the rail…</p>
      </div>
    ),
  }
);

const EXPERIENCES = [
  { id: "exp-3d", num: "01", label: "3D Studio", icon: Box },
  { id: "exp-shop", num: "02", label: "Try the Look", icon: ShoppingBag },
  { id: "exp-rail", num: "03", label: "The Rail", icon: Rows3 },
  { id: "exp-capsule", num: "04", label: "Capsule Match", icon: Layers },
  { id: "exp-wardrobe", num: "05", label: "My Wardrobe", icon: Shirt },
] as const;

function SectionShell({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-36">
      <div className="mb-4 flex items-center gap-3 px-1" aria-hidden="true">
        <span className="font-display text-sm font-black text-aina-rose">{num}</span>
        <span className="h-px flex-1 bg-gradient-to-r from-aina-rose/50 via-white/10 to-transparent" />
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">{title}</span>
      </div>
      {children}
    </div>
  );
}

/** Floating Routine Bag button (hub-scoped store, fed by RAIL Quick View). */
function RoutineBagButton() {
  const { count, openBag } = useRoutineBag();
  return (
    <button
      type="button"
      onClick={openBag}
      aria-label={`Open routine bag, ${count} item${count === 1 ? "" : "s"}`}
      className="fixed bottom-24 right-4 z-[60] flex min-h-[52px] items-center gap-2 rounded-full bg-aina-rose px-4 font-display text-sm font-black text-white shadow-glow-rose transition hover:brightness-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:bottom-8 md:right-8"
    >
      <ShoppingBag className="h-5 w-5" />
      <span className="hidden sm:inline">Routine Bag</span>
      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-black/30 px-1.5 text-xs" data-testid="routine-bag-count">
        {count}
      </span>
    </button>
  );
}

/** Slide-out Routine Bag drawer for fashion items. */
function RoutineBagDrawer() {
  const { items, totalBDT, isBagOpen, closeBag, removeItem } = useRoutineBag();
  if (!isBagOpen) return null;
  return (
    <div className="fixed inset-0 z-[75]" role="dialog" aria-modal="true" aria-label="Routine Bag">
      <button type="button" aria-label="Close routine bag" onClick={closeBag} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <aside className="absolute bottom-0 right-0 flex max-h-[85vh] w-full flex-col rounded-t-[28px] border border-white/10 bg-aina-graphite shadow-2xl sm:top-0 sm:max-h-none sm:w-[380px] sm:rounded-none sm:rounded-l-[28px]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-black text-white">Routine Bag</h2>
          <button
            type="button"
            onClick={closeBag}
            aria-label="Close routine bag"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm leading-relaxed text-neutral-400">
              Your bag is empty. Slide the RAIL, tap a hanger twice, and add your size.
              <span className="mt-1 block font-bengali text-neutral-500">ব্যাগ খালি — রেল থেকে পছন্দ করুন।</span>
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-aina-black/50 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{item.title}</p>
                    <p className="text-[11px] text-neutral-500">
                      {item.brand} · Size {item.size} · Qty {item.qty}
                    </p>
                    <p className="mt-0.5 text-sm font-black text-aina-rose">{formatRailBdt(item.priceBDT * item.qty)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.size)}
                    aria-label={`Remove ${item.title} size ${item.size} from bag`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-neutral-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-white/10 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-neutral-400">Total (BDT)</span>
              <span className="font-display text-xl font-black text-white">{formatRailBdt(totalBDT)}</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">Cash on delivery available in Dhaka · No attractiveness scoring, ever.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function FashionHubInner() {
  const [active, setActive] = useState<string>("exp-3d");

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    EXPERIENCES.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hub header */}
      <header className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-aina-graphite via-aina-dark to-aina-black px-6 py-8 shadow-2xl sm:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-aina-rose/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-aina-cerulean/20 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-aina-rose/30 bg-aina-rose/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-aina-rose">
            <Sparkles className="h-3.5 w-3.5" /> AinA Drip · Multi-Experience Fashion Hub
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-black leading-tight text-white sm:text-4xl">
            Five ways to wear it. <span className="text-aina-rose">One wardrobe.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
            Spin the 3D studio look, tap hotspots to shop the exact combo, slide the 3D hanger rail, match outfits
            for Eid, campus and monsoon — then cut out your own clothes with SAM 3.1. <span className="font-bengali text-neutral-300">ঢাকার আবহাওয়ার জন্য সাজানো ফ্যাশন।</span>
          </p>
          <dl className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-white/5 px-3 py-1.5 text-neutral-300">Meta SAM 3.1 cutouts</span>
            <span className="rounded-full bg-white/5 px-3 py-1.5 text-neutral-300">muse-image combos</span>
            <span className="rounded-full bg-white/5 px-3 py-1.5 text-neutral-300">BDT-verified sellers</span>
            <span className="rounded-full bg-aina-rose/15 px-3 py-1.5 text-aina-rose">Zero attractiveness scoring</span>
          </dl>
        </div>
      </header>

      {/* Sticky experience nav (scroll-spy) */}
      <nav aria-label="Fashion experiences" className="sticky top-[57px] z-30 -mx-1 overflow-x-auto bg-aina-black/85 px-1 py-2 backdrop-blur-xl md:top-[61px]">
        <div className="flex min-w-max items-center gap-1.5">
          {EXPERIENCES.map(({ id, num, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                aria-current={isActive ? "true" : undefined}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-xs font-bold transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                  isActive ? "bg-white text-black shadow-lg" : "border border-white/10 bg-white/5 text-neutral-300 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-aina-rose" : ""}`} />
                <span className={isActive ? "text-aina-rose" : "text-neutral-500"}>{num}</span> {label}
              </a>
            );
          })}
        </div>
      </nav>

      <SectionShell id="exp-3d" num="01" title="Interactive 3D Lookbook">
        <Interactive3DLookbook />
      </SectionShell>

      <SectionShell id="exp-shop" num="02" title="Shoppable Lookbook · Try the Look">
        <ShoppableLookbookSection />
      </SectionShell>

      <SectionShell id="exp-rail" num="03" title="RAIL · 3D Virtual Hanger Carousel">
        <RailHangerCarousel />
      </SectionShell>

      <SectionShell id="exp-capsule" num="04" title="Capsule Gap & Wardrobe Matching">
        <CapsuleGapSection />
      </SectionShell>

      <SectionShell id="exp-wardrobe" num="05" title="Digital Wardrobe & SAM 3.1 Cutouts">
        <DigitalWardrobeSection />
      </SectionShell>

      <RoutineBagButton />
      <RoutineBagDrawer />
    </div>
  );
}

/** Public hub: inner layout wrapped in the hub-scoped Routine Bag store. */
export function FashionHub() {
  return (
    <RoutineBagProvider>
      <FashionHubInner />
    </RoutineBagProvider>
  );
}

export default FashionHub;
