import React from "react";
import { ShoppingBag, Star, ExternalLink } from "lucide-react";

export default function ShopPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-white">Curated Shop</h1>
          <p className="text-xs text-neutral-400">Bangladeshi & Global products with BDT pricing</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-xs font-semibold">
          BDT Verified
        </div>
      </div>

      <div className="glass-panel rounded-aina p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-aina-light-cerulean bg-aina-cerulean/20 px-2 py-0.5 rounded-full">
            Top Recommendation
          </span>
          <span className="text-sm font-bold text-white font-display">৳850 BDT</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-sm font-bold text-white">Simple Refreshing Facial Wash (150ml)</h2>
          <p className="text-xs text-neutral-400">100% soap-free, enriched with pro-vitamin B5 and vitamin E.</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[10px] text-neutral-500">Curated by AinA Skincare Team</span>
          <button className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors">
            <span>Add to Bag</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
