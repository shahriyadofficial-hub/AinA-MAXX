import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BANGLA, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, ParticleField, useEnter, useExitFade } from "../components/fx";
import { AinaLogoMark, MirrorAxis } from "../components/AinaLogoMark";

export const MirrorReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);

  const wordP = spring({ frame: frame - 14, fps, config: { damping: 16, stiffness: 75 } });
  const flipDone = spring({ frame: frame - 70, fps, config: { damping: 26, stiffness: 60, mass: 1.1 } });
  const sameP = useEnter(150);
  const explainer = useEnter(196);
  const bangla = useEnter(238);

  // reflection pool opacity pulses after flip completes
  const pool = interpolate(flipDone, [0.85, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground />
      <ParticleField count={80} />

      <div style={{ position: "absolute", top: 92, width: "100%", textAlign: "center" }}>
        <div
          style={{
            opacity: wordP,
            transform: `translateY(${interpolate(wordP, [0, 1], [30, 0])}px)`,
            fontFamily: FONT_DISPLAY,
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 6,
            color: C.muted,
            textTransform: "uppercase",
          }}
        >
          <span style={{ fontFamily: FONT_BANGLA, fontSize: 40, color: C.ceruleanLight, letterSpacing: 0 }}>আয়না</span>
          {"  "}— “Ayna” — means <span style={{ color: C.white }}>MIRROR</span>
        </div>
      </div>

      {/* logo + mirror axis */}
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ position: "relative", opacity: wordP }}>
          <AinaLogoMark width={880} flip showSubtitle={false} />
          {/* reflection pool */}
          <div
            style={{
              position: "absolute",
              top: "96%",
              left: 0,
              right: 0,
              transform: "scaleY(-1)",
              opacity: pool * 0.34,
              filter: "blur(1.5px)",
              maskImage: "linear-gradient(180deg, black 0%, transparent 62%)",
              WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 62%)",
            }}
          >
            <AinaLogoMark width={880} showSubtitle={false} />
          </div>
        </div>
        <div style={{ position: "absolute", left: "50%", top: -30, transform: "translateX(-50%)" }}>
          <MirrorAxis height={430} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 660,
          width: "100%",
          textAlign: "center",
          opacity: sameP.opacity,
          transform: `translateY(${sameP.translateY * 0.5}px)`,
          fontFamily: FONT_DISPLAY,
          fontSize: 46,
          fontWeight: 800,
          color: C.white,
        }}
      >
        Flip it. <span style={{ color: C.rose }}>It reads exactly the same.</span>
      </div>

      <div
        style={{
          position: "absolute",
          top: 748,
          width: "100%",
          textAlign: "center",
          opacity: explainer.opacity,
          fontFamily: FONT_BODY,
          fontSize: 26,
          color: C.muted,
        }}
      >
        A mirror-symmetric wordmark — because a true mirror never distorts who you are.
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 84,
          width: "100%",
          textAlign: "center",
          opacity: bangla.opacity,
          transform: `translateY(${bangla.translateY * 0.4}px)`,
          fontFamily: FONT_BANGLA,
          fontSize: 34,
          fontWeight: 600,
          color: C.ceruleanLight,
        }}
      >
        আয়নায় দেখো তোমার সেরা তুমি — Reflect the Prime You
      </div>
    </AbsoluteFill>
  );
};
