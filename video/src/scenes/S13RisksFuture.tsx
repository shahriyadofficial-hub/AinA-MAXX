import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, Headline, Kicker, ParticleField, useEnter, useExitFade } from "../components/fx";

const RISKS = [
  { risk: "AI gives unsafe advice", fix: "Deterministic safety filter + Gemini failover + dermatologist escalation", delay: 48 },
  { risk: "Privacy of face photos", fix: "Private buckets, signed URLs, PDPA 2026 consent, 18+ gate", delay: 76 },
  { risk: "API cost & rate limits", fix: "Disk-cached responses, Retry-After backoff, multi-model routing", delay: 104 },
  { risk: "Counterfeit products", fix: "Verified sellers only — never open-marketplace roulette", delay: 132 },
];

const FUTURE = [
  { icon: "📴", t: "Offline-first PWA for low-end Android", delay: 208 },
  { icon: "🗣️", t: "Voice coach in Bangla dialects", delay: 226 },
  { icon: "📅", t: "Barber & salon booking network", delay: 244 },
  { icon: "🥗", t: "Food & fitness plans, fully localised", delay: 262 },
];

export const RisksFuture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);
  const futHead = useEnter(186);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground roseX="86%" cerX="8%" />
      <ParticleField count={40} opacity={0.28} />
      <div style={{ position: "absolute", top: 88, left: 120, width: 900 }}>
        <Kicker color={C.amber}>Risks — faced honestly</Kicker>
        <div style={{ marginTop: 14 }}>
          <Headline size={58}>
            Every risk has <span style={{ color: C.amber }}>an engineered answer.</span>
          </Headline>
        </div>
      </div>

      {/* risk rows */}
      <div style={{ position: "absolute", top: 300, left: 120, width: 980, display: "flex", flexDirection: "column", gap: 14 }}>
        {RISKS.map((r) => {
          const p = spring({ frame: frame - r.delay, fps, config: { damping: 15, stiffness: 110 } });
          return (
            <div
              key={r.risk}
              style={{
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [-52, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "19px 26px",
                borderRadius: 18,
                background: C.graphite,
                border: `1px solid ${C.border}`,
              }}
            >
              <span style={{ fontSize: 24 }}>⚠️</span>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 22.5, fontWeight: 800, color: C.white, width: 330, flexShrink: 0 }}>{r.risk}</span>
              <span style={{ color: C.rose, fontSize: 24, fontWeight: 900 }}>→</span>
              <span style={{ fontFamily: FONT_BODY, fontSize: 19.5, lineHeight: 1.45, color: C.muted }}>{r.fix}</span>
            </div>
          );
        })}
      </div>

      {/* future panel */}
      <div style={{ position: "absolute", top: 300, right: 120, width: 560 }}>
        <div
          style={{
            opacity: futHead.opacity,
            transform: `translateY(${futHead.translateY * 0.5}px)`,
            fontFamily: FONT_DISPLAY,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 5,
            color: C.ceruleanLight,
            marginBottom: 18,
          }}
        >
          WHERE WE GO NEXT
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {FUTURE.map((f) => {
            const p = spring({ frame: frame - f.delay, fps, config: { damping: 15, stiffness: 110 } });
            return (
              <div
                key={f.t}
                style={{
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [52, 0])}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "17px 22px",
                  borderRadius: 16,
                  background: "rgba(63,182,224,0.07)",
                  border: `1px solid ${C.cerulean}3D`,
                  fontFamily: FONT_BODY,
                  fontSize: 20,
                  fontWeight: 600,
                  color: C.white,
                }}
              >
                <span style={{ fontSize: 25 }}>{f.icon}</span>
                {f.t}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 62,
          left: 120,
          fontFamily: FONT_BODY,
          fontSize: 19,
          color: C.faint,
        }}
      >
        Built in the open — full source, tests &amp; architecture in the GitHub repository.
      </div>
    </AbsoluteFill>
  );
};
