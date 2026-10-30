import React from "react";
import Lookbook3D from "@/components/lookbook/Lookbook3D";
import { Shirt, Sparkles, Plus, Layers, Palette, ShieldCheck } from "lucide-react";

export default function WardrobePage() {
  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-white">AinA Drip & Lookbook</h1>
          <p className="text-xs text-neutral-400">
            Interactive 3D Capsule Wardrobe powered by Meta SAM 3.1
          </p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-aina-cerulean/15 text-aina-light-cerulean border border-aina-cerulean/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SAM 3.1 AI</span>
        </div>
      </div>

      {/* 3D Lookbook Hero Centerpiece */}
      <section>
        <Lookbook3D />
      </section>

      {/* Capsule Wardrobe Breakdown */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-display">
            Active Capsule Collection (Dhaka Edition)
          </h2>
          <span className="text-[11px] text-neutral-500">6 Items · 10+ Pairings</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel glass-panel-hover rounded-aina-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-aina-light-cerulean bg-aina-cerulean/20 px-2 py-0.5 rounded-full">
                TOP LAYER
              </span>
              <span className="text-[10px] text-neutral-500">SAM 3.1 Cutout</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Obsidian Black Kurta</p>
              <p className="text-[10px] text-neutral-400">100% Breathable Cotton · Drop Shoulder</p>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-aina-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-aina-rose bg-aina-rose/20 px-2 py-0.5 rounded-full">
                BOTTOM LAYER
              </span>
              <span className="text-[10px] text-neutral-500">Structured</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Slim Pleat Chinos</p>
              <p className="text-[10px] text-neutral-400">Japanese Twill · Flex Waistline</p>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-aina-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                WEATHER LAYER
              </span>
              <span className="text-[10px] text-neutral-500">Monsoon</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Utility Rain Bomber</p>
              <p className="text-[10px] text-neutral-400">DWR Matte Nylon · Taped Seams</p>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-aina-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                FOOTWEAR
              </span>
              <span className="text-[10px] text-neutral-500">Versatile</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Chelsea Combat Lows</p>
              <p className="text-[10px] text-neutral-400">Waterproof Rubberized Sole</p>
            </div>
          </div>
        </div>
      </section>

      {/* Style Guide & Climate Matrix */}
      <section className="rounded-2xl p-4 bg-aina-graphite/40 border border-white/5 space-y-2">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-aina-rose" />
          <h3 className="text-xs font-bold text-white font-display">
            Color Harmonies & Climate Pairing Rule
          </h3>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          In high humidity, contrast structured lightweight bottoms with relaxed airy tops. AinA Drip pairs neutral obsidian bases with vibrant earth tones for effortless day-to-night transitions.
        </p>
      </section>
    </div>
  );
}
