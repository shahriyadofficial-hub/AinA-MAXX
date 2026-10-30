"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Layers,
  Scissors,
  Eye,
} from "lucide-react";

export interface OutfitLook {
  id: string;
  titleEn: string;
  titleBn: string;
  ghostText: string;
  tags: string[];
  accentColor: string;
  occasion: string;
  items: {
    slot: "top" | "bottom" | "footwear";
    name: string;
    details: string;
    color: string;
    cutoutSvg?: string;
  }[];
}

const LOOKS: OutfitLook[] = [
  {
    id: "look-01",
    titleEn: "Old Dhaka Heritage Streetwear",
    titleBn: "পুরান ঢাকা স্ট্রিটওয়্যার",
    ghostText: "WEAR IT LOUD",
    tags: ["• Relaxed Fit", "• Everyday", "• 100% Breathable Cotton"],
    accentColor: "#FF2D95", // Neon Rose
    occasion: "Street Casual",
    items: [
      {
        slot: "top",
        name: "Obsidian Black Minimal Kurta",
        details: "Relaxed drop-shoulder cut calibrated for Dhaka breeze",
        color: "#18181B",
      },
      {
        slot: "bottom",
        name: "Slim Pleat Olive Chinos",
        details: "Structured Japanese twill with hidden flex waist",
        color: "#3F4E3A",
      },
      {
        slot: "footwear",
        name: "Bone White Minimal Lows",
        details: "Pebbled full-grain leather with cushioned crepe sole",
        color: "#E4E4E7",
      },
    ],
  },
  {
    id: "look-02",
    titleEn: "Monsoon Techwear Rain Shield",
    titleBn: "বর্ষা টেকওয়্যার শিল্ড",
    ghostText: "PRIME YOU",
    tags: ["• Water-Repellent", "• Dhaka Monsoon", "• High Mobility"],
    accentColor: "#007BA7", // Cerulean
    occasion: "Weather Defense",
    items: [
      {
        slot: "top",
        name: "Matte Charcoal Utility Bomber",
        details: "DWR-coated nylon with taped weather zippers",
        color: "#27272A",
      },
      {
        slot: "bottom",
        name: "Water-Resistant Cargo Joggers",
        details: "Quick-dry ripstop fabric with reinforced knees",
        color: "#1E293B",
      },
      {
        slot: "footwear",
        name: "Waterproof Chelsea Combat Boots",
        details: "Vulcanized rubber tread resistant to city puddles",
        color: "#0F172A",
      },
    ],
  },
  {
    id: "look-03",
    titleEn: "Gulshan Smart Casual Friday",
    titleBn: "গুলশান স্মার্ট ক্যাজুয়াল",
    ghostText: "STAY SHARP",
    tags: ["• Camp Collar Linen", "• Business Casual", "• Summer Cool"],
    accentColor: "#3FB6E0", // Light Cerulean
    occasion: "Office & Evening",
    items: [
      {
        slot: "top",
        name: "Sage Camp-Collar Linen Shirt",
        details: "Pure French flax linen; naturally temperature-regulating",
        color: "#84A98C",
      },
      {
        slot: "bottom",
        name: "Off-White Relaxed Pleat Slacks",
        details: "Flowy tropical wool blend with side tab adjusters",
        color: "#F1F5F9",
      },
      {
        slot: "footwear",
        name: "Woven Calfskin Penny Loafers",
        details: "Breathable hand-woven leather upper in rich cognac",
        color: "#78350F",
      },
    ],
  },
  {
    id: "look-04",
    titleEn: "Minimalist Jet Black Monochrome",
    titleBn: "জেট ব্ল্যাক মনোক্রোম",
    ghostText: "REFLECT PRIME",
    tags: ["• Heavyweight 240 GSM", "• Evening Drip", "• Sharp Silhouette"],
    accentColor: "#FF2D95",
    occasion: "Night Out",
    items: [
      {
        slot: "top",
        name: "Boxy Heavyweight Prime Tee",
        details: "240 GSM organic combed cotton with structured mock collar",
        color: "#0A0A0A",
      },
      {
        slot: "bottom",
        name: "Charcoal Tailored Ankle Trousers",
        details: "Clean crease drape with no-break taper",
        color: "#18181B",
      },
      {
        slot: "footwear",
        name: "Chunky Commando Derby Shoes",
        details: "Polished Italian leather with lugged rubber platform",
        color: "#000000",
      },
    ],
  },
];

