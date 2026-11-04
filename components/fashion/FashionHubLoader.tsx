"use client";

// components/fashion/FashionHubLoader.tsx
// Client-only loader for the AinA Drip Fashion Hub.
//
// `ssr: false` is only legal inside a Client Component, so the dynamic
// boundary lives here (not in the server page). This keeps Three.js /
// React Three Fiber / @use-gesture code out of prerendering and out of
// the server bundle entirely, while app/(dashboard)/drip/page.tsx and
// app/wardrobe/page.tsx stay Server Components for metadata.

import React from "react";
import dynamic from "next/dynamic";

const FashionHub = dynamic(
  () => import("./FashionHub").then((m) => m.FashionHub),
  {
    ssr: false,
    loading: () => (
      <div className="w-full space-y-6" role="status" aria-label="Loading AinA Drip fashion hub">
        <div className="h-44 w-full animate-pulse rounded-[28px] bg-[#1A1A1D]" />
        <div className="flex h-[450px] w-full items-center justify-center rounded-2xl bg-[#1A1A1D] text-xs tracking-widest text-[#8A8A8F]">
          LOADING 3D STUDIO...
        </div>
        <div className="h-48 w-full animate-pulse rounded-xl bg-[#1A1A1D]/60" />
      </div>
    ),
  }
);

export function FashionHubLoader() {
  return <FashionHub />;
}

export default FashionHubLoader;
