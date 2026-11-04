"use client";

// app/global-error.tsx
// AinA (Ai∩A MAXX) — last-resort Error Boundary (App Router convention).
//
// Only renders when the root layout itself fails, so it must supply its own
// <html>/<body> and cannot rely on Tailwind classes compiled for the app
// shell — critical styles are inlined with the AinA design tokens
// (#0A0A0A Jet Black, #1A1A1D Graphite, #FF2D95 Neon Rose, #007BA7 Cerulean).

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AinA global error boundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0A0A0A",
          color: "#EDEDED",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <main
          style={{
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            background: "#1A1A1D",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24,
            padding: "40px 28px",
          }}
        >
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Ain<span style={{ color: "#FF2D95" }}>A</span>{" "}
            <span style={{ color: "#3FB6E0", fontSize: 13, letterSpacing: "0.35em" }}>M A X X</span>
          </p>
          <h1 style={{ margin: "20px 0 8px", fontSize: 20, fontWeight: 800 }}>
            Something interrupted your mirror session
          </h1>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#A3A3A3" }}>
            AinA hit an unexpected error. Your data is safe — reload to continue.
          </p>
          {error.digest && (
            <p style={{ margin: "10px 0 0", fontFamily: "monospace", fontSize: 11, color: "#666" }}>
              Ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              minHeight: 44,
              padding: "0 24px",
              borderRadius: 999,
              border: "none",
              background: "#FF2D95",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload AinA
          </button>
          <p style={{ margin: "16px 0 0", fontSize: 12, color: "#007BA7" }}>
            Zero attractiveness scoring · PDPA 2026
          </p>
        </main>
      </body>
    </html>
  );
}
