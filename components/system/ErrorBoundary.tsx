"use client";

// components/system/ErrorBoundary.tsx
// AinA (Ai∩A MAXX) — reusable client Error Boundary.
//
// A render/effect throw anywhere inside the wrapped subtree is contained
// here and replaced with a branded, recoverable fallback instead of
// unmounting the whole app (React removes the entire root when an error
// escapes with no boundary — that is the "blank page on load" failure).
//
// Two flavours:
// - `ErrorBoundary` — generic section boundary with retry.
// - `WebGLBoundary` — specialized for Three.js / React Three Fiber canvases:
//   any canvas creation/runtime failure swaps in the caller's 2D fallback
//   (or a Lite-mode notice) and the rest of the page keeps working.

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Short label used in logs, e.g. "3D Lookbook". */
  label?: string;
  /** Custom fallback; receives the error and a retry callback. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
  /** Notified (client-side only) whenever an error is captured. */
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Client-only logging — never rethrow, never block the fallback render.
    console.error(`[AinA ErrorBoundary${this.props.label ? ` · ${this.props.label}` : ""}]`, error, info.componentStack);
    this.props.onError?.(error);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div
        role="alert"
        className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#1A1A1D] px-6 py-10 text-center"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF2D95]/15 text-[#FF2D95]">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-display text-sm font-bold text-white">This section hit a snag</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-neutral-400">
            The rest of AinA is still working. You can retry this section — your progress is safe.
          </p>
          <p className="mt-1 font-bengali text-xs text-neutral-500">এই অংশে সমস্যা হয়েছে — আবার চেষ্টা করুন।</p>
        </div>
        <button
          type="button"
          onClick={this.reset}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#FF2D95] px-5 text-xs font-bold text-white shadow-glow-rose transition hover:brightness-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }
}

interface WebGLBoundaryProps {
  children: React.ReactNode;
  /** Rendered instead of the canvas when WebGL fails (e.g. the Lite 2.5D view). */
  fallback: React.ReactNode;
  label?: string;
}

/**
 * Contains Three.js / R3F failures (context creation throw, shader compile
 * crash, lost context) and degrades to the provided non-WebGL fallback.
 */
export function WebGLBoundary({ children, fallback, label = "3D canvas" }: WebGLBoundaryProps) {
  return (
    <ErrorBoundary
      label={label}
      onError={(error) => console.warn(`[AinA WebGL] ${label} unavailable, using Lite fallback:`, error.message)}
      fallback={() => <>{fallback}</>}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
