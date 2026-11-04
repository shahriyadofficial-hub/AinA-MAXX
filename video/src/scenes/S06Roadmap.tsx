import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, Headline, Kicker, ModelBadge, ParticleField, useEnter, useExitFade } from "../components/fx";
import { PhoneFrame, PhoneHeader, TaskRow } from "../components/Phone";

export const FeatureRoadmap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);

  const scrollP = interpolate(frame, [120, 300], [8, 64], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dayP = spring({ frame: frame - 306, fps, config: { damping: 16, stiffness: 90 } });
  const note = useEnter(318);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground roseX="10%" cerX="84%" />
      <ParticleField count={44} opacity={0.3} />

      <div style={{ position: "absolute", top: 130, left: 120, width: 880 }}>
        <Kicker>Feature 01 — Roadmap engine</Kicker>
        <div style={{ marginTop: 20 }}>
          <Headline size={78}>
            A 30-day plan that
            <br />
            <span style={{ color: C.rose }}>adapts to you.</span>
          </Headline>
        </div>
        <div style={{ marginTop: 26, fontFamily: FONT_BODY, fontSize: 25, lineHeight: 1.55, color: C.muted, maxWidth: 780 }}>
          Structured JSON roadmaps generated from your goals, skin &amp; hair type, BDT budget and daily minutes — then re-planned every week from your check-ins.
        </div>
        <div style={{ marginTop: 34, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <ModelBadge delay={150}>muse-spark-1.3 · roadmap generation</ModelBadge>
          <ModelBadge delay={164} tone="rose">
            muse-wonder · weekly adaptation
          </ModelBadge>
        </div>

        {/* Mirror Scroll explainer */}
        <div
          style={{
            marginTop: 52,
            opacity: note.opacity,
            transform: `translateY(${note.translateY * 0.5}px)`,
            padding: "26px 30px",
            borderRadius: 22,
            background: C.graphite,
            border: `1px solid ${C.border}`,
            maxWidth: 780,
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 23, fontWeight: 800, color: C.white, marginBottom: 8 }}>
            The Mirror Scroll
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 20, lineHeight: 1.5, color: C.muted }}>
            One elevation bar carries you from <b style={{ color: C.white }}>Current You</b> to <b style={{ color: C.rose }}>Prime You</b> — progress you can feel, never a score you’re judged by.
          </div>
        </div>
      </div>

      {/* phone */}
      <div style={{ position: "absolute", right: 150, top: 105 }}>
        <PhoneFrame delay={26} rotateY={-7}>
          <PhoneHeader title="Your 30-Day Roadmap" sub="Week 3 · Monsoon Acne Control" />
          {/* Mirror Scroll */}
          <div style={{ marginBottom: 18, padding: "16px 18px", borderRadius: 18, background: C.graphite, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700, marginBottom: 10 }}>
              <span style={{ color: C.muted }}>CURRENT YOU</span>
              <span style={{ color: C.rose }}>PRIME YOU</span>
            </div>
            <div style={{ height: 12, borderRadius: 99, background: C.graphite2, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${scrollP}%`,
                  borderRadius: 99,
                  background: `linear-gradient(90deg, ${C.cerulean}, ${C.rose})`,
                  boxShadow: "0 0 16px rgba(255,45,149,0.55)",
                }}
              />
            </div>
            <div style={{ marginTop: 9, fontSize: 13, color: C.faint }}>Day {Math.round(interpolate(scrollP, [8, 64], [3, 19]))} of 30 · {Math.round(scrollP)}% of the journey</div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div style={{ padding: "8px 18px", borderRadius: 99, background: C.rose, color: "#fff", fontSize: 15, fontWeight: 700 }}>AM</div>
            <div style={{ padding: "8px 18px", borderRadius: 99, background: C.graphite, border: `1px solid ${C.border}`, color: C.muted, fontSize: 15, fontWeight: 700 }}>PM</div>
          </div>

          <TaskRow label="Gentle cleanse — Simple Gel Wash" meta="2 min · morning" delay={120} />
          <TaskRow label="Niacinamide 10% — T-zone only" meta="3 drops · sebum control" delay={168} accent={C.ceruleanLight} />
          <TaskRow label="SPF50+ — 2 finger lengths" meta="Beauty of Joseon · no white cast" delay={216} />
          <TaskRow label="2L water + sleep by 11:30pm" meta="habit · streak day 19" delay={264} accent={C.ceruleanLight} />

          <div
            style={{
              marginTop: 8,
              opacity: dayP,
              transform: `scale(${interpolate(dayP, [0, 1], [0.8, 1])})`,
              textAlign: "center",
              padding: "13px",
              borderRadius: 16,
              background: C.roseSoft,
              border: `1px solid ${C.rose}44`,
              fontFamily: FONT_DISPLAY,
              fontSize: 17,
              fontWeight: 800,
              color: C.rose,
            }}
          >
            🔥 19-DAY MIRROR STREAK
          </div>
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};
