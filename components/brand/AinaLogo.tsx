import React from "react";

interface AinaLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
}

export function AinaLogo({
  className = "",
  size = "md",
  showSubtitle = true,
}: AinaLogoProps) {
  const sizeMap = {
    sm: { width: 120, height: 42, fontSize: 32, subSize: 10, subLetterSpacing: 10 },
    md: { width: 160, height: 56, fontSize: 44, subSize: 13, subLetterSpacing: 14 },
    lg: { width: 220, height: 78, fontSize: 60, subSize: 18, subLetterSpacing: 18 },
    xl: { width: 300, height: 105, fontSize: 80, subSize: 24, subLetterSpacing: 24 },
  };

  const { width, height } = sizeMap[size];

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 110"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Ai∩A MAXX"
        role="img"
        className="w-auto h-auto max-w-full"
      >
        <g>
          {/* Main Logo Text: Ai∩A */}
          <text
            x="160"
            y="65"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="var(--font-space-grotesk), 'Space Grotesk', -apple-system, sans-serif"
            fontWeight="800"
            fontSize="68"
            letterSpacing="-2"
          >
            A<tspan fill="#FFFFFF">i</tspan><tspan fill="#FFFFFF">∩</tspan>A
          </text>

          {/* Glowing Neon Rose Dot on the 'i' */}
          <circle
            cx="146.5"
            cy="21.5"
            r="6.5"
            fill="#FF2D95"
            filter="drop-shadow(0 0 6px rgba(255, 45, 149, 0.8))"
          />

          {/* Subtitle: M A X X */}
          {showSubtitle && (
            <text
              x="162"
              y="98"
              textAnchor="middle"
              fill="#FF2D95"
              fontFamily="var(--font-space-grotesk), 'Space Grotesk', -apple-system, sans-serif"
              fontWeight="900"
              fontSize="18"
              letterSpacing="14"
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
