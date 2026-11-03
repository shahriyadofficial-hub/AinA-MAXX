"use client";

import React from "react";

export type LogoVariant = "primary" | "rose" | "gradient" | "white" | "monochrome";

export interface AinaLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  variant?: LogoVariant;
}

/**
 * AinA (Ai∩A MAXX) Official Brand Logo Lockup
 * Based on the master design system:
 * - Geometric AinA wordmark with capital A, lowercase i (with glowing Neon Rose dot),
 *   rounded arch n, and capital A.
 * - Primary colorway: Luminous Cerulean (#007BA7 / #3FB6E0) with Neon Rose (#FF2D95) dot & MAXX subtitle.
 */
export function AinaLogo({
  className = "",
  size = "md",
  showSubtitle = true,
  variant = "primary",
}: AinaLogoProps) {
  const sizeMap = {
    sm: { width: 130, height: 46, fontSize: 34, subSize: 10, subY: 38 },
    md: { width: 170, height: 60, fontSize: 44, subSize: 12, subY: 50 },
    lg: { width: 230, height: 82, fontSize: 60, subSize: 16, subY: 68 },
    xl: { width: 310, height: 110, fontSize: 80, subSize: 22, subY: 92 },
  };

  const { width, height } = sizeMap[size];

  // Unique ID prefix for gradients and filters
  const idPrefix = React.useId().replace(/:/g, "_");

  // Determine colors based on variant
  const getColors = () => {
    switch (variant) {
      case "rose":
        return {
          textFill: "#FF2D95",
          dotFill: "#3FB6E0",
          dotGlow: "rgba(63, 182, 224, 0.8)",
          subFill: "#3FB6E0",
        };
      case "gradient":
        return {
          textFill: `url(#${idPrefix}-grad-rose-cerulean)`,
          dotFill: "#FF2D95",
          dotGlow: "rgba(255, 45, 149, 0.85)",
          subFill: "#FF2D95",
        };
      case "white":
        return {
          textFill: "#FFFFFF",
          dotFill: "#FF2D95",
          dotGlow: "rgba(255, 45, 149, 0.85)",
          subFill: "#FF2D95",
        };
      case "monochrome":
        return {
          textFill: "#E8E8E5",
          dotFill: "#E8E8E5",
          dotGlow: "rgba(232, 232, 229, 0.5)",
          subFill: "#E8E8E5",
        };
      case "primary":
      default:
        return {
          textFill: `url(#${idPrefix}-cerulean-glow)`,
          dotFill: "#FF2D95",
          dotGlow: "rgba(255, 45, 149, 0.9)",
          subFill: "#FF2D95",
        };
    }
  };

  const { textFill, dotFill, dotGlow, subFill } = getColors();

  return (
    <div
      className={`inline-flex flex-col items-center justify-center select-none ${className}`}
      data-testid="aina-logo"
    >
      <svg
        viewBox="0 0 320 110"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Ai∩A MAXX"
        role="img"
        className="w-auto h-auto max-w-full drop-shadow-[0_2px_12px_rgba(0,123,167,0.25)]"
      >
        <defs>
          {/* Cerulean Brand Gradient (Light Cerulean to Deep Cerulean) */}
          <linearGradient
            id={`${idPrefix}-cerulean-glow`}
            x1="0%"
            y1="20%"
            x2="100%"
            y2="80%"
          >
            <stop offset="0%" stopColor="#48CAE4" />
            <stop offset="45%" stopColor="#3FB6E0" />
            <stop offset="100%" stopColor="#007BA7" />
          </linearGradient>

          {/* Cerulean to Neon Rose Gradient */}
          <linearGradient
            id={`${idPrefix}-grad-rose-cerulean`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3FB6E0" />
            <stop offset="60%" stopColor="#FF2D95" />
            <stop offset="100%" stopColor="#FF5C00" />
          </linearGradient>

          {/* Dot Glow Filter */}
          <filter
            id={`${idPrefix}-dot-glow`}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={dotGlow} />
          </filter>
        </defs>

        <g>
          {/* Main Logo Text: A i n A with modern geometric glyph styling */}
          <text
            x="160"
            y="65"
            textAnchor="middle"
            fill={textFill}
            fontFamily="var(--font-space-grotesk), 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="800"
            fontSize="68"
            letterSpacing="-1.5"
          >
            A<tspan dy="0" fill={textFill}>i</tspan><tspan dy="0" fill={textFill}>n</tspan><tspan dy="0" fill={textFill}>A</tspan>
          </text>

          {/* Glowing Neon Rose Dot over the 'i' */}
          <circle
            cx="135.5"
            cy="21.5"
            r="6.8"
            fill={dotFill}
            filter={`url(#${idPrefix}-dot-glow)`}
          />

          {/* Subtitle: M A X X */}
          {showSubtitle && (
            <text
              x="160"
              y="97"
              textAnchor="middle"
              fill={subFill}
              fontFamily="var(--font-space-grotesk), 'Space Grotesk', -apple-system, sans-serif"
              fontWeight="900"
              fontSize="18"
              letterSpacing="15"
            >
              MAXX
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}

export default AinaLogo;
