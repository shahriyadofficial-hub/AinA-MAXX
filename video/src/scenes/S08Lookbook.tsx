import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";
import { GlowBackground, Headline, Kicker, ModelBadge, ParticleField, seeded, useEnter, useExitFade } from "../components/fx";

const CARDS = [
  { img: "photos/street.jpg", name: "Old Dhaka Heritage Streetwear", tag: "Everyday", price: "৳4,850", base: -14 },
  { img: "photos/smart.jpg", name: "Gulshan Smart Casual Friday", tag: "Work", price: "৳6,200", base: 0 },
  { img: "photos/mono.jpg", name: "Jet Black Monochrome", tag: "Evening", price: "৳3,940", base: 14 },
];

export const FeatureLookbook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = useExitFade(durationInFrames);

  const cutout = useEnter(252);
  const ghostP = interpolate(frame, [0, 420], [0, -36]);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GlowBackground roseX="14%" cerX="86%" />
      <ParticleField count={50} opacity={0.32} />

      {/* ghost typography */}
      <div
        style={{
          position: "absolute",
          top: 150,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT_DISPLAY,
          fontSize: 215,
          fontWeight: 800,
          letterSpacing: 4,
          color: "transparent",
          WebkitTextStroke: "2px rgba(255,255,255,0.07)",
          transform: `translateX(${ghostP}px)`,
          whiteSpace: "nowrap",
        }}
      >
        PRIME YOU · WEAR IT LOUD
      </div>

      <div style={{ position: "absolute", top: 96, left: 120, right: 120, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Kicker>Feature 03 — 3D Lookbook &amp; wardrobe</Kicker>
          <div style={{ marginTop: 16 }}>
            <Headline size={64}>
              Fashion you can <span style={{ color: C.rose }}>walk around.</span>
            </Headline>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", marginTop: 8 }}>
          <ModelBadge delay={130}>sam-3.1 · garment cutout</ModelBadge>
          <ModelBadge delay={144} tone="rose">
            Three.js · interactive 3D
          </ModelBadge>
        </div>
      </div>

      {/* 3D card stage */}
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 44, perspective: 1500 }}>
        {CARDS.map((card, i) => {
          const p = spring({ frame: frame - (40 + i * 18), fps, config: { damping: 15, stiffness: 75 } });
          const sway = Math.sin(frame * 0.022 + i * 1.7) * 5;
          const rotateY = card.base + sway + interpolate(p, [0, 1], [38, 0]);
          return (
            <div
              key={card.name}
              style={{
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [110, 0]) + Math.sin(frame * 0.03 + i * 2) * 7}px) rotateY(${rotateY}deg)`,
                transformStyle: "preserve-3d",
                width: 400,
                borderRadius: 28,
                overflow: "hidden",
                background: C.graphite,
                border: `1.5px solid ${C.border}`,
                boxShadow: "0 44px 80px rgba(0,0,0,0.6)",
              }}
            >
              <div style={{ height: 400, position: "relative" }}>
                <Img src={staticFile(card.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    padding: "7px 15px",
                    borderRadius: 99,
                    background: "rgba(10,10,10,0.7)",
                    border: `1px solid ${C.rose}55`,
                    fontFamily: FONT_DISPLAY,
                    fontSize: 15,
                    fontWeight: 700,
                    color: C.rose,
                  }}
                >
                  • {card.tag} Fit
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    padding: "7px 15px",
                    borderRadius: 99,
                    background: "rgba(10,10,10,0.7)",
                    fontFamily: FONT_DISPLAY,
                    fontSize: 16,
                    fontWeight: 800,
                    color: C.white,
                  }}
                >
                  {card.price}
                </div>
              </div>
              <div style={{ padding: "20px 24px 24px" }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22.5, fontWeight: 800, color: C.white, lineHeight: 1.2 }}>{card.name}</div>
                <div style={{ marginTop: 7, fontFamily: FONT_BODY, fontSize: 16.5, color: C.faint }}>Shoppable look · tap a hotspot to buy the piece</div>
              </div>
              {/* floor reflection */}
              <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${C.ceruleanLight}44, transparent)` }} />
            </div>
          );
        })}
      </div>

      {/* SAM cutout demo */}
      <div
        style={{
          position: "absolute",
          bottom: 66,
          left: "50%",
          transform: `translateX(-50%) translateY(${cutout.translateY * 0.5}px)`,
          opacity: cutout.opacity,
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "18px 28px",
          borderRadius: 22,
          background: "rgba(26,26,29,0.94)",
          border: `1.5px solid ${C.cerulean}55`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ position: "relative", width: 74, height: 74, borderRadius: 16, overflow: "hidden", flexShrink: 0 }}>
          <Img src={staticFile("photos/rail.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {/* dashed segmentation outline pulse */}
          <div
            style={{
              position: "absolute",
              inset: 5,
              borderRadius: 12,
              border: `2.5px dashed ${C.ceruleanLight}`,
              opacity: 0.65 + 0.35 * Math.sin(frame * 0.15),
            }}
          />
        </div>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 800, color: C.white }}>
            Upload any item → <span style={{ color: C.ceruleanLight }}>SAM 3.1</span> cuts it out in seconds
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: C.muted, marginTop: 3 }}>
            Your real wardrobe, digitised — with Bangladesh brand size-fit (Aarong 42 · Sailor L · F-commerce XL).
            <span style={{ color: C.faint }}> {seeded(3) > 0 ? "01 / 04 looks" : ""}</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
