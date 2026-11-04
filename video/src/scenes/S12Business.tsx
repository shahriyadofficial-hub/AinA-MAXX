import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, Headline, Kicker, ParticleField, useEnter, useExitFade } from "../components/fx";

const STREAMS = [
  { icon: "🛍️", name: "Affiliate commerce", desc: "Curated BDT shop — verified sellers, routine-bag checkout.", tag: "Day 1", delay: 56 },
  { icon: "👑", name: "AinA Maxx Premium", desc: "Deeper plans, priority coach, advanced wardrobe AI.", tag: "৳299/mo*", delay: 78 },
  { icon: "💈", name: "B2B barbers & salons", desc: "Barber-card network, bookings, salon dashboards.", tag: "B2B SaaS", delay: 100 },
  { icon: "🤝", name: "Brand partnerships", desc: "Climate-tested launches with local & K-beauty brands.", tag: "Sponsored", delay: 122 },
];

const PHASES = [
  { phase: "Phase 1", title: "Dhaka launch", desc: "Campus ambassadors · F-commerce · barber network", delay: 196, color: C.ceruleanLight },
  { phase: "Phase 2", title: "Nationwide", desc: "Chattogram, Sylhet, Khulna · bKash subscriptions", delay: 224, color: C.rose },
  { phase: "Phase 3", title: "South Asia", desc: "Same climate belt: Kolkata, Assam, Nepal", delay: 252, color: C.green },
];

export const BusinessGtm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);
  const foot = useEnter(310);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground roseX="10%" cerX="86%" />
      <ParticleField count={40} opacity={0.28} />
      <div style={{ position: "absolute", top: 88, left: 120, right: 120 }}>
        <Kicker>Business model &amp; go-to-market</Kicker>
        <div style={{ marginTop: 14 }}>
          <Headline size={62}>
            Free to start. <span style={{ color: C.rose }}>Built to earn.</span>
          </Headline>
        </div>
      </div>

      {/* revenue streams */}
      <div style={{ position: "absolute", top: 300, left: 120, right: 120, display: "flex", gap: 24 }}>
        {STREAMS.map((s) => {
          const p = spring({ frame: frame - s.delay, fps, config: { damping: 15, stiffness: 95 } });
          return (
            <div
              key={s.name}
              style={{
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [58, 0])}px)`,
                flex: 1,
                padding: "28px 26px",
                borderRadius: 24,
                background: C.graphite,
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 40 }}>{s.icon}</span>
                <span
                  style={{
                    padding: "6px 14px",
                    borderRadius: 99,
                    background: C.ceruleanSoft,
                    border: `1px solid ${C.cerulean}44`,
                    fontFamily: FONT_DISPLAY,
                    fontSize: 15.5,
                    fontWeight: 700,
                    color: C.ceruleanLight,
                  }}
                >
                  {s.tag}
                </span>
              </div>
              <div style={{ marginTop: 16, fontFamily: FONT_DISPLAY, fontSize: 25, fontWeight: 800, color: C.white, lineHeight: 1.2 }}>{s.name}</div>
              <div style={{ marginTop: 9, fontFamily: FONT_BODY, fontSize: 18.5, lineHeight: 1.5, color: C.muted }}>{s.desc}</div>
            </div>
          );
        })}
      </div>

      {/* GTM timeline */}
      <div style={{ position: "absolute", top: 640, left: 120, right: 120 }}>
        <div style={{ position: "relative", height: 3, background: C.border, borderRadius: 3, margin: "0 30px" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${interpolate(frame, [180, 300], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`,
              background: `linear-gradient(90deg, ${C.cerulean}, ${C.rose})`,
              borderRadius: 3,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 34 }}>
          {PHASES.map((ph) => {
            const p = spring({ frame: frame - ph.delay, fps, config: { damping: 15, stiffness: 95 } });
            return (
              <div key={ph.phase} style={{ flex: 1, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [44, 0])}px)` }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 99,
                    background: ph.color,
                    boxShadow: `0 0 18px ${ph.color}`,
                    marginTop: -45,
                    marginBottom: 24,
                    position: "relative",
                    zIndex: 2,
                  }}
                />
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, letterSpacing: 3, color: ph.color }}>{ph.phase.toUpperCase()}</div>
                <div style={{ marginTop: 7, fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 800, color: C.white }}>{ph.title}</div>
                <div style={{ marginTop: 7, fontFamily: FONT_BODY, fontSize: 19, lineHeight: 1.5, color: C.muted }}>{ph.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 56,
          width: "100%",
          textAlign: "center",
          opacity: foot.opacity,
          fontFamily: FONT_BODY,
          fontSize: 17.5,
          color: C.faint,
        }}
      >
        *Illustrative launch pricing — validated with users before rollout. Acquisition starts where Bangladesh already lives: Facebook &amp; TikTok.
      </div>
    </AbsoluteFill>
  );
};
