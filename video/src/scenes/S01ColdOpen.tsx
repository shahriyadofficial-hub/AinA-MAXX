import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BANGLA, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, ParticleField, useExitFade } from "../components/fx";
import { AinaLogoMark } from "../components/AinaLogoMark";

const WORDS: { text: string; delay: number; color: string }[] = [
  { text: "Every", delay: 18, color: C.white },
  { text: "morning,", delay: 30, color: C.white },
  { text: "170", delay: 46, color: C.ceruleanLight },
  { text: "million", delay: 58, color: C.ceruleanLight },
  { text: "people", delay: 72, color: C.white },
  { text: "look", delay: 84, color: C.white },
  { text: "into", delay: 94, color: C.white },
  { text: "a", delay: 102, color: C.white },
  { text: "mirror…", delay: 110, color: C.rose },
];

export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);

  const lineDraw = interpolate(frame, [8, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Opening line must be fully gone before the question enters at frame 168 (00:05.6):
  // fade + rise over frames 146-166, then unmount (see conditional render below).
  const openingExit = interpolate(frame, [146, 166], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const openingRise = interpolate(frame, [146, 166], [0, -34], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const questionP = spring({ frame: frame - 168, fps, config: { damping: 17, stiffness: 80 } });
  const logoP = spring({ frame: frame - 252, fps, config: { damping: 15, stiffness: 65, mass: 1.1 } });
  const logoScale = interpolate(logoP, [0, 1], [2.6, 1]);
  const banglaP = spring({ frame: frame - 292, fps, config: { damping: 18, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground />
      <ParticleField count={110} />

      {/* opening line — exits 146-166, unmounts before the question enters at 168 */}
      {frame < 167 && (
        <div
          style={{
            position: "absolute",
            top: 330,
            width: "100%",
            textAlign: "center",
            fontFamily: FONT_DISPLAY,
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -0.5,
            padding: "0 190px",
            lineHeight: 1.25,
            opacity: openingExit,
            transform: `translateY(${openingRise}px)`,
          }}
        >
          {WORDS.map((w, i) => {
            const p = spring({ frame: frame - w.delay, fps, config: { damping: 14, stiffness: 130 } });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: 16,
                  opacity: p,
                  color: w.color,
                  transform: `translateY(${interpolate(p, [0, 1], [26, 0])}px)`,
                  textShadow: w.color === C.rose ? "0 0 34px rgba(255,45,149,0.55)" : undefined,
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      )}

      {/* mirror line */}
      <div
        style={{
          position: "absolute",
          top: 520,
          left: "50%",
          transform: "translateX(-50%)",
          width: 880 * lineDraw,
          height: 3,
          borderRadius: 3,
          background: `linear-gradient(90deg, transparent, ${C.ceruleanLight}, ${C.rose}, transparent)`,
          boxShadow: "0 0 22px rgba(63,182,224,0.6)",
          opacity: interpolate(frame, [150, 168], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />

      {/* the question */}
      <div
        style={{
          position: "absolute",
          top: 400,
          width: "100%",
          textAlign: "center",
          opacity: questionP * interpolate(frame, [238, 254], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(questionP, [0, 1], [40, 0])}px)`,
          fontFamily: FONT_DISPLAY,
          fontSize: 72,
          fontWeight: 800,
          color: C.white,
          letterSpacing: -1,
          padding: "0 200px",
          lineHeight: 1.15,
        }}
      >
        What if the mirror could
        <br />
        <span style={{ color: C.rose, textShadow: "0 0 40px rgba(255,45,149,0.5)" }}>guide you back?</span>
      </div>

      {/* logo punch-in */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: logoP,
          transform: `scale(${logoScale})`,
        }}
      >
        <AinaLogoMark width={820} />
        <div
          style={{
            marginTop: 34,
            opacity: banglaP,
            transform: `translateY(${interpolate(banglaP, [0, 1], [24, 0])}px)`,
            fontFamily: FONT_BANGLA,
            fontSize: 37,
            fontWeight: 600,
            color: C.ceruleanLight,
            letterSpacing: 1,
          }}
        >
          আয়নায় দেখো তোমার সেরা তুমি
        </div>
      </div>
    </AbsoluteFill>
  );
};
