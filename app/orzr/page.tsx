// app/orzr/page.tsx
// ORZR by Tsuru Kawagoe — standalone layered 2D fashion rack & accessory
// archive. Non-transactional editorial experience (no prices, no cart).
//
// Client-only boundary: OrzrExperience binds @use-gesture/react drag
// handlers and reads matchMedia — it must never be server-prerendered.
// Loaded client-only via OrzrExperienceLoader (`next/dynamic` +
// `ssr: false` — which Next.js only allows inside a Client Component);
// this page stays a Server Component so metadata renders on the server.

import React from "react";
import type { Metadata } from "next";
import { OrzrExperienceLoader } from "@/components/fashion/OrzrExperienceLoader";

export const metadata: Metadata = {
  title: "ORZR — Layered 2D Fashion Rack & Accessory Archive · Ai∩A MAXX",
  description:
    "ORZR by Tsuru Kawagoe: a monochrome brutalist-luxury interactive archive. Drag the clothing rail, lift pieces off the hanger, browse the accessory display case. CSS 3D layered cutouts, no WebGL, no checkout.",
};

export default function OrzrPage() {
  return <OrzrExperienceLoader />;
}
