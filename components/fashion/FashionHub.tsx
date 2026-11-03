"use client";

// components/fashion/FashionHub.tsx
// AinA Drip — Multi-Experience Fashion Hub.
// Scroll journey: 01 3D Hero → 02 Shoppable Lookbook → 03 Capsule Matching
// → 04 Digital Wardrobe. Sticky in-page nav with scroll-spy (IntersectionObserver).

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Layers, Shirt, ShoppingBag, Sparkles } from "lucide-react";
import { ShoppableLookbookSection } from "./ShoppableLookbookSection";
import { CapsuleGapSection } from "./CapsuleGapSection";
import { DigitalWardrobeSection } from "./DigitalWardrobeSection";

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

const EXPERIENCES = [
  { id: "exp-3d", num: "01", label: "3D Studio", icon: Box },
  { id: "exp-shop", num: "02", label: "Try the Look", icon: ShoppingBag },
  { id: "exp-capsule", num: "03", label: "Capsule Match", icon: Layers },
  { id: "exp-wardrobe", num: "04", label: "My Wardrobe", icon: Shirt },
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

export function FashionHub() {
  const [active, setActive] = useState<string>("exp-3d");

  useEffect(() => {
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
            Four ways to wear it. <span className="text-aina-rose">One wardrobe.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
            Spin the 3D studio look, tap hotspots to shop the exact combo, match outfits for Eid, campus and monsoon —
            then cut out your own clothes with SAM 3.1. <span className="font-bengali text-neutral-300">ঢাকার আবহাওয়ার জন্য সাজানো ফ্যাশন।</span>
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

      <SectionShell id="exp-capsule" num="03" title="Capsule Gap & Wardrobe Matching">
        <CapsuleGapSection />
      </SectionShell>

      <SectionShell id="exp-wardrobe" num="04" title="Digital Wardrobe & SAM 3.1 Cutouts">
        <DigitalWardrobeSection />
      </SectionShell>
    </div>
  );
}

export default FashionHub;
