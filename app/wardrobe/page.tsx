import React from "react";
import { Shirt, Sparkles, Plus } from "lucide-react";

export default function WardrobePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-white">AinA Drip</h1>
          <p className="text-xs text-neutral-400">Digital Capsule Wardrobe & 3D Lookbook</p>
        </div>
        <button className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-aina-cerulean text-white text-xs font-semibold hover:bg-aina-cerulean/90 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Item</span>
        </button>
      </div>

      <div className="glass-panel rounded-aina p-5 space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-aina-cerulean/15 text-aina-light-cerulean mx-auto flex items-center justify-center">
          <Shirt className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-white font-display">Interactive 3D Lookbook Hero</h2>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Powered by Segment Anything Model 3.1 (SAM 3.1) for instant background removal and clothing segmentation.
          </p>
        </div>
      </div>
    </div>
  );
}
