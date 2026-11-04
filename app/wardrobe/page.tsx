// app/wardrobe/page.tsx
// Legacy wardrobe route aliased to the AinA Drip Multi-Experience Fashion Hub.
//
// Client-only boundary: the hub mounts Three.js / React Three Fiber
// canvases — loaded client-only via FashionHubLoader (`next/dynamic` +
// `ssr: false`, same as /drip) so WebGL never runs during prerendering
// or hydration.

import React from "react";
import type { Metadata } from "next";
import { FashionHubLoader } from "@/components/fashion/FashionHubLoader";

export const metadata: Metadata = {
  title: "AinA Drip & Lookbook — Interactive 3D Fashion Hub · Ai∩A MAXX",
  description:
    "Interactive 3D lookbook, shoppable hotspots with outfit combo sidebar, capsule gap matching, and SAM 3.1 digital wardrobe cutouts.",
};

export default function WardrobePage() {
  return <FashionHubLoader />;
}
