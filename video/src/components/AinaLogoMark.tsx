import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_DISPLAY } from "../lib/tokens";

/**
 * AinA wordmark recreated for Remotion (mirrors components/brand/AinaLogo.tsx).
 * `flip` animates scaleX 1 -> -1 -> 1 to prove the mirror property.
 * `shine` sweeps a light band across the letters (finale).
 */
export const AinaLogoMark: React.FC<{
  width?: number;
  flip?: boolean;
  shine?: boolean;
  showSubtitle?: boolean;
}> = ({ width = 760, flip = false, shine = false, showSubtitle = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flipP = spring({ frame: frame - 70, fps, config: { damping: 26, stiffness: 60, mass: 1.1 } });
  const scaleX = flip ? interpolate(flipP, [0, 0.5, 1], [1, -1, 1]) : 1;

  const shineP = shine
    ? interpolate(frame, [40, 95], [-30, 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : -40;

  const height = width * 0.344;
  return (
    <div style={{ width, height, position: "relative", transform: `scaleX(${scaleX})`, transformStyle: "preserve-3d" }}>
      <svg viewBox="0 0 320 110" width={width} height={height} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="aina-cerulean" x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#48CAE4" />
            <stop offset="45%" stopColor="#3FB6E0" />
            <stop offset="100%" stopColor="#007BA7" />
          </linearGradient>
          <filter id="aina-dot-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="rgba(255,45,149,0.9)" />
          </filter>
          <linearGradient id="aina-shine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.85" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <clipPath id="aina-clip">
            <text
              x="160"
              y="65"
              textAnchor="middle"
              fontFamily={FONT_DISPLAY}
              fontWeight="800"
              fontSize="68"
              letterSpacing="-1.5"
            >
              AinA
            </text>
          </clipPath>
        </defs>
        <text
          x="160"
          y="65"
          textAnchor="middle"
          fill="url(#aina-cerulean)"
          fontFamily={FONT_DISPLAY}
          fontWeight="800"
          fontSize="68"
          letterSpacing="-1.5"
        >
          AinA
        </text>
        {shine && (
          <g clipPath="url(#aina-clip)">
            <rect x={`${shineP}%`} y="0" width="26%" height="110" fill="url(#aina-shine)" transform="skewX(-18)" opacity="0.55" />
          </g>
        )}
        <circle cx="135.5" cy="21.5" r="6.8" fill={C.rose} filter="url(#aina-dot-glow)" />
        {showSubtitle && (
          <text
            x="167"
            y="97"
            textAnchor="middle"
            fill={C.rose}
            fontFamily={FONT_DISPLAY}
            fontWeight="900"
            fontSize="18"
            letterSpacing="15"
          >
            MAXX
          </text>
        )}
      </svg>
    </div>
  );
};

/** Vertical mirror axis with reflection pool, used in the mirror reveal scene. */
export const MirrorAxis: React.FC<{ height?: number }> = ({ height = 560 }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [10, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shimmer = 0.5 + 0.5 * Math.sin(frame * 0.06);
  return (
    <div style={{ position: "relative", width: 4, height }}>
      <div
        style={{
          width: 4,
          height: height * draw,
          borderRadius: 4,
          background: `linear-gradient(180deg, transparent, ${C.ceruleanLight}, ${C.rose}, ${C.ceruleanLight}, transparent)`,
          boxShadow: `0 0 ${18 + shimmer * 14}px rgba(63,182,224,0.75)`,
        }}
      />
    </div>
  );
};
