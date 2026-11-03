// app/wardrobe/page.tsx
// Legacy wardrobe route aliased to the AinA Drip Multi-Experience Fashion Hub

import React from "react";
import type { Metadata } from "next";
import { FashionHub } from "@/components/fashion/FashionHub";

export const metadata: Metadata = {
  title: "AinA Drip & Lookbook — Interactive 3D Fashion Hub · Ai∩A MAXX",
  description:
    "Interactive 3D lookbook, shoppable hotspots with outfit combo sidebar, capsule gap matching, and SAM 3.1 digital wardrobe cutouts.",
};

export default function WardrobePage() {
  return <FashionHub />;
}
