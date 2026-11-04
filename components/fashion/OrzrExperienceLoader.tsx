"use client";

// components/fashion/OrzrExperienceLoader.tsx
// Client-only loader for the ORZR layered-2D archive.
//
// `ssr: false` is only legal inside a Client Component, so the dynamic
// boundary lives here (not in the server page). OrzrExperience binds
// @use-gesture/react drag handlers and reads matchMedia — it must never
// be server-prerendered. app/orzr/page.tsx stays a Server Component for
// metadata.

import React from "react";
import dynamic from "next/dynamic";

const OrzrExperience = dynamic(
  () => import("./OrzrExperience").then((m) => m.OrzrExperience),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center bg-black" role="status">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-500">
          Loading ORZR Archive…
        </p>
      </div>
    ),
  }
);

export function OrzrExperienceLoader() {
  return <OrzrExperience />;
}

export default OrzrExperienceLoader;
