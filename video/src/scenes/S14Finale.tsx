import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BANGLA, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, ParticleField } from "../components/fx";
import { AinaLogoMark } from "../components/AinaLogoMark";

const REASONS = ["Localized, not imported", "Safe by design", "All-in-one guidance", "Built with Meta AI"];

export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoP = spring({ frame: frame - 8, fps, config: { damping: 15, stiffness: 70, mass: 1.1 } });
  const tagP = spring({ frame: frame - 62, fps, config: { damping: 16, stiffness: 85 } });
  const fadeOut = interpolate(frame, [214, 239], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <GlowBackground />
      <ParticleField count={120} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: logoP, transform: `scale(${interpolate(logoP, [0, 1], [0.82, 1])}) translateY(${interpolate(logoP, [0, 1], [36, 0])}px)` }}>
          <AinaLogoMark width={900} shine />
        </div>

        <div
          style={{
            marginTop: 30,
            opacity: tagP,
            transform: `translateY(${interpolate(tagP, [0, 1], [26, 0])}px)`,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 54, fontWeight: 800, color: C.white, letterSpacing: -0.5 }}>
            Reflect the <span style={{ color: C.rose }}>Prime You</span>
          </div>
          <div style={{ marginTop: 12, fontFamily: FONT_BANGLA, fontSize: 33, fontWeight: 600, color: C.ceruleanLight }}>
            আয়নায় দেখো তোমার সেরা তুমি
          </div>
        </div>

        {/* why-best chips */}
        <div style={{ marginTop: 44, display: "flex", gap: 14 }}>
          {REASONS.map((r, i) => {
            const p = spring({ frame: frame - (104 + i * 13), fps, config: { damping: 15, stiffness: 110 } });
            return (
              <div
                key={r}
                style={{
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [26, 0])}px) scale(${interpolate(p, [0, 1], [0.9, 1])})`,
                  padding: "12px 24px",
                  borderRadius: 999,
                  background: C.graphite,
                  border: `1px solid ${C.border}`,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 20,
                  fontWeight: 700,
                  color: C.white,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: C.rose, marginRight: 9 }}>◆</span>
                {r}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 52,
            opacity: interpolate(frame, [168, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            textAlign: "center",
            fontFamily: FONT_BODY,
            fontSize: 20,
            color: C.muted,
            lineHeight: 1.6,
          }}
        >
          Built for the <b style={{ color: C.white }}>Meta Global AI Developer Hackathon</b> · Build for Your World
          <br />
          <span style={{ color: C.faint }}>Muse Spark 1.3 · Muse Wonder · Muse Image · SAM 3.1 · Gemini 2.5 Flash failover</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