export function Lookbook3D() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cutoutAdded, setCutoutAdded] = useState(false);
  const [customItem, setCustomItem] = useState<{
    name: string;
    category: string;
    color: string;
  } | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const currentLook = LOOKS[currentIndex];

  // Smooth 60fps pointer tilt tracking (<15KB, zero 3D library dependencies)
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 12deg tilt clamp
    const rotX = -((y - centerY) / centerY) * 12;
    const rotY = ((x - centerX) / centerX) * 14;

    setRotateX(rotX);
    setRotateY(rotY);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  }, []);

  // Gyroscope tilt on mobile if supported
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        // Clamp gamma (-45 to 45) and beta (-45 to 45)
        const rotY = Math.max(-14, Math.min(14, (e.gamma / 45) * 14));
        const rotX = Math.max(-12, Math.min(12, ((e.beta - 45) / 45) * 12));
        setRotateX(rotX);
        setRotateY(rotY);
      }
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
      return () => window.removeEventListener("deviceorientation", handleOrientation);
    }
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? LOOKS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === LOOKS.length - 1 ? 0 : prev + 1));
  };

  // Demo SAM 3.1 Background Removal & Cutout Insertion
  const handleSamCutout = async () => {
    setIsUploading(true);
    try {
      const res = await fetch("/api/v1/wardrobe/cutout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "top",
          color: "Neon Cerulean",
          brand: "AinA Lab Custom",
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setCustomItem({
          name: "SAM 3.1 Segmented Overshirt",
          category: "top",
          color: "#007BA7",
        });
        setCutoutAdded(true);
      }
    } catch (err) {
      console.warn("SAM 3.1 cutout failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-aina-lg bg-aina-black border border-white/10 p-4 sm:p-6 select-none shadow-2xl">
      {/* Background Ambience Glow */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[110px] pointer-events-none opacity-25 transition-all duration-700"
        style={{ backgroundColor: currentLook.accentColor }}
      />

      {/* Giant Ghost Typography in Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span
          className="text-[64px] sm:text-[92px] font-black tracking-tighter text-white/[0.03] uppercase font-display whitespace-nowrap transition-all duration-500 transform scale-110"
        >
          {currentLook.ghostText}
        </span>
      </div>

      {/* Header Controls: Occasion Badge & Counter */}
      <div className="relative z-20 flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
            style={{
              borderColor: `${currentLook.accentColor}50`,
              backgroundColor: `${currentLook.accentColor}15`,
              color: currentLook.accentColor,
            }}
          >
            {currentLook.occasion}
          </span>
          <span className="text-xs text-neutral-400 font-bengali">
            {currentLook.titleBn}
          </span>
        </div>

        {/* Counter: 01 / 04 */}
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-neutral-400">
          <span className="text-white">
            0{currentIndex + 1}
          </span>
          <span className="text-neutral-600">/</span>
          <span>0{LOOKS.length}</span>
        </div>
      </div>

      {/* 3D Parallax Canvas Viewport */}
      <div
        className="relative w-full h-[360px] sm:h-[400px] flex items-center justify-center perspective-1000"
        onPointerEnter={() => setIsHovered(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* The 3D Rotating Stage */}
        <div
          ref={cardRef}
          className="relative w-[280px] sm:w-[320px] h-[340px] sm:h-[370px] rounded-aina preserve-3d transition-transform ease-out"
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transitionDuration: isHovered ? "60ms" : "600ms",
          }}
        >
          {/* Card Backing Glass Plate */}
          <div className="absolute inset-0 rounded-aina bg-gradient-to-b from-aina-graphite/90 to-aina-dark/95 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col justify-between p-5 overflow-hidden">
            {/* Top Bar with Floating Pill Tags */}
            <div
              className="flex flex-wrap gap-1.5 transform transition-transform"
              style={{ transform: "translateZ(30px)" }}
            >
              {currentLook.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-tight bg-white/5 border border-white/10 text-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Middle: 3D Garment Layers (Foreground Parallax Layer) */}
            <div
              className="my-auto space-y-2.5 transform transition-transform"
              style={{ transform: "translateZ(55px)" }}
            >
              {/* Optional Segmented SAM 3.1 Cutout Item */}
              {cutoutAdded && customItem && (
                <div className="p-2.5 rounded-xl bg-aina-cerulean/20 border border-aina-light-cerulean/60 flex items-center justify-between animate-pulse">
                  <div className="flex items-center space-x-2">
                    <Scissors className="w-3.5 h-3.5 text-aina-light-cerulean" />
                    <div>
                      <p className="text-[11px] font-bold text-white">
                        {customItem.name}
                      </p>
                      <p className="text-[9px] text-neutral-400">
                        SAM 3.1 Segmented Alpha Layer
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold text-aina-light-cerulean bg-aina-cerulean/30 px-1.5 py-0.5 rounded">
                    NEW CUTOUT
                  </span>
                </div>
              )}

              {/* Standard Outfit Slots */}
              {currentLook.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-aina-black/60 border border-white/5 flex items-center justify-between group hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-neutral-200">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-neutral-500 line-clamp-1">
                        {item.details}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-neutral-400 px-1.5 py-0.5 rounded bg-white/5">
                    {item.slot}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Title & Prime Tag */}
            <div
              className="space-y-1 transform transition-transform"
              style={{ transform: "translateZ(40px)" }}
            >
              <h3 className="text-sm font-extrabold text-white font-display tracking-tight">
                {currentLook.titleEn}
              </h3>
              <p className="text-[11px] text-neutral-400">
                Calibrated for Dhaka temperature and lifestyle comfort
              </p>
            </div>
          </div>

          {/* Floor Reflection Effect */}
          <div
            className="absolute -bottom-16 left-6 right-6 h-12 rounded-full blur-xl pointer-events-none opacity-40 transition-all duration-500"
            style={{ backgroundColor: currentLook.accentColor }}
          />
        </div>
      </div>

      {/* Bottom Controls: Pagination & SAM 3.1 Cutout Upload */}
      <div className="relative z-20 flex items-center justify-between pt-4 mt-2 border-t border-white/5">
        {/* Next / Prev Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-aina-graphite border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:border-white/30 transition-all active:scale-95"
            aria-label="Previous Outfit"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-aina-graphite border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:border-white/30 transition-all active:scale-95"
            aria-label="Next Outfit"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* SAM 3.1 Cutout Trigger */}
        <button
          onClick={handleSamCutout}
          disabled={isUploading}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-aina-cerulean/20 border border-aina-light-cerulean/50 text-aina-light-cerulean text-xs font-semibold hover:bg-aina-cerulean/30 active:scale-95 transition-all shadow-glow-cerulean/20"
        >
          {isUploading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-aina-light-cerulean border-t-transparent rounded-full animate-spin" />
              <span>SAM 3.1 Segmenting...</span>
            </>
          ) : cutoutAdded ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>SAM 3.1 Cutout Active</span>
            </>
          ) : (
            <>
              <Scissors className="w-3.5 h-3.5" />
              <span>Upload Item (SAM 3.1 Auto-Cutout)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Lookbook3D;
