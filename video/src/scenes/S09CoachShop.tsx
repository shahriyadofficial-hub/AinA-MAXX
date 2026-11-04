import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BANGLA, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, Headline, Kicker, ModelBadge, ParticleField, useEnter, useExitFade } from "../components/fx";
import { ChatBubble, PhoneFrame, TypingDots } from "../components/Phone";

const PRODUCTS = [
  { img: "photos/serum.jpg", name: "Niacinamide 10% + Zinc", brand: "The Ordinary", price: "৳1,350", delay: 96 },
  { img: "photos/skincare.jpg", name: "Relief Sun SPF50+ PA++++", brand: "Beauty of Joseon", price: "৳1,450", delay: 116 },
];

export const FeatureCoachShop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);
  const streak = useEnter(238);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground roseX="86%" cerX="10%" />
      <ParticleField count={44} opacity={0.3} />

      <div style={{ position: "absolute", top: 110, left: 120, width: 800 }}>
        <Kicker>Features 04–06 — Coach · Shop · Vibe</Kicker>
        <div style={{ marginTop: 18 }}>
          <Headline size={68}>
            A coach in your pocket.
            <br />
            <span style={{ color: C.rose }}>In your language.</span>
          </Headline>
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <ModelBadge delay={110}>muse-spark-1.3 · bilingual coach</ModelBadge>
          <ModelBadge delay={124} tone="rose">
            gemini-2.5-flash · safety failover
          </ModelBadge>
        </div>

        {/* product cards */}
        <div style={{ marginTop: 44, display: "flex", gap: 22 }}>
          {PRODUCTS.map((p) => {
            const s = spring({ frame: frame - p.delay, fps, config: { damping: 15, stiffness: 95 } });
            return (
              <div
                key={p.name}
                style={{
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [56, 0])}px)`,
                  width: 330,
                  borderRadius: 22,
                  overflow: "hidden",
                  background: C.graphite,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div style={{ height: 168 }}>
                  <Img src={staticFile(p.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "16px 20px 20px" }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 14.5, color: C.faint }}>{p.brand}</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19.5, fontWeight: 800, color: C.white, lineHeight: 1.25, marginTop: 3 }}>{p.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: 23, fontWeight: 800, color: C.ceruleanLight }}>{p.price}</span>
                    <span style={{ padding: "7px 15px", borderRadius: 99, background: C.rose, color: "#fff", fontSize: 14.5, fontWeight: 700 }}>Add to Bag</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* streak strip */}
        <div
          style={{
            marginTop: 30,
            opacity: streak.opacity,
            transform: `translateY(${streak.translateY * 0.5}px)`,
            display: "flex",
            gap: 14,
          }}
        >
          {[
            { t: "🔥 19-day streak", c: C.rose },
            { t: "⚡ 1,240 XP · Level 6", c: C.ceruleanLight },
            { t: "🏆 Effort-only leaderboard", c: C.green },
          ].map((b) => (
            <div
              key={b.t}
              style={{
                padding: "13px 22px",
                borderRadius: 999,
                background: C.graphite,
                border: `1px solid ${b.c}44`,
                fontFamily: FONT_DISPLAY,
                fontSize: 19,
                fontWeight: 700,
                color: b.c,
                whiteSpace: "nowrap",
              }}
            >
              {b.t}
            </div>
          ))}
        </div>
      </div>

      {/* coach phone */}
      <div style={{ position: "absolute", right: 150, top: 105 }}>
        <PhoneFrame delay={24} rotateY={7} width={440}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 25, fontWeight: 800, color: C.white }}>AinA Coach</div>
              <div style={{ fontSize: 14, color: C.green }}>● Online · knows your roadmap</div>
            </div>
            <div style={{ display: "flex", borderRadius: 99, overflow: "hidden", border: `1px solid ${C.border}` }}>
              <span style={{ padding: "7px 14px", background: C.graphite2, color: C.muted, fontSize: 14, fontWeight: 700 }}>EN</span>
              <span style={{ padding: "7px 14px", background: C.rose, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: FONT_BANGLA }}>বাংলা</span>
            </div>
          </div>

          <ChatBubble from="user" delay={70}>
            <span style={{ fontFamily: FONT_BANGLA }}>বর্ষায় মুখ এত তেলতেলে হয় কেন? রেটিনল কি এখন শুরু করা ঠিক হবে?</span>
          </ChatBubble>
          <TypingDots delay={104} />
          <ChatBubble from="ai" delay={132}>
            <span style={{ fontFamily: FONT_BANGLA }}>আর্দ্রতায় সেবাম বেড়ে যায় — স্বাভাবিক। </span>
            Humidity raises sebum. Start retinol only twice a week, sandwich it with moisturiser, and never pair it with AHA the same night.
          </ChatBubble>
          <ChatBubble from="ai" delay={196} width="92%">
            <span style={{ color: C.ceruleanLight, fontWeight: 700 }}>✓ Safety verified</span>
            <span style={{ color: C.muted }}> · Powered by Meta Muse Spark 1.3 · Red-flag symptoms escalate to a verified dermatologist.</span>
          </ChatBubble>
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};
