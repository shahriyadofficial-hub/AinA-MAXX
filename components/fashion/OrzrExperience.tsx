"use client";

// components/fashion/OrzrExperience.tsx
// ORZR by Tsuru Kawagoe — Interactive Layered 2D Fashion Rack & Accessory Archive.
//
// Monochrome brutalist luxury (#000 / #FFF / #1A1A1A / #333), Swiss type
// (Inter), zero commerce: no prices, no cart — tactile discovery only.
// Depth is CSS 3D (perspective 1200px, preserve-3d) over layered 2D
// cutouts: Layer 0 projected shadow (blur 20px, reacts to drag),
// Layer 1 base silhouette/drape, Layer 2 hardware/detail highlight.
// No Three.js / WebGL — instant load. prefers-reduced-motion disables
// rotation in favour of clean cross-fades.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDrag } from "@use-gesture/react";
import { ArrowLeft, ArrowRight, Volume2, VolumeX, X } from "lucide-react";
import {
  clampOrzrIndex,
  orzrAnnouncement,
  orzrCounter,
  orzrItemsByCategory,
  rackTransform,
  rackTransformCss,
  snapOrzrIndex,
  wheelStep,
  type OrzrCategory,
  type OrzrItem,
} from "@/lib/fashion/orzr";

const CATEGORIES: OrzrCategory[] = ["CLOTHING", "ACCESSORY"];

