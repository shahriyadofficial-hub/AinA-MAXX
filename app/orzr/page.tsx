// app/orzr/page.tsx
// ORZR by Tsuru Kawagoe — standalone layered 2D fashion rack & accessory
// archive. Non-transactional editorial experience (no prices, no cart).

import React from "react";
import type { Metadata } from "next";
import { OrzrExperience } from "@/components/fashion/OrzrExperience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ORZR — Layered 2D Fashion Rack & Accessory Archive · Ai∩A MAXX",
  description:
    "ORZR by Tsuru Kawagoe: a monochrome brutalist-luxury interactive archive. Drag the clothing rail, lift pieces off the hanger, browse the accessory display case. CSS 3D layered cutouts, no WebGL, no checkout.",
};

export default function OrzrPage() {
  return <OrzrExperience />;
}
