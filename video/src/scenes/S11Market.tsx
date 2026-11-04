import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { CountUp, GlowBackground, Headline, Kicker, ParticleField, useEnter, useExitFade } from "../components/fx";

const STATS = [
  { to: 170, suffix: "M+", label: "people — 8th largest nation on Earth", delay: 60, color: C.ceruleanLight },
  { to: 135, suffix: "M+", label: "internet subscribers, mobile-first", delay: 84, color: C.white },
  { to: 190, suffix: "M", label: "mobile connections nationwide", delay: 108, color: C.white },
];

const BARS = [
  { year: "2024", v: 1.68, h: 150 },
  { year: "2026", v: 1.95, h: 196 },
  { year: "2028", v: 2.3, h: 248 },
  { year: "2030", v: 2.76, h: 308 },
];

export const Market: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);
  const note = useEnter(300);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground roseX="84%" cerX="10%" />
      <ParticleField count={60} />
      <div style={{ position: "absolute", top: 92, left: 120, right: 120 }}>
        <Kicker>Why Bangladesh, why now</Kicker>
        <div style={{ marginTop: 16 }}>
          <Headline size={66}>
            A giant market with <span style={{ color: C.rose }}>no guide.</span>
          </Headline>
        </div>
      </div>

      {/* stat counters */}
      <div style={{ position: "absolute", top: 330, left: 120, display: "flex", gap: 70 }}>
        {STATS.map((s) => {
          const p = spring({ frame: frame - s.delay, fps, config: { damping: 16, stiffness: 90 } });
          return (
            <div key={s.label} style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`, width: 400 }}>
              <CountUp to={s.to} suffix={s.suffix} delay={s.delay + 6} dur={60} size={104} color={s.color} />
              <div style={{ marginTop: 8, fontFamily: FONT_BODY, fontSize: 21.5, lineHeight: 1.45, color: C.muted }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* market growth chart */}
      <div style={{ position: "absolute", top: 600, left: 120, width: 1080 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, letterSpacing: 2.5, color: C.muted }}>
            BANGLADESH SKINCARE MARKET — USD BILLION
          </span>
          <span style={{ fontFamily: FONT_BODY, fontSize: 17, color: C.faint }}>Industry estimates · ~5–8% CAGR</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 44, height: 330, borderBottom: `2px solid ${C.border}`, paddingLeft: 6 }}>
          {BARS.map((b, i) => {
            const p = spring({ frame: frame - (150 + i * 22), fps, config: { damping: 17, stiffness: 80 } });
            return (
              <div key={b.year} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 200 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 800, color: i === 3 ? C.rose : C.white, opacity: p }}>
                  ${b.v.toFixed(2)}B
                </div>
                <div
                  style={{
                    width: 150,
                    height: b.h * p,
                    borderRadius: "14px 14px 0 0",
                    background: i === 3 ? `linear-gradient(180deg, ${C.rose}, #8F1D5C)` : `linear-gradient(180deg, ${C.ceruleanLight}, ${C.cerulean})`,
                    boxShadow: i === 3 ? "0 0 34px rgba(255,45,149,0.35)" : "0 0 22px rgba(0,123,167,0.3)",
                  }}
                />
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, color: C.muted, paddingBottom: 10 }}>{b.year}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* right rail copy */}
      <div style={{ position: "absolute", top: 606, right: 120, width: 480, display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { t: "Only all-in-one solution", d: "Skin, hair, fitness, food & fashion guidance — no competitor combines them.", delay: 210 },
          { t: "Rising middle class", d: "Millions entering premium personal care every single year.", delay: 232 },
          { t: "F-commerce native", d: "Built for how Bangladesh actually shops: Facebook, bKash, COD.", delay: 254 },
        ].map((c) => {
          const p = spring({ frame: frame - c.delay, fps, config: { damping: 15, stiffness: 100 } });
          return (
            <div
              key={c.t}
              style={{
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [52, 0])}px)`,
                padding: "22px 26px",
                borderRadius: 20,
                background: C.graphite,
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 800, color: C.white }}>{c.t}</div>
              <div style={{ marginTop: 6, fontFamily: FONT_BODY, fontSize: 19, lineHeight: 1.5, color: C.muted }}>{c.d}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 54,
          width: "100%",
          textAlign: "center",
          opacity: note.opacity,
          fontFamily: FONT_BODY,
          fontSize: 19,
          color: C.faint,
        }}
      >
        Sources: BTRC · DataReportal · Research and Markets (2024–25 estimates) — full citations in the video description.
      </div>
    </AbsoluteFill>
  );
};