/** Layered item artwork: Layer 0 shadow, Layer 1 silhouette, Layer 2 detail. */
function OrzrLayers({
  item,
  dragOffset,
  lifted,
  large = false,
}: {
  item: OrzrItem;
  dragOffset: number;
  lifted: boolean;
  large?: boolean;
}) {
  const shadowShift = Math.max(-26, Math.min(26, dragOffset * 18));
  return (
    <div className={`orzr-preserve-3d relative ${large ? "h-[46vh] max-h-[430px]" : "h-56 sm:h-64"}`} aria-hidden="true">
      {/* Layer 0 — projected ambient shadow, elongates on lift/drag */}
      <div
        className="orzr-shadow-layer absolute inset-x-8 bottom-1 h-10 rounded-[100%] bg-black"
        style={{
          transform: `translateX(${shadowShift}px) scaleX(${lifted ? 1.35 : 1})`,
          opacity: lifted ? 0.85 : 0.6,
        }}
      />
      {/* Layer 1 — base silhouette / drape */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.silhouette}
        alt=""
        draggable={false}
        className="absolute inset-0 mx-auto h-full w-auto max-w-none select-none"
        style={{ transform: `translateZ(30px) translateX(${shadowShift * 0.25}px)` }}
      />
      {/* Layer 2 — hardware / texture highlight sweep */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          transform: "translateZ(55px)",
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.14) 48%, transparent 62%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

/** Detail overlay (Flow 3): blurred backdrop, left focal frame, right type panel. */
function OrzrDetailOverlay({ item, onClose }: { item: OrzrItem; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end bg-black/85 backdrop-blur-md sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Archive entry: ${item.name}`}
      onClick={onClose}
    >
      <div
        className="grid max-h-[92vh] w-full max-w-4xl grid-cols-1 gap-0 overflow-y-auto border border-[#333] bg-black sm:mx-4 md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left focal frame — real photographic plate + layered silhouette */}
        <div className="relative flex items-center justify-center overflow-hidden border-b border-[#1A1A1A] bg-[#050505] px-8 py-10 md:border-b-0 md:border-r">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.photo}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/55" aria-hidden="true" />
          <span className="orzr-meta absolute left-5 top-5 z-10 text-neutral-300">{item.number}</span>
          <span className="orzr-meta absolute bottom-5 left-5 z-10 text-neutral-400">{item.material}</span>
          <div className="relative z-10">
            <OrzrLayers item={item} dragOffset={0} lifted large />
          </div>
        </div>

        {/* Right typographic breakdown */}
        <div className="relative flex flex-col px-7 py-8 sm:px-9">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close archive entry"
            className="absolute right-5 top-5 inline-flex min-h-[44px] items-center gap-2 border border-[#333] px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-white transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Close / Esc <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <p className="orzr-meta text-neutral-400">Type: {item.category}</p>
          <h2 className="mt-4 font-display text-3xl font-black uppercase leading-[1.02] tracking-tight text-white sm:text-4xl">
            {item.name}
          </h2>
          <p className="orzr-meta mt-4 text-neutral-500">
            Archive {item.number} · {item.material.replace("MATERIAL: ", "")}
          </p>

          <p className="mt-6 text-sm leading-relaxed text-neutral-300">{item.description}</p>

          <h3 className="orzr-meta mt-8 text-neutral-500">Construction</h3>
          <ul className="mt-3 space-y-2.5">
            {item.details.map((detail) => (
              <li key={detail} className="flex items-baseline gap-3 text-sm text-neutral-200">
                <span className="inline-block h-1.5 w-1.5 shrink-0 translate-y-[-2px] bg-white" aria-hidden="true" />
                {detail}
              </li>
            ))}
          </ul>

          <p className="orzr-meta mt-auto pt-10 text-neutral-600">
            ORZR Archive · Non-transactional · No checkout, by design
          </p>
        </div>
      </div>
    </div>
  );
}

/** Accessory display case (Flow 2): graphite pedestals + pointer light shift. */
function AccessoryShowcase({
  items,
  onOpen,
}: {
  items: OrzrItem[];
  onOpen: (item: OrzrItem) => void;
}) {
  const [light, setLight] = useState({ x: 50, y: 40 });

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setLight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      className="relative px-5 py-10 sm:px-8"
      onPointerMove={handleMove}
      style={{
        background: `radial-gradient(420px circle at ${light.x}% ${light.y}%, rgba(255,255,255,0.07), transparent 65%)`,
      }}
    >
      <p className="orzr-meta text-center text-neutral-500">Display Case · Velvet / Graphite</p>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item)}
            aria-label={`View archive entry: ${item.name}`}
            className="orzr-pedestal group border border-[#1A1A1A] px-5 pb-6 pt-5 text-left transition duration-300 hover:border-[#333] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span className="orzr-meta flex items-center justify-between text-neutral-500">
              <span>{item.number}</span>
              <span className="transition group-hover:text-white">View Entry →</span>
            </span>
            <div className="transition duration-500 group-hover:-translate-y-1.5">
              <OrzrLayers item={item} dragOffset={0} lifted={false} />
            </div>
            <span className="mt-2 block font-display text-base font-black uppercase tracking-wide text-white">
              {item.name}
            </span>
            <span className="orzr-meta mt-2 block text-neutral-500">{item.material}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function OrzrExperience() {
  const [category, setCategory] = useState<OrzrCategory>("CLOTHING");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lifted, setLifted] = useState(false);
  const [selected, setSelected] = useState<OrzrItem | null>(null);
  const [muted, setMuted] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const wheelLock = useRef(0);
  const dragState = useRef({ offset: 0, velocity: 0 });

  const items = useMemo(() => orzrItemsByCategory(category), [category]);
  const active = items[activeIndex] ?? items[0];

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setLifted(false);
      setActiveIndex(clampOrzrIndex(index, items.length));
    },
    [items.length]
  );

  const switchCategory = useCallback((next: OrzrCategory) => {
    setCategory(next);
    setActiveIndex(0);
    setLifted(false);
    setSelected(null);
  }, []);

  // Flow 1 — drag/swipe with momentum + snap (touch + mouse via pointer).
  const bindDrag = useDrag(
    ({ active: dragging, movement: [mx], velocity: [vx], direction: [dx], last, tap }) => {
      if (category !== "CLOTHING") return;
      if (tap) return; // taps are handled by click (lift / open)
      const state = dragState.current;
      state.offset = activeIndex - mx / 190;
      state.velocity = -vx * dx;
      setDragOffset(-mx / 190);
      if (last) {
        goTo(snapOrzrIndex(state.offset, state.velocity, items.length));
        setDragOffset(0);
      } else if (dragging) {
        setLifted(false);
      }
    },
    { axis: "x", filterTaps: true, pointer: { touch: true } }
  );

  // Vertical wheel → horizontal rack transitions (desktop).
  const handleWheel = (e: React.WheelEvent) => {
    if (category !== "CLOTHING" || selected) return;
    const now = Date.now();
    if (now - wheelLock.current < 420) return;
    const step = wheelStep(e.deltaY);
    if (step !== 0) {
      wheelLock.current = now;
      goTo(activeIndex + step);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selected) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(activeIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(activeIndex - 1);
    } else if (e.key === "Enter" && category === "CLOTHING") {
      e.preventDefault();
      if (lifted) setSelected(active);
      else setLifted(true);
    }
  };

  return (
    <div className="bg-black font-[Inter,system-ui,sans-serif] text-white">
      {/* Fixed minimalist header */}
      <header className="sticky top-0 z-40 border-b border-[#1A1A1A] bg-black/95 backdrop-blur-sm">
        <div className="flex min-h-[60px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-2 sm:px-8">
          <p className="font-display text-xl font-black uppercase tracking-[0.34em]" aria-label="ORZR home">
            ORZR
          </p>

          {/* Segment switcher */}
          <div className="flex border border-[#333]" role="tablist" aria-label="Archive category">
            {CATEGORIES.map((c) => {
              const isActive = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => switchCategory(c)}
                  className={`min-h-[44px] px-4 text-[11px] font-bold uppercase tracking-[0.22em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white sm:px-6 ${
                    isActive ? "bg-white text-black" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  [ {c} ]
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="orzr-meta text-neutral-400" aria-hidden="true">
              {orzrCounter(activeIndex, items.length)}
            </span>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-pressed={!muted}
              aria-label={muted ? "Unmute archive ambience" : "Mute archive ambience"}
              className="flex h-11 w-11 items-center justify-center border border-[#333] text-neutral-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Intro strip */}
      <div className="border-b border-[#1A1A1A] px-5 py-8 sm:px-8">
        <p className="orzr-meta text-neutral-500">Tsuru Kawagoe · Layered 2D Archive · Est. Tokyo</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-black uppercase leading-[0.98] tracking-tight sm:text-6xl">
          The rack is<br />the gallery.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-400">
          Drag the rail. Lift a piece off the hanger. Read its construction. Nothing here is for sale —
          the archive exists to be touched, not transacted.
        </p>
      </div>

      {category === "CLOTHING" ? (
        <>
          {/* Flow 1 — Clothing rack */}
          <section
            {...bindDrag()}
            role="region"
            aria-roledescription="carousel"
            aria-label="Clothing rack. Use left and right arrow keys to browse the rail."
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onWheel={handleWheel}
            className="orzr-stage relative touch-pan-y select-none overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
          >
            {/* The rail bar */}
            <div className="pointer-events-none absolute inset-x-0 top-16 h-px bg-[#333]" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 top-16 h-10 bg-gradient-to-b from-white/[0.05] to-transparent" aria-hidden="true" />

            <div className="orzr-preserve-3d relative flex h-[430px] items-center justify-center sm:h-[480px]">
              {items.map((item, i) => {
                const distance = i - activeIndex + dragOffset;
                const t = rackTransform(distance);
                const isActive = i === activeIndex;
                return (
                  <div
                    key={item.id}
                    className="orzr-flip absolute w-52 sm:w-60"
                    style={{
                      transform: `${rackTransformCss(distance, reducedMotion)} translateX(${distance * 215}px)`,
                      opacity: reducedMotion ? (isActive ? 1 : 0) : t.opacity,
                      zIndex: t.zIndex,
                      pointerEvents: Math.abs(distance) < 1.6 ? "auto" : "none",
                      visibility: reducedMotion && !isActive ? "hidden" : "visible",
                    }}
                  >
                    {/* hanger hook */}
                    <svg viewBox="0 0 100 30" className="mx-auto h-7 w-24 text-neutral-500" aria-hidden="true">
                      <path d="M50 3 a5 5 0 1 1 5 5 M50 13 L10 27 M50 13 L90 27" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                    <button
                      type="button"
                      tabIndex={isActive ? 0 : -1}
                      aria-hidden={!isActive}
                      aria-label={
                        isActive
                          ? lifted
                            ? `Open archive entry: ${item.name}`
                            : `Lift ${item.name} off the rack`
                          : item.name
                      }
                      onClick={() => {
                        if (!isActive) goTo(i);
                        else if (!lifted) setLifted(true);
                        else setSelected(item);
                      }}
                      onMouseEnter={() => isActive && setLifted(true)}
                      onMouseLeave={() => isActive && setLifted(false)}
                      className="orzr-lift block w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      style={{
                        transform: isActive && lifted && !reducedMotion ? "translateY(-24px) scale(1.04)" : "none",
                      }}
                    >
                      <OrzrLayers item={item} dragOffset={dragOffset} lifted={isActive && lifted} />
                      <span className="mt-3 block text-center">
                        <span className="block font-display text-sm font-black uppercase tracking-wide">{item.name}</span>
                        <span className="orzr-meta mt-1.5 block text-neutral-500">
                          {item.number} · {item.material.replace("MATERIAL: ", "")}
                        </span>
                      </span>
                      {isActive && (
                        <span
                          className={`orzr-meta mx-auto mt-4 block w-fit border px-3 py-2 transition ${
                            lifted ? "border-white bg-white text-black" : "border-[#333] text-neutral-300"
                          }`}
                        >
                          View Archive Entry →
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Rack controls */}
            <div className="relative flex items-center justify-between border-t border-[#1A1A1A] px-5 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                disabled={activeIndex === 0}
                aria-label="Previous item on the rack"
                className="flex h-11 w-11 items-center justify-center border border-[#333] text-white transition hover:bg-white hover:text-black disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <p className="orzr-meta hidden text-neutral-500 sm:block">Drag · Scroll · ← → Keys</p>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                disabled={activeIndex === items.length - 1}
                aria-label="Next item on the rack"
                className="flex h-11 w-11 items-center justify-center border border-[#333] text-white transition hover:bg-white hover:text-black disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Active item editorial block */}
          <section className="border-t border-[#1A1A1A] px-5 py-8 sm:px-8" aria-label="Active item details">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-xl">
                <p className="orzr-meta text-neutral-500">
                  Type: Clothing · {active.material}
                </p>
                <h2 className="mt-3 font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">{active.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">{active.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(active)}
                className="inline-flex min-h-[48px] items-center border border-white px-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                View Archive Entry
              </button>
            </div>
          </section>
        </>
      ) : (
        /* Flow 2 — Accessory display case */
        <AccessoryShowcase items={items} onOpen={setSelected} />
      )}

      {/* Archive index — semantic static list (also the no-JS fallback content) */}
      <section className="border-t border-[#1A1A1A] px-5 py-8 sm:px-8" aria-label="Full archive index">
        <h2 className="orzr-meta text-neutral-500">Archive Index · {category}</h2>
        <ul className="mt-5 divide-y divide-[#1A1A1A] border-y border-[#1A1A1A]">
          {items.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  if (category === "CLOTHING") goTo(i);
                  setSelected(item);
                }}
                aria-current={category === "CLOTHING" && i === activeIndex ? "true" : undefined}
                className="flex min-h-[56px] w-full items-center gap-4 px-2 py-3 text-left transition hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
              >
                <span className="orzr-meta w-16 shrink-0 text-neutral-500">{item.number}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.photo} alt="" className="h-12 w-12 shrink-0 border border-[#1A1A1A] object-cover" />
                <span className="min-w-0">
                  <span className="block truncate font-display text-sm font-black uppercase tracking-wide">{item.name}</span>
                  <span className="orzr-meta mt-0.5 block text-neutral-500">{item.material}</span>
                </span>
                <span className="orzr-meta ml-auto shrink-0 text-neutral-400">Entry →</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="orzr-meta mt-6 text-neutral-600">
          ORZR © Tsuru Kawagoe · Layered 2D · No WebGL · Zero attractiveness scoring
        </p>
      </section>

      {/* Screen-reader announcement (spec format) */}
      <div aria-live="polite" role="status" className="sr-only">
        {orzrAnnouncement(active, activeIndex, items.length)}
      </div>

      {selected && <OrzrDetailOverlay item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default OrzrExperience;
