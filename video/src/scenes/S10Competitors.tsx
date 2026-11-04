import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, Headline, Kicker, ParticleField, useEnter, useExitFade } from "../components/fx";

type Cell = "yes" | "no" | "partial";
const ROWS: { label: string; daraz: Cell; shajgoj: Cell; global: Cell; aina: Cell }[] = [
  { label: "AI-personalised 30-day roadmap", daraz: "no", shajgoj: "no", global: "partial", aina: "yes" },
  { label: "Ingredient-conflict safety checks", daraz: "no", shajgoj: "no", global: "partial", aina: "yes" },
  { label: "Bangla + English AI coach", daraz: "no", shajgoj: "no", global: "no", aina: "yes" },
  { label: "Climate-aware (monsoon / humidity)", daraz: "no", shajgoj: "partial", global: "no", aina: "yes" },
  { label: "3D lookbook & digital wardrobe", daraz: "no", shajgoj: "no", global: "no", aina: "yes" },
  { label: "Local size-fit (Aarong, Sailor, F-commerce)", daraz: "partial", shajgoj: "no", global: "no", aina: "yes" },
  { label: "Authentic products, BDT pricing", daraz: "partial", shajgoj: "yes", global: "no", aina: "yes" },
];

const Mark: React.FC<{ v: Cell; highlight?: boolean }> = ({ v, highlight }) => {
  if (v === "yes")
    return (
      <span
        style={{
          display: "inline-flex",
          width: 38,
          height: 38,
          borderRadius: 99,
          alignItems: "center",
          justifyContent: "center",
          background: highlight ? C.rose : "rgba(52,211,153,0.16)",
          color: highlight ? "#fff" : C.green,
          fontSize: 21,
          fontWeight: 900,
          boxShadow: highlight ? "0 0 22px rgba(255,45,149,0.5)" : undefined,
        }}
      >
        ✓
      </span>
    );
  if (v === "partial") return <span style={{ color: C.amber, fontSize: 24, fontWeight: 800 }}>◐</span>;
  return <span style={{ color: "#52525B", fontSize: 22, fontWeight: 800 }}>✕</span>;
};

export const Competitors: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);
  const verdict = useEnter(292);

  const colW = [560, 250, 250, 300, 300];
  const headers = ["Capability", "Daraz", "Shajgoj", "Global AI apps", "AinA MAXX"];

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground roseX="8%" cerX="88%" />
      <ParticleField count={36} opacity={0.25} />
      <div style={{ position: "absolute", top: 84, left: 120, right: 120 }}>
        <Kicker>Competitor analysis</Kicker>
        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Headline size={60}>
            Everyone sells products.
            <br />
            <span style={{ color: C.rose }}>Nobody guides the person.</span>
          </Headline>
        </div>
      </div>

      <div style={{ position: "absolute", top: 330, left: "50%", transform: "translateX(-50%)", width: 1660 }}>
        {/* header */}
        <div style={{ display: "flex", marginBottom: 10 }}>
          {headers.map((h, i) => (
            <div
              key={h}
              style={{
                width: colW[i],
                textAlign: i === 0 ? "left" : "center",
                padding: "14px 18px",
                fontFamily: FONT_DISPLAY,
                fontSize: i === 4 ? 25 : 21,
                fontWeight: 800,
                letterSpacing: 1,
                color: i === 4 ? "#fff" : C.muted,
                background: i === 4 ? `linear-gradient(120deg, ${C.rose}, #C2187A)` : "transparent",
                borderRadius: i === 4 ? "16px 16px 0 0" : 0,
                boxShadow: i === 4 ? "0 -6px 34px rgba(255,45,149,0.3)" : undefined,
              }}
            >
              {h.toUpperCase()}
            </div>
          ))}
        </div>
        {ROWS.map((row, ri) => {
          const p = spring({ frame: frame - (52 + ri * 26), fps, config: { damping: 16, stiffness: 120 } });
          const cells: Cell[] = [row.daraz, row.shajgoj, row.global, row.aina];
          return (
            <div
              key={row.label}
              style={{
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [50, 0])}px)`,
                display: "flex",
                alignItems: "center",
                background: ri % 2 === 0 ? "rgba(26,26,29,0.85)" : "rgba(20,20,23,0.85)",
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <div style={{ width: colW[0], padding: "15px 18px", fontFamily: FONT_BODY, fontSize: 21, fontWeight: 600, color: C.white }}>{row.label}</div>
              {cells.map((v, ci) => (
                <div
                  key={ci}
                  style={{
                    width: colW[ci + 1],
                    textAlign: "center",
                    padding: "11px 0",
                    background: ci === 3 ? "rgba(255,45,149,0.07)" : "transparent",
                    borderLeft: ci === 3 ? `1px solid ${C.rose}33` : "none",
                    borderRight: ci === 3 ? `1px solid ${C.rose}33` : "none",
                  }}
                >
                  <Mark v={v} highlight={ci === 3} />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 62,
          width: "100%",
          textAlign: "center",
          opacity: verdict.opacity,
          transform: `translateY(${verdict.translateY * 0.5}px)`,
          fontFamily: FONT_DISPLAY,
          fontSize: 33,
          fontWeight: 800,
          color: C.white,
        }}
      >
        Retail sells bottles. <span style={{ color: C.ceruleanLight }}>AinA sells the outcome — safely, locally, in Bangla.</span>
      </div>
    </AbsoluteFill>
  );
};
