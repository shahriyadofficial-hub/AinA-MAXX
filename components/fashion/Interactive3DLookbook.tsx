"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Shirt,
  ShoppingBag,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Scissors,
  CheckCircle2,
  Watch,
  Maximize2,
  Sliders,
} from "lucide-react";
import Image from "next/image";
import { MODEL_PHOTOS, portraitUrl } from "@/lib/media/photos";
import type { FloatingTag } from "./GarmentScene3D";

// Dynamically import GarmentScene3D with ssr: false for zero SSR issues and performance
const GarmentScene3D = dynamic(
  () => import("./GarmentScene3D").then((mod) => mod.GarmentScene3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] sm:h-[540px] lg:h-[620px] rounded-3xl bg-aina-graphite/40 border border-white/5 flex flex-col items-center justify-center space-y-3 animate-pulse">
        <div className="w-12 h-12 rounded-full border-2 border-aina-rose border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-neutral-400">
          Loading 3D Fashion Studio...
        </p>
      </div>
    ),
  }
);

export interface OutfitLook {
  id: string;
  titleEn: string;
  titleBn: string;
  ghostText: string;
  accentColor: string;
  garmentColor: string;
  image: string;
  imageAlt: string;
  priceBdt: number;
  occasion: string;
  tags: FloatingTag[];
  combos: {
    top: { name: string; details: string; tag: string };
    bottom: { name: string; details: string; tag: string };
    footwear: { name: string; details: string; tag: string };
    accessory: { name: string; details: string; tag: string };
    haircut: { name: string; details: string; tag: string };
  };
}

