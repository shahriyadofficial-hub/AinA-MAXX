"use client";

// app/error.tsx
// AinA (Ai∩A MAXX) — root route Error Boundary (App Router convention).
//
// Catches any render/data error in the route tree below the root layout and
// renders a branded recovery screen *inside* the shell (Navbar/BottomNav/
// Coach stay alive) instead of a blank page. `reset()` re-renders the route.

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AinA root error boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF2D95]/15 text-[#FF2D95]">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h1 className="font-display text-xl font-extrabold text-white sm:text-2xl">
          Something interrupted your mirror session
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-neutral-400">
          A part of AinA failed to load. Your roadmap, streak, and bag are safe — retry, or head back home.
        </p>
        <p className="font-bengali text-sm text-neutral-500">কিছু একটা সমস্যা হয়েছে — আবার চেষ্টা করুন।</p>
        {error.digest && <p className="font-mono text-[11px] text-neutral-600">Ref: {error.digest}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#FF2D95] px-6 text-sm font-bold text-white shadow-glow-rose transition hover:brightness-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D95]"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
