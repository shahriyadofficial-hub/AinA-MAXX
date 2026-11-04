// app/(dashboard)/drip/page.tsx
// AinA Drip — Multi-Experience Fashion Hub (canonical route: /drip).
// The legacy /wardrobe route renders the same hub for backward compatibility.
//
// Client-only boundary: FashionHub mounts Three.js / React Three Fiber
// canvases and @use-gesture drag handlers. It is loaded client-only via
// FashionHubLoader (`next/dynamic` + `ssr: false` — which Next.js only
// allows inside a Client Component) so WebGL code never runs during
// prerendering or hydration. This page stays a Server Component so
// metadata still renders on the server.

import React from "react";
import type { Metadata } from "next";
import { FashionHubLoader } from "@/components/fashion/FashionHubLoader";

export const metadata: Metadata = {
  title: "AinA Drip — Multi-Experience Fashion Hub · Ai∩A MAXX",
  description:
    "3D interactive lookbook, shoppable 'Try the Look' hotspots with combo sidebar, RAIL 3D virtual hanger carousel, capsule gap matching for Eid/campus/monsoon, and SAM 3.1 digital wardrobe cutouts. BDT-verified, zero attractiveness scoring.",
};

export default function DripPage() {
  return <FashionHubLoader />;
}
