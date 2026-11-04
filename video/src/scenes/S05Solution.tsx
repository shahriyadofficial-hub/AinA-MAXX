import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, Headline, Kicker, ParticleField, useExitFade } from "../components/fx";

const TILES = [
  { icon: "🗺️", name: "30-Day Roadmap", model: "muse-spark-1.3", angle: -160, delay: 74 },
  { icon: "🔬", name: "AinA Coded Vision", model: "muse-spark-1.3 · muse-image", angle: -95, delay: 88 },
  { icon: "🧥", name: "3D Lookbook + Wardrobe", model: "sam-3.1 cutouts", angle: -30, delay: 102 },
  { icon: "💬", name: "Bilingual AI Coach", model: "muse-spark-1.3 + Gemini failover", angle: 35, delay: 116 },
  { icon: "🛍️", name: "Curated BDT Shop", model: "climate-tested products", angle: 100, delay: 130 },
  { icon: "🔥", name: "Maxx Streaks & Vibe", model: "XP · leaderboards · community", angle: 165, delay: 144 },
];

export const SolutionOverview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);
  const centerP = spring({ frame: frame - 52, fps, config: { damping: 14, stiffness: 80 } });

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground />
      <ParticleField count={70} />
      <div style={{ position: "absolute", top: 84, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Kicker>The solution</Kicker>
        </div>
        <div style={{ marginTop: 14 }}>
          <Headline size={66} align="center">
            One mirror. <span style={{ color: C.rose }}>Six superpowers.</span>
          </Headline>
        </div>
      </div>

      {/* center core */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 590,
          transform: `translate(-50%, -50%) scale(${interpolate(centerP, [0, 1], [0.5, 1])})`,
          opacity: centerP,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, #1E2A33, ${C.graphite} 70%)`,
          border: `2px solid ${C.cerulean}66`,
          boxShadow: "0 0 80px rgba(0,123,167,0.35), inset 0 0 50px rgba(255,45,149,0.10)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 56, fontWeight: 800, color: C.ceruleanLight, letterSpacing: -1 }}>
          Ain<span style={{ color: C.rose }}>A</span>
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, letterSpacing: 5, color: C.muted }}>MAXX CORE</div>
      </div>

      {/* orbiting tiles */}
      {TILES.map((t) => {
        const p = spring({ frame: frame - t.delay, fps, config: { damping: 15, stiffness: 85 } });
        const rad = (t.angle * Math.PI) / 180;
        const orbitR = interpolate(p, [0, 1], [60, 295]);
        const x = Math.cos(rad) * orbitR * 1.72;
        const y = Math.sin(rad) * orbitR * 0.92;
        return (
          <div
            key={t.name}
            style={{
              position: "absolute",
              left: "50%",
              top: 590,
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${interpolate(p, [0, 1], [0.6, 1])})`,
              opacity: p,
              width: 400,
              padding: "22px 26px",
              borderRadius: 22,
              background: "rgba(26,26,29,0.92)",
              border: `1.5px solid ${C.border}`,
              boxShadow: "0 24px 50px rgba(0,0,0,0.5)",
              zIndex: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 34 }}>{t.icon}</span>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 25, fontWeight: 800, color: C.white, lineHeight: 1.15 }}>{t.name}</span>
            </div>
            <div style={{ marginTop: 9, fontFamily: FONT_BODY, fontSize: 17.5, color: C.ceruleanLight }}>{t.model}</div>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          bottom: 64,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT_BODY,
          fontSize: 21,
          color: C.faint,
        }}
      >
        Skin · Hair · Fitness · Food · Fashion — one guided transformation, powered by Meta AI
      </div>
    </AbsoluteFill>
  );
};
