import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, Headline, Kicker, ParticleField, useEnter, useExitFade } from "../components/fx";

const PAINS = [
  { icon: "🎲", title: "Random products", body: "Bought on hype, abandoned in a drawer within weeks.", delay: 66 },
  { icon: "⚗️", title: "Conflicting actives", body: "Retinol layered over AHA — in 90% humidity. Barrier destroyed.", delay: 96 },
  { icon: "🌍", title: "Foreign advice", body: "Routines built for dry Western winters, not Dhaka monsoon air.", delay: 126 },
  { icon: "🧩", title: "Zero local fit", body: "No BDT pricing. No local sizes. No Bangla. No barber who gets it.", delay: 156 },
];

const PainCard: React.FC<(typeof PAINS)[number]> = ({ icon, title, body, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 120, mass: 0.9 } });
  const shake = frame > delay + 8 && frame < delay + 22 ? Math.sin((frame - delay) * 2.4) * 5 * (1 - (frame - delay - 8) / 14) : 0;
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [70, 0])}px) rotate(${interpolate(p, [0, 1], [-2.5, 0])}deg) translateX(${shake}px)`,
        background: C.graphite,
        border: `1.5px solid ${C.border}`,
        borderRadius: 26,
        padding: "34px 32px",
        width: 400,
      }}
    >
      <div style={{ fontSize: 46, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 31, fontWeight: 800, color: C.white, marginBottom: 10 }}>{title}</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 20.5, lineHeight: 1.5, color: C.muted }}>{body}</div>
    </div>
  );
};

export const Problem: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);
  const alert = useEnter(216);
  const verdict = useEnter(268);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground roseX="6%" cerX="80%" />
      <ParticleField count={50} opacity={0.3} />
      <div style={{ position: "absolute", top: 96, left: 120, right: 120 }}>
        <Kicker>The problem</Kicker>
        <div style={{ marginTop: 18 }}>
          <Headline size={72}>
            Bangladesh is <span style={{ color: C.rose }}>guessing</span> its way
            <br />
            to better skin, hair &amp; style.
          </Headline>
        </div>
      </div>

      <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26 }}>
        {PAINS.map((p) => (
          <PainCard key={p.title} {...p} />
        ))}
      </div>

      {/* conflict alert strip */}
      <div
        style={{
          position: "absolute",
          top: 742,
          left: "50%",
          transform: `translateX(-50%) translateY(${alert.translateY * 0.5}px) scale(${alert.scale})`,
          opacity: alert.opacity,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 30px",
          borderRadius: 999,
          background: "rgba(248,113,113,0.10)",
          border: "1.5px solid rgba(248,113,113,0.45)",
          fontFamily: FONT_DISPLAY,
          fontSize: 23,
          fontWeight: 700,
          color: C.red,
          whiteSpace: "nowrap",
        }}
      >
        ⚠ INGREDIENT CONFLICT — Retinol + Glycolic Acid, same night, monsoon humidity
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 92,
          width: "100%",
          textAlign: "center",
          opacity: verdict.opacity,
          transform: `translateY(${verdict.translateY * 0.5}px)`,
          fontFamily: FONT_DISPLAY,
          fontSize: 40,
          fontWeight: 800,
          color: C.white,
        }}
      >
        Guesswork is failing Bangladesh. <span style={{ color: C.ceruleanLight }}>It needs a guide.</span>
      </div>
    </AbsoluteFill>
  );
};