export const CURATED_LOOKS: OutfitLook[] = [
  {
    id: "look-01",
    titleEn: "Old Dhaka Heritage Streetwear",
    titleBn: "পুরান ঢাকা স্ট্রিটওয়্যার",
    ghostText: "WEAR IT LOUD",
    accentColor: "#FF2D95", // Neon Rose
    garmentColor: "#18181B",
    image: portraitUrl(MODEL_PHOTOS.streetEditorial, 720),
    imageAlt: MODEL_PHOTOS.streetEditorial.alt,
    priceBdt: 2450,
    occasion: "Street Casual",
    tags: [
      {
        id: "tag-linen",
        label: "• Relaxed Linen",
        position: [0.75, 0.4, 0.35],
        focusTarget: [0.3, 0.4, 0.6],
        accentColor: "#FF2D95",
      },
      {
        id: "tag-monsoon",
        label: "• Monsoon Breathable",
        position: [-0.85, -0.15, 0.3],
        focusTarget: [-0.2, -0.1, 0.6],
        accentColor: "#3FB6E0",
      },
      {
        id: "tag-price",
        label: "• BDT 2,450",
        position: [0.05, -0.85, 0.4],
        focusTarget: [0.0, -0.5, 0.6],
        accentColor: "#FF2D95",
      },
    ],
    combos: {
      top: {
        name: "Obsidian Black Minimal Kurta",
        details: "Relaxed drop-shoulder cut calibrated for Dhaka breeze",
        tag: "100% Breathable Cotton",
      },
      bottom: {
        name: "Slim Pleat Olive Chinos",
        details: "Structured Japanese twill with hidden flex waist",
        tag: "Japanese Twill",
      },
      footwear: {
        name: "Bone White Minimal Lows",
        details: "Pebbled full-grain leather with cushioned crepe sole",
        tag: "Crepe Rubber Sole",
      },
      accessory: {
        name: "Bauhaus Matte Chrono",
        details: "Sapphire glass with breathable mesh band",
        tag: "Water Resistant",
      },
      haircut: {
        name: "Textured Mid Fade",
        details: "Tapered sides with natural messy top volume",
        tag: "Bangla Barber Guide #1",
      },
    },
  },
  {
    id: "look-02",
    titleEn: "Monsoon Techwear Rain Shield",
    titleBn: "বর্ষা টেকওয়্যার শিল্ড",
    ghostText: "PRIME YOU",
    accentColor: "#007BA7", // Cerulean
    garmentColor: "#27272A",
    image: portraitUrl(MODEL_PHOTOS.monoNight, 720),
    imageAlt: MODEL_PHOTOS.monoNight.alt,
    priceBdt: 3850,
    occasion: "Weather Defense",
    tags: [
      {
        id: "tag-dwr",
        label: "• DWR Rain Shield",
        position: [0.75, 0.4, 0.35],
        focusTarget: [0.3, 0.4, 0.6],
        accentColor: "#007BA7",
      },
      {
        id: "tag-monsoon-2",
        label: "• Monsoon Breathable",
        position: [-0.85, -0.15, 0.3],
        focusTarget: [-0.2, -0.1, 0.6],
        accentColor: "#3FB6E0",
      },
      {
        id: "tag-price-2",
        label: "• BDT 3,850",
        position: [0.05, -0.85, 0.4],
        focusTarget: [0.0, -0.5, 0.6],
        accentColor: "#007BA7",
      },
    ],
    combos: {
      top: {
        name: "Matte Charcoal Utility Bomber",
        details: "DWR-coated matte nylon with taped waterproof zippers",
        tag: "DWR Nylon",
      },
      bottom: {
        name: "Water-Resistant Cargo Joggers",
        details: "Quick-dry ripstop fabric with articulated knee seams",
        tag: "Ripstop Flex",
      },
      footwear: {
        name: "Chelsea Combat Low Boots",
        details: "Vulcanized tread impervious to monsoon puddles",
        tag: "Vulcanized Grip",
      },
      accessory: {
        name: "Stealth Tactical G-Shock",
        details: "Shock-resistant with 200m water protection",
        tag: "200M Rating",
      },
      haircut: {
        name: "Low Taper with Matte Clay",
        details: "Resists humidity frizz and high dew points",
        tag: "Bangla Barber Guide #2",
      },
    },
  },
  {
    id: "look-03",
    titleEn: "Gulshan Smart Casual Friday",
    titleBn: "গুলশান স্মার্ট ক্যাজুয়াল",
    ghostText: "STAY SHARP",
    accentColor: "#3FB6E0", // Light Cerulean
    garmentColor: "#E2DDD5",
    image: portraitUrl(MODEL_PHOTOS.smartCasual, 720),
    imageAlt: MODEL_PHOTOS.smartCasual.alt,
    priceBdt: 3200,
    occasion: "Office & Evening",
    tags: [
      {
        id: "tag-linen-3",
        label: "• Relaxed Linen",
        position: [0.75, 0.4, 0.35],
        focusTarget: [0.3, 0.4, 0.6],
        accentColor: "#3FB6E0",
      },
      {
        id: "tag-summer",
        label: "• Summer Cool",
        position: [-0.85, -0.15, 0.3],
        focusTarget: [-0.2, -0.1, 0.6],
        accentColor: "#FF2D95",
      },
      {
        id: "tag-price-3",
        label: "• BDT 3,200",
        position: [0.05, -0.85, 0.4],
        focusTarget: [0.0, -0.5, 0.6],
        accentColor: "#3FB6E0",
      },
    ],
    combos: {
      top: {
        name: "Camp Collar Relaxed Linen",
        details: "Pure unbleached flax blend with airy boxy cut",
        tag: "100% Irish Linen",
      },
      bottom: {
        name: "Tobacco Pleated Trousers",
        details: "Single pleat tailored trousers with side adjusters",
        tag: "Crease-Resistant",
      },
      footwear: {
        name: "Penny Loafers in Cognac",
        details: "Hand-burnished leather with Goodyear welted sole",
        tag: "Hand-Burnished",
      },
      accessory: {
        name: "Vintage Sunray Dial Watch",
        details: "Ultra-thin stainless case with saddle leather strap",
        tag: "Vintage Leather",
      },
      haircut: {
        name: "Clean Side Part Pompadour",
        details: "Sleek barber cut with natural sheen balm",
        tag: "Bangla Barber Guide #3",
      },
    },
  },
  {
    id: "look-04",
    titleEn: "Minimalist Jet Black Monochrome",
    titleBn: "জেট ব্ল্যাক মনোক্রোম",
    ghostText: "REFLECT PRIME",
    accentColor: "#FF2D95", // Neon Rose
    garmentColor: "#0D0D10",
    image: portraitUrl(MODEL_PHOTOS.heroPortrait, 720),
    imageAlt: MODEL_PHOTOS.heroPortrait.alt,
    priceBdt: 2150,
    occasion: "Night Out / Club",
    tags: [
      {
        id: "tag-gsm",
        label: "• Heavyweight 240 GSM",
        position: [0.75, 0.4, 0.35],
        focusTarget: [0.3, 0.4, 0.6],
        accentColor: "#FF2D95",
      },
      {
        id: "tag-monsoon-4",
        label: "• Monsoon Breathable",
        position: [-0.85, -0.15, 0.3],
        focusTarget: [-0.2, -0.1, 0.6],
        accentColor: "#3FB6E0",
      },
      {
        id: "tag-price-4",
        label: "• BDT 2,150",
        position: [0.05, -0.85, 0.4],
        focusTarget: [0.0, -0.5, 0.6],
        accentColor: "#FF2D95",
      },
    ],
    combos: {
      top: {
        name: "Boxy Heavyweight Drop-Tee",
        details: "Dense 240 GSM organic cotton with ribbed mock neck",
        tag: "240 GSM Cotton",
      },
      bottom: {
        name: "Wide Drape Pleat Slacks",
        details: "Fluid matte crepe with effortless fluid drape",
        tag: "Wide Drape",
      },
      footwear: {
        name: "Triple Black Chunky Lows",
        details: "Reinforced vulcanized rubber with architectural sole",
        tag: "Architectural Sole",
      },
      accessory: {
        name: "Matte Black Minimal Cuff",
        details: "Brushed surgical titanium with laser AinA logo",
        tag: "Titanium",
      },
      haircut: {
        name: "Messy French Crop",
        details: "Blunt fringe with high skin fade on sides",
        tag: "Bangla Barber Guide #4",
      },
    },
  },
];

