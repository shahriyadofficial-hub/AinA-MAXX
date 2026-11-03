// app/(dashboard)/drip/page.tsx
// AinA Drip — Multi-Experience Fashion Hub (canonical route: /drip).
// The legacy /wardrobe route renders the same hub for backward compatibility.

import React from "react";
import type { Metadata } from "next";
import { FashionHub } from "@/components/fashion/FashionHub";

export const metadata: Metadata = {
  title: "AinA Drip — Multi-Experience Fashion Hub · Ai∩A MAXX",
  description:
    "3D interactive lookbook, shoppable 'Try the Look' hotspots with combo sidebar, RAIL 3D virtual hanger carousel, capsule gap matching for Eid/campus/monsoon, and SAM 3.1 digital wardrobe cutouts. BDT-verified, zero attractiveness scoring.",
};

export default function DripPage() {
  return <FashionHub />;
}
