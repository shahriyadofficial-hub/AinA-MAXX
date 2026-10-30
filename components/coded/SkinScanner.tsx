"use client";

import React, { useEffect, useRef, useState } from "react";
import { ScanFace, ShieldCheck, Lock } from "lucide-react";

export type ScanState = "idle" | "ready" | "scanning" | "done";

interface SkinScannerProps {
  state: ScanState;
  previewUrl?: string | null;
  progress: number; // 0..100 while scanning
}

/**
 * Cerulean (#007BA7) scanning overlay for AinA Coded.
 * Pure CSS animation — lightweight, 60fps on budget Android, no canvas cost.
 * The overlay communicates "guidance in progress", never a score.
 */
export function SkinScanner({ state, previewUrl, progress }: SkinScannerProps) {
  const scanning = state === "scanning";

  return (
    <div
      className="relative w-full aspect-[4/5] max-h-[420px] overflow-hidden rounded-aina bg-aina-dark border"
      style={{ borderColor: scanning ? "#007BA7" : "rgba(255,255,255,0.08)" }}
      aria-live="polite"
    >
      {/* Photo preview (private, local object URL only) */}
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Your private photo preview — stays on this device until you choose analysis"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-aina-cerulean/15 text-aina-light-cerulean">
            <ScanFace className="h-8 w-8" />
          </span>
          <p className="text-sm font-semibold text-white font-display">
            Private face &amp; hair frame
          </p>
          <p className="text-xs leading-relaxed text-neutral-400">
            Add a clear, front-facing photo in natural light. It stays in a
            private bucket with a short-lived link — never public, never scored.
          </p>
        </div>
      )}

      {/* Corner brackets */}
      <span className="pointer-events-none absolute left-3 top-3 h-7 w-7 rounded-tl-xl border-l-[3px] border-t-[3px] border-aina-cerulean" />
      <span className="pointer-events-none absolute right-3 top-3 h-7 w-7 rounded-tr-xl border-r-[3px] border-t-[3px] border-aina-cerulean" />
      <span className="pointer-events-none absolute bottom-3 left-3 h-7 w-7 rounded-bl-xl border-b-[3px] border-l-[3px] border-aina-cerulean" />
      <span className="pointer-events-none absolute bottom-3 right-3 h-7 w-7 rounded-br-xl border-b-[3px] border-r-[3px] border-aina-cerulean" />

      {/* Guide oval */}
      <span className="pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-aina-light-cerulean/50" />

      {/* Sweeping Cerulean scan line */}
      {scanning && (
        <>
          <span className="aina-scanline pointer-events-none absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-aina-cerulean/35 to-transparent" />
          <span className="pointer-events-none absolute inset-0 bg-aina-cerulean/5" />
        </>
      )}

      {/* Status chip */}
      <div className="absolute left-1/2 top-3 -translate-x-1/2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-aina-light-cerulean backdrop-blur">
          {scanning ? (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-aina-light-cerulean" />
              Scanning barrier &amp; texture… {Math.round(progress)}%
            </>
          ) : state === "done" ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Guidance ready · Safety verified
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              Cerulean scan · Private
            </>
          )}
        </span>
      </div>

      {/* Progress rail */}
      {scanning && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-aina-cerulean to-aina-light-cerulean transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <style jsx>{`
        .aina-scanline {
          animation: aina-scan-sweep 1.6s ease-in-out infinite alternate;
        }
        @keyframes aina-scan-sweep {
          from {
            top: 4%;
          }
          to {
            top: 82%;
          }
        }
      `}</style>
    </div>
  );
}

export function useScanProgress(active: boolean, durationMs = 2200) {
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    const started = performance.now();
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - started) / durationMs) * 100);
      setProgress(pct);
      if (pct < 100) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [active, durationMs]);

  return progress;
}

export default SkinScanner;