export function Interactive3DLookbook() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTag, setActiveTag] = useState<FloatingTag | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [forceLiteMode, setForceLiteMode] = useState(false);
  const [bagSuccessMsg, setBagSuccessMsg] = useState<string | null>(null);
  const [isAddingToBag, setIsAddingToBag] = useState(false);

  // Fallback CSS tilt angles for Lite mode
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);

  const currentLook = CURATED_LOOKS[currentIndex];

  // Detect WebGL and viewport size
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl2") ||
          canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl");
        return !!gl;
      } catch {
        return false;
      }
    };

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const webglSupported = checkWebGL() && !mediaQuery.matches;
    setHasWebGL(webglSupported);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => {
    setActiveTag(null);
    setCurrentIndex((prev) => (prev === 0 ? CURATED_LOOKS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveTag(null);
    setCurrentIndex((prev) => (prev === CURATED_LOOKS.length - 1 ? 0 : prev + 1));
  };

  // Fly to Routine Bag action
  const handleFlyToRoutineBag = () => {
    setIsAddingToBag(true);
    setTimeout(() => {
      setIsAddingToBag(false);
      setBagSuccessMsg(`Added ${currentLook.titleEn} combo to your Routine Bag!`);
      setTimeout(() => setBagSuccessMsg(null), 3500);
    }, 600);
  };

  // 2.5D CSS tilt calculation for lite fallback
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!forceLiteMode && hasWebGL) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTiltX(Math.max(-12, Math.min(12, (-y / (rect.height / 2)) * 12)));
    setTiltY(Math.max(-14, Math.min(14, (x / (rect.width / 2)) * 14)));
  };

  const handlePointerLeave = () => {
    setTiltX(0);
    setTiltY(0);
  };

  return (
    <div className="w-full space-y-6">
      {/* Lookbook Navigation & Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-white/5 border border-white/10">
            {CURATED_LOOKS.map((look, idx) => (
              <button
                key={look.id}
                type="button"
                onClick={() => {
                  setActiveTag(null);
                  setCurrentIndex(idx);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  currentIndex === idx
                    ? "bg-aina-rose text-white shadow-glow-rose font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Look 0{idx + 1}
              </button>
            ))}
          </div>

          <span className="hidden md:inline-flex text-xs font-bengali text-neutral-400">
            {currentLook.titleBn}
          </span>
        </div>

        {/* Studio Controls (Prev/Next & 3D/Lite Mode Toggle) */}
        <div className="flex items-center space-x-2">
          {/* 3D vs Lite Performance Mode Toggle */}
          <button
            type="button"
            onClick={() => setForceLiteMode((prev) => !prev)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono border transition-all ${
              forceLiteMode || !hasWebGL
                ? "bg-white/10 text-white border-white/20"
                : "bg-aina-cerulean/15 text-aina-light-cerulean border-aina-cerulean/30 shadow-[0_0_10px_rgba(0,123,167,0.3)]"
            }`}
            title="Toggle between Interactive 3D Canvas and 60fps Lite Parallax"
          >
            <Sliders className="w-3 h-3" />
            <span>{forceLiteMode || !hasWebGL ? "Lite 2.5D Mode" : "3D Canvas Active"}</span>
          </button>

          {/* Previous / Next Arrows */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Outfit Look"
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-transform active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Outfit Look"
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-transform active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid: 3D Studio (Left/Center) + Outfit Combo Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Interactive Canvas or Parallax Fallback */}
        <div className="lg:col-span-8 relative rounded-3xl bg-aina-black border border-white/10 overflow-hidden shadow-2xl">
          {/* Top Info Header */}
          <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-md"
              style={{
                borderColor: `${currentLook.accentColor}60`,
                backgroundColor: `${currentLook.accentColor}20`,
                color: currentLook.accentColor,
              }}
            >
              {currentLook.occasion}
            </span>
            <span className="text-xs font-mono font-bold text-white px-2.5 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
              ৳{currentLook.priceBdt.toLocaleString()} BDT
            </span>
          </div>

          {/* 3D Canvas or 2.5D CSS Parallax */}
          {!forceLiteMode && hasWebGL ? (
            <GarmentScene3D
              color={currentLook.garmentColor}
              accentColor={currentLook.accentColor}
              isMobile={isMobile}
              tags={currentLook.tags}
              activeTag={activeTag}
              onSelectTag={(tag) => setActiveTag(tag)}
              onResetView={() => setActiveTag(null)}
            />
          ) : (
            /* Hybrid Fallback: CSS 3D Parallax Tilt container (Low-End Android & Reduced Motion) */
            <div
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="relative w-full h-[460px] sm:h-[540px] lg:h-[620px] rounded-3xl overflow-hidden bg-radial-gradient flex flex-col items-center justify-center p-6 select-none transition-transform duration-100 ease-out"
              style={{
                transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Ghost Typography */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <span className="text-[72px] sm:text-[110px] font-black tracking-tighter text-white/[0.04] uppercase font-display whitespace-nowrap">
                  {currentLook.ghostText}
                </span>
              </div>

              {/* Garment Silhouette Layer */}
              <div
                className="relative z-10 flex flex-col items-center transition-transform duration-200"
                style={{ transform: "translateZ(40px)" }}
              >
                <div
                  className="relative w-48 h-64 sm:w-60 sm:h-80 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
                  style={{
                    boxShadow: `0 25px 60px -15px ${currentLook.accentColor}40`,
                  }}
                >
                  <Image
                    src={currentLook.image}
                    alt={currentLook.imageAlt}
                    fill
                    sizes="(max-width: 640px) 192px, 240px"
                    className="object-cover"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                <div className="mt-4 text-center">
                  <h3 className="text-lg font-bold text-white font-display">
                    {currentLook.titleEn}
                  </h3>
                  <p className="text-xs text-neutral-400 font-bengali">
                    {currentLook.titleBn}
                  </p>
                </div>
              </div>

              {/* Parallax Floating Tags */}
              <div
                className="absolute inset-x-6 bottom-8 z-20 flex flex-wrap items-center justify-center gap-2"
                style={{ transform: "translateZ(60px)" }}
              >
                {currentLook.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 rounded-full text-xs font-mono bg-black/80 text-white border border-white/20 shadow-lg"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Outfit Combo Drawer ("What Goes With What") */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl bg-aina-graphite/70 border border-white/10 p-5 sm:p-6 backdrop-blur-xl space-y-5 shadow-2xl">
            {/* Header: Selected Look Summary */}
            <div className="space-y-1 border-b border-white/10 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-aina-light-cerulean font-mono">
                  LOOK 0{currentIndex + 1} OF 0{CURATED_LOOKS.length}
                </span>
                <span className="text-[10px] text-neutral-400">
                  Meta SAM 3.1 Paired
                </span>
              </div>
              <h2 className="text-lg font-extrabold font-display text-white">
                {currentLook.titleEn}
              </h2>
              <p className="text-xs font-bengali text-neutral-300">
                {currentLook.titleBn}
              </p>
            </div>

            {/* "What Goes With What" Outfit Pairing Slots */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-display flex items-center justify-between">
                <span>What Goes With What</span>
                <span className="text-[10px] text-aina-rose lowercase font-mono">
                  • 5-point match
                </span>
              </h3>

              {/* 👔 Top Layer */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-aina-light-cerulean uppercase">
                    Top Layer
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {currentLook.combos.top.tag}
                  </span>
                </div>
                <p className="text-xs font-bold text-white mt-1">
                  {currentLook.combos.top.name}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {currentLook.combos.top.details}
                </p>
              </div>

              {/* 👖 Bottom Layer */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-aina-rose uppercase">
                    Bottom Layer
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {currentLook.combos.bottom.tag}
                  </span>
                </div>
                <p className="text-xs font-bold text-white mt-1">
                  {currentLook.combos.bottom.name}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {currentLook.combos.bottom.details}
                </p>
              </div>

              {/* 👟 Footwear */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    Footwear
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {currentLook.combos.footwear.tag}
                  </span>
                </div>
                <p className="text-xs font-bold text-white mt-1">
                  {currentLook.combos.footwear.name}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {currentLook.combos.footwear.details}
                </p>
              </div>

              {/* ⌚ Accessory */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">
                    Accessory
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {currentLook.combos.accessory.tag}
                  </span>
                </div>
                <p className="text-xs font-bold text-white mt-1">
                  {currentLook.combos.accessory.name}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {currentLook.combos.accessory.details}
                </p>
              </div>

              {/* ✂️ Haircut & Barber Reference */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-purple-300 uppercase">
                    Haircut Match
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono">
                    {currentLook.combos.haircut.tag}
                  </span>
                </div>
                <p className="text-xs font-bold text-white mt-1">
                  {currentLook.combos.haircut.name}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {currentLook.combos.haircut.details}
                </p>
              </div>
            </div>

            {/* "Fly to Routine Bag" Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFlyToRoutineBag}
                disabled={isAddingToBag}
                className="w-full py-3.5 px-4 rounded-full bg-aina-rose hover:bg-aina-rose/90 text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-glow-rose transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4 fill-black text-black" />
                <span>
                  {isAddingToBag
                    ? "Flying to Bag..."
                    : `Fly to Routine Bag · ৳${currentLook.priceBdt.toLocaleString()} BDT`}
                </span>
              </button>
            </div>

            {/* Toast Feedback */}
            {bagSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{bagSuccessMsg}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Interactive3DLookbook;
