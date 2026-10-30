import React from "react";
import { Flame, MessageCircle, Heart, Share2 } from "lucide-react";

export default function VibePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-white">AinA Vibe</h1>
          <p className="text-xs text-neutral-400">Consistency community & daily check-ins</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold">
          Effort Feed
        </div>
      </div>

      <div className="glass-panel rounded-aina p-5 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-aina-rose to-aina-cerulean flex items-center justify-center font-bold text-xs text-white">
            TF
          </div>
          <div>
            <p className="text-xs font-bold text-white">Tahmid F.</p>
            <p className="text-[10px] text-neutral-400">Mirpur, Dhaka · 7-Day Mirror Streak</p>
          </div>
        </div>

        <p className="text-xs text-neutral-200 leading-relaxed">
          Completed Day 7 PM hydration. Using local Bangladeshi aloe gel + Ceramide moisturizer has stopped all dryness from the fan air at night!
        </p>

        <div className="flex items-center space-x-4 pt-2 border-t border-white/5 text-neutral-400 text-xs">
          <button className="flex items-center space-x-1.5 hover:text-aina-rose transition-colors">
            <Heart className="w-3.5 h-3.5" />
            <span>24</span>
          </button>
          <button className="flex items-center space-x-1.5 hover:text-aina-light-cerulean transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>5</span>
          </button>
        </div>
      </div>
    </div>
  );
}
