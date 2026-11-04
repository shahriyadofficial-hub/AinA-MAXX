import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BANGLA, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, Headline, Kicker, ModelBadge, ParticleField, useEnter, useExitFade } from "../components/fx";

const FINDINGS = [
  { label: "Skin type", value: "Combination · T-zone oily", delay: 150 },
  { label: "Barrier status", value: "Mildly compromised — hydrate first", delay: 172 },
  { label: "Hair texture", value: "Wavy · humidity frizz-prone", delay: 194 },
  { label: "Confidence", value: "High · guidance, not diagnosis", delay: 216 },
];

export const FeatureCoded: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);

  const photoP = spring({ frame: frame - 20, fps, config: { damping: 16, stiffness: 70 } });
  const scanY = interpolate(frame, [60, 240], [4, 96], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scanOpacity = interpolate(frame, [240, 262], [1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barber = useEnter(268);
  const pledge = useEnter(322);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground roseX="82%" cerX="8%" />
      <ParticleField count={44} opacity={0.3} />

      <div style={{ position: "absolute", top: 118, left: 120, width: 860 }}>
        <Kicker color={C.ceruleanLight}>Feature 02 — AinA Coded</Kicker>
        <div style={{ marginTop: 20 }}>
          <Headline size={74}>
            See what your skin
            <br />
            <span style={{ color: C.ceruleanLight }}>is actually saying.</span>
          </Headline>
        </div>
        <div style={{ marginTop: 24, fontFamily: FONT_BODY, fontSize: 24.5, lineHeight: 1.55, color: C.muted, maxWidth: 800 }}>
          Private photo guidance for skin barrier &amp; hair — cautious, confidence-labelled, and stored only in private buckets with short-lived signed URLs.
        </div>
        <div style={{ marginTop: 30, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <ModelBadge delay={120}>muse-spark-1.3 · vision guidance</ModelBadge>
          <ModelBadge delay={134} tone="rose">
            muse-image · barber reference cards
          </ModelBadge>
        </div>

        {/* barber card */}
        <div
          style={{
            marginTop: 40,
            opacity: barber.opacity,
            transform: `translateY(${barber.translateY * 0.55}px)`,
            display: "flex",
            gap: 22,
            alignItems: "center",
            padding: "24px 28px",
            borderRadius: 22,
            background: C.graphite,
            border: `1px solid ${C.border}`,
            maxWidth: 800,
          }}
        >
          <div style={{ borderRadius: 16, overflow: "hidden", width: 118, height: 118, flexShrink: 0 }}>
            <Img src={staticFile("photos/barber.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 23, fontWeight: 800, color: C.white }}>Barber Reference Card</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 19, color: C.muted, marginTop: 5, lineHeight: 1.45 }}>
              A visual cut guide your local barber can follow — no guesswork, no bad haircut.
            </div>
            <div style={{ fontFamily: FONT_BANGLA, fontSize: 19, color: C.ceruleanLight, marginTop: 6 }}>
              পাশে ছোট রাখুন, উপরে টেক্সচার দিন — Show this card, get this cut.
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            opacity: pledge.opacity,
            fontFamily: FONT_DISPLAY,
            fontSize: 27,
            fontWeight: 800,
            color: C.white,
          }}
        >
          Zero attractiveness scores. <span style={{ color: C.rose }}>Ever.</span>
          <span style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 21, color: C.muted }}> Only barrier health, consistency &amp; care.</span>
        </div>
      </div>

      {/* scanning portrait */}
      <div style={{ position: "absolute", right: 140, top: 130 }}>
        <div
          style={{
            opacity: photoP,
            transform: `translateY(${interpolate(photoP, [0, 1], [70, 0])}px)`,
            width: 470,
            height: 640,
            borderRadius: 34,
            overflow: "hidden",
            position: "relative",
            border: `2px solid ${C.cerulean}55`,
            boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 70px rgba(0,123,167,0.22)",
          }}
        >
          <Img src={staticFile("photos/hero.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,10,0.05), rgba(10,10,10,0.45))" }} />
          {/* scan line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${scanY}%`,
              height: 4,
              opacity: scanOpacity,
              background: C.ceruleanLight,
              boxShadow: `0 0 26px ${C.ceruleanLight}, 0 0 60px ${C.cerulean}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: `${scanY}%`,
              opacity: 0.16 * scanOpacity,
              background: `linear-gradient(180deg, transparent, ${C.cerulean})`,
            }}
          />
          {/* corner brackets */}
          {[
            { top: 16, left: 16, borderTop: `3px solid ${C.ceruleanLight}`, borderLeft: `3px solid ${C.ceruleanLight}` },
            { top: 16, right: 16, borderTop: `3px solid ${C.ceruleanLight}`, borderRight: `3px solid ${C.ceruleanLight}` },
            { bottom: 16, left: 16, borderBottom: `3px solid ${C.ceruleanLight}`, borderLeft: `3px solid ${C.ceruleanLight}` },
            { bottom: 16, right: 16, borderBottom: `3px solid ${C.ceruleanLight}`, borderRight: `3px solid ${C.ceruleanLight}` },
          ].map((s, i) => (
            <div key={i} style={{ position: "absolute", width: 42, height: 42, ...s } as React.CSSProperties} />
          ))}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              padding: "8px 16px",
              borderRadius: 99,
              background: "rgba(10,10,10,0.72)",
              border: `1px solid ${C.cerulean}66`,
              fontFamily: FONT_DISPLAY,
              fontSize: 15.5,
              fontWeight: 700,
              letterSpacing: 2,
              color: C.ceruleanLight,
            }}
          >
            AINA CODED · SCANNING
          </div>
        </div>

        {/* findings */}
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 10, width: 470 }}>
          {FINDINGS.map((f) => {
            const p = spring({ frame: frame - f.delay, fps, config: { damping: 15, stiffness: 120 } });
            return (
              <div
                key={f.label}
                style={{
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [46, 0])}px)`,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "13px 20px",
                  borderRadius: 16,
                  background: "rgba(26,26,29,0.92)",
                  border: `1px solid ${C.border}`,
                }}
              >
                <span style={{ fontFamily: FONT_BODY, fontSize: 17.5, color: C.faint }}>{f.label}</span>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 17.5, fontWeight: 700, color: C.white, textAlign: "right" }}>{f.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* conflict checker mini-strip */}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: 120,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: interpolate(frame, [286, 306], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          padding: "14px 24px",
          borderRadius: 999,
          background: "rgba(52,211,153,0.10)",
          border: "1.5px solid rgba(52,211,153,0.4)",
          fontFamily: FONT_DISPLAY,
          fontSize: 20.5,
          fontWeight: 700,
          color: C.green,
        }}
      >
        ✓ muse-wonder verified: Niacinamide + SPF — safe together in high humidity
      </div>
    </AbsoluteFill>
  );
};
