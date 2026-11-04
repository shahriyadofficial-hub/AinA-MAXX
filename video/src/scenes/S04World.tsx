import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, Headline, Kicker, ParticleField, useEnter, useExitFade } from "../components/fx";

const FACTORS = [
  { icon: "🌧️", label: "Monsoon humidity 80–95%", delay: 120 },
  { icon: "🚿", label: "Hard water & Dhaka dust", delay: 142 },
  { icon: "৳", label: "Real BDT budgets", delay: 164 },
  { icon: "💈", label: "Local barbers & salons", delay: 186 },
  { icon: "👕", label: "Aarong · Sailor · F-commerce sizes", delay: 208 },
];

export const BuildForWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);

  // humidity gauge sweeps 40 -> 92
  const gauge = interpolate(frame, [96, 190], [40, 92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // rain streaks
  const drops = Array.from({ length: 42 }, (_, i) => {
    const x = ((i * 173) % 1920) + Math.sin(i * 7) * 20;
    const speed = 9 + ((i * 37) % 8);
    const y = ((i * 211 + frame * speed * 3) % 1180) - 60;
    return { x, y, len: 26 + ((i * 13) % 30), o: 0.10 + ((i * 29) % 10) / 60 };
  });

  const themeP = useEnter(238);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground roseX="85%" cerX="4%" />
      <ParticleField count={36} opacity={0.25} />
      {/* rain */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {drops.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.x,
              top: d.y,
              width: 2.5,
              height: d.len,
              borderRadius: 3,
              background: `linear-gradient(180deg, transparent, ${C.ceruleanLight})`,
              opacity: d.o,
              transform: "rotate(9deg)",
            }}
          />
        ))}
      </div>

      <div style={{ position: "absolute", top: 100, left: 120, right: 120 }}>
        <Kicker color={C.ceruleanLight}>Build for your world — Meta AI Hackathon</Kicker>
        <div style={{ marginTop: 18 }}>
          <Headline size={70}>
            Not imported advice.
            <br />
            <span style={{ color: C.ceruleanLight }}>Built for Bangladesh.</span>
          </Headline>
        </div>
      </div>

      {/* humidity gauge */}
      <div style={{ position: "absolute", top: 428, left: 120, width: 760 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, letterSpacing: 3, color: C.muted }}>
            DHAKA HUMIDITY — MONSOON
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 54, fontWeight: 800, color: C.ceruleanLight }}>{Math.round(gauge)}%</span>
        </div>
        <div style={{ height: 22, borderRadius: 99, background: C.graphite2, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${gauge}%`,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${C.cerulean}, ${C.ceruleanLight})`,
              boxShadow: "0 0 24px rgba(63,182,224,0.5)",
            }}
          />
        </div>
        <div style={{ marginTop: 16, fontFamily: FONT_BODY, fontSize: 21, color: C.muted, lineHeight: 1.5, maxWidth: 700 }}>
          Every routine, product conflict check and outfit in AinA is reasoned against this climate — not copied from a temperate-climate blog.
        </div>
      </div>

      {/* factor chips */}
      <div style={{ position: "absolute", top: 420, right: 120, width: 700, display: "flex", flexDirection: "column", gap: 14 }}>
        {FACTORS.map((f) => {
          const p = spring({ frame: frame - f.delay, fps, config: { damping: 15, stiffness: 120 } });
          return (
            <div
              key={f.label}
              style={{
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [60, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "17px 24px",
                borderRadius: 18,
                background: C.graphite,
                border: `1px solid ${C.border}`,
                fontFamily: FONT_DISPLAY,
                fontSize: 25,
                fontWeight: 700,
                color: C.white,
              }}
            >
              <span style={{ fontSize: 28, width: 40, textAlign: "center" }}>{f.icon}</span>
              {f.label}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 88,
          width: "100%",
          textAlign: "center",
          opacity: themeP.opacity,
          transform: `translateY(${themeP.translateY * 0.5}px)`,
          fontFamily: FONT_DISPLAY,
          fontSize: 38,
          fontWeight: 800,
          color: C.white,
        }}
      >
        Our world. Our climate. <span style={{ color: C.rose }}>Our mirror.</span>
      </div>
    </AbsoluteFill>
  );
};
