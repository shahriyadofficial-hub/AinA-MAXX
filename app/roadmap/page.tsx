import React from "react";
import { Compass, Calendar, CheckCircle2 } from "lucide-react";

export default function RoadmapPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-white">30-Day Roadmap</h1>
          <p className="text-xs text-neutral-400">Your personalized transformation schedule</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-aina-rose/15 text-aina-rose border border-aina-rose/30 text-xs font-semibold">
          Day 1 / 30
        </div>
      </div>

      <div className="glass-panel rounded-aina p-5 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-aina-rose/15 flex items-center justify-center text-aina-rose">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Skin Barrier & Hair Hydration</h2>
            <p className="text-xs text-neutral-400">AM & PM daily rituals calibrated for Dhaka humidity</p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="p-3 rounded-xl bg-aina-dark/80 border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full border border-neutral-600 flex items-center justify-center" />
              <div>
                <p className="text-xs font-semibold text-neutral-200">AM Gentle Foaming Cleanser</p>
                <p className="text-[10px] text-neutral-500">2 mins · Skin barrier repair</p>
              </div>
            </div>
            <span className="text-[10px] text-aina-light-cerulean font-medium">+15 XP</span>
          </div>

          <div className="p-3 rounded-xl bg-aina-dark/80 border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full border border-neutral-600 flex items-center justify-center" />
              <div>
                <p className="text-xs font-semibold text-neutral-200">SPF 50+ Broad Spectrum Sunscreen</p>
                <p className="text-[10px] text-neutral-500">3 mins · UVA/UVB defense</p>
              </div>
            </div>
            <span className="text-[10px] text-aina-light-cerulean font-medium">+20 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
