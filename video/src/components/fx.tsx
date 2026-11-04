import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY } from "../lib/tokens";

/** Deterministic pseudo-random from seed (stable across renders). */
export function seeded(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Fade/slide/scale entrance driven by springs. */
export function useEnter(delay = 0, config?: Parameters<typeof spring>[0]["config"]) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: config ?? { damping: 18, stiffness: 90, mass: 0.9 } });
  return {
    p,
    opacity: p,
    translateY: interpolate(p, [0, 1], [44, 0]),
    scale: interpolate(p, [0, 1], [0.92, 1]),
  };
}

/** Standard scene exit fade (last `frames` frames). */
export function useExitFade(durationInFrames: number, frames = 14) {
  const frame = useCurrentFrame();
  return interpolate(frame, [durationInFrames - frames, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export const Kicker: React.FC<{ children: React.ReactNode; color?: string; delay?: number }> = ({
  children,
  color = C.rose,
  delay = 0,
}) => {
  const e = useEnter(delay);
  return (
    <div
      style={{
        opacity: e.opacity,
        transform: `translateY(${e.translateY * 0.5}px)`,
        fontFamily: FONT_DISPLAY,
        fontSize: 25,
        fontWeight: 700,
        letterSpacing: 7,
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </div>
  );
};

export const Headline: React.FC<{
  children: React.ReactNode;
  size?: number;
  delay?: number;
  color?: string;
  align?: "left" | "center";
}> = ({ children, size = 76, delay = 6, color = C.white, align = "left" }) => {
  const e = useEnter(delay);
  return (
    <div
      style={{
        opacity: e.opacity,
        transform: `translateY(${e.translateY}px)`,
        fontFamily: FONT_DISPLAY,
        fontSize: size,
        fontWeight: 800,
        lineHeight: 1.04,
        letterSpacing: -1,
        color,
        textAlign: align,
      }}
    >
      {children}
    </div>
  );
};

export const GradientText: React.FC<{ children: React.ReactNode; from?: string; to?: string }> = ({
  children,
  from = C.ceruleanLight,
  to = C.rose,
}) => (
  <span
    style={{
      background: `linear-gradient(92deg, ${from} 0%, ${to} 100%)`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    }}
  >
    {children}
  </span>
);

/** Small pill badge, e.g. model attribution. */
export const ModelBadge: React.FC<{ children: React.ReactNode; delay?: number; tone?: "rose" | "cerulean" }> = ({
  children,
  delay = 0,
  tone = "cerulean",
}) => {
  const e = useEnter(delay);
  const col = tone === "rose" ? C.rose : C.ceruleanLight;
  return (
    <div
      style={{
        opacity: e.opacity,
        transform: `translateY(${e.translateY * 0.4}px) scale(${e.scale})`,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 20px",
        borderRadius: 999,
        border: `1.5px solid ${col}55`,
        background: tone === "rose" ? C.roseSoft : C.ceruleanSoft,
        color: col,
        fontFamily: FONT_DISPLAY,
        fontSize: 21,
        fontWeight: 700,
        letterSpacing: 1.5,
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: 99, background: col, boxShadow: `0 0 12px ${col}` }} />
      {children}
    </div>
  );
};

/** Animated count-up number. */
export const CountUp: React.FC<{
  to: number;
  delay?: number;
  dur?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  size?: number;
  color?: string;
}> = ({ to, delay = 0, dur = 55, prefix = "", suffix = "", decimals = 0, size = 110, color = C.white }) => {
  const frame = useCurrentFrame();
  const t = clamp01((frame - delay) / dur);
  const eased = 1 - Math.pow(1 - t, 3);
  const val = to * eased;
  const text = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-US");
  return (
    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: size, color, letterSpacing: -2 }}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
};

/** Deterministic particle/star field. */
export const ParticleField: React.FC<{ count?: number; opacity?: number }> = ({ count = 90, opacity = 0.55 }) => {
  const frame = useCurrentFrame();
  const dots = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: seeded(i + 1) * 1920,
        y: seeded(i + 101) * 1080,
        r: 1 + seeded(i + 201) * 2.6,
        speed: 0.25 + seeded(i + 301) * 0.9,
        phase: seeded(i + 401) * Math.PI * 2,
        rose: seeded(i + 501) > 0.72,
      })),
    [count]
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      {dots.map((d, i) => {
        const y = (d.y - frame * d.speed * 2.2) % 1080;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.03 + d.phase));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.x,
              top: y < 0 ? y + 1080 : y,
              width: d.r * 2,
              height: d.r * 2,
              borderRadius: 99,
              background: d.rose ? C.rose : C.ceruleanLight,
              opacity: tw * 0.8,
              boxShadow: `0 0 ${6 + d.r * 3}px ${d.rose ? C.rose : C.ceruleanLight}`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Ambient dual-glow background used across scenes. */
export const GlowBackground: React.FC<{ roseX?: string; cerX?: string }> = ({ roseX = "78%", cerX = "12%" }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.008) * 30;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.black, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          left: roseX,
          top: "-22%",
          transform: `translate(${drift}px, ${drift * 0.4}px)`,
          background: "radial-gradient(circle, rgba(255,45,149,0.20) 0%, rgba(255,45,149,0) 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          left: cerX,
          bottom: "-30%",
          transform: `translate(${-drift}px, ${-drift * 0.3}px)`,
          background: "radial-gradient(circle, rgba(0,123,167,0.26) 0%, rgba(0,123,167,0) 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
        }}
      />
    </div>
  );
};

/** Scene progress hairline (bottom). */
export const ProgressHairline: React.FC<{ progress: number }> = ({ progress }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, background: "rgba(255,255,255,0.06)" }}>
    <div
      style={{
        height: "100%",
        width: `${progress * 100}%`,
        background: `linear-gradient(90deg, ${C.cerulean}, ${C.ceruleanLight}, ${C.rose})`,
      }}
    />
  </div>
);
