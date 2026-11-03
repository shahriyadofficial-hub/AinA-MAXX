"use client";

// components/fashion/HotspotMarker.tsx
// AinA Drip — accessible shoppable hotspot marker.
// 44×44px touch target, keyboard-focusable, reduced-motion safe pulse.

import React from "react";
import { Plus } from "lucide-react";
import { clampHotspotPercent, type Hotspot } from "@/lib/fashion/lookbook";

interface HotspotMarkerProps {
  hotspot: Hotspot;
  active: boolean;
  dimmed: boolean;
  onActivate: (hotspot: Hotspot) => void;
}

export function HotspotMarker({ hotspot, active, dimmed, onActivate }: HotspotMarkerProps) {
  return (
    <button
      type="button"
      data-testid={`hotspot-${hotspot.id}`}
      aria-label={`Shop the look: ${hotspot.label}`}
      aria-pressed={active}
      onClick={() => onActivate(hotspot)}
      onMouseEnter={() => onActivate(hotspot)}
      onFocus={() => onActivate(hotspot)}
      className={`group absolute z-20 flex min-h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-opacity duration-200 ${
        dimmed ? "opacity-40" : "opacity-100"
      }`}
      style={{
        left: `${clampHotspotPercent(hotspot.xPercent)}%`,
        top: `${clampHotspotPercent(hotspot.yPercent)}%`,
      }}
    >
      {/* Pulse ring (disabled under prefers-reduced-motion via globals.css) */}
      <span
        aria-hidden="true"
        className={`hotspot-ping absolute h-8 w-8 rounded-full border ${
          active ? "border-white bg-aina-rose/50" : "border-aina-rose/70 bg-aina-rose/25"
        }`}
      />
      <span
        aria-hidden="true"
        className={`relative flex h-8 w-8 items-center justify-center rounded-full border shadow-lg transition-all duration-200 group-hover:scale-110 group-active:scale-95 ${
          active
            ? "scale-110 border-white bg-aina-rose text-white shadow-glow-rose"
            : "border-white/70 bg-black/70 text-white backdrop-blur-md"
        }`}
      >
        <Plus className={`h-4 w-4 transition-transform duration-200 ${active ? "rotate-45" : ""}`} />
      </span>
      {/* Label chip — visible on active / hover / focus, never hover-only for touch */}
      <span
        className={`pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md transition-all duration-200 ${
          active ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        }`}
      >
        {hotspot.label}
      </span>
    </button>
  );
}

export default HotspotMarker;
