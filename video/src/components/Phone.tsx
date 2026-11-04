import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/tokens";

/** Stylized phone frame (430×880 logical) used for animated UI recreations. */
export const PhoneFrame: React.FC<{
  children: React.ReactNode;
  delay?: number;
  rotateY?: number;
  width?: number;
}> = ({ children, delay = 0, rotateY = 0, width = 430 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 17, stiffness: 70, mass: 1 } });
  const height = width * 2.02;
  return (
    <div style={{ perspective: 1600 }}>
      <div
        style={{
          width,
          height,
          opacity: p,
          transform: `translateY(${interpolate(p, [0, 1], [90, 0])}px) rotateY(${rotateY + interpolate(p, [0, 1], [-14, 0])}deg)`,
          borderRadius: 52,
          background: "#0D0D10",
          border: `2px solid ${C.border}`,
          boxShadow: "0 40px 90px rgba(0,0,0,0.65), 0 0 0 6px #050506, 0 0 70px rgba(0,123,167,0.16)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: 26,
            borderRadius: 99,
            background: "#000",
            zIndex: 30,
          }}
        />
        <div style={{ position: "absolute", inset: 0, padding: "52px 22px 22px", fontFamily: FONT_BODY }}>{children}</div>
      </div>
    </div>
  );
};

export const PhoneHeader: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 27, fontWeight: 800, color: C.white, letterSpacing: -0.5 }}>{title}</div>
    {sub && <div style={{ fontSize: 15.5, color: C.muted, marginTop: 3 }}>{sub}</div>}
  </div>
);

export const TaskRow: React.FC<{
  label: string;
  meta: string;
  delay: number;
  accent?: string;
}> = ({ label, meta, delay, accent = C.rose }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 110 } });
  const check = spring({ frame: frame - delay - 16, fps, config: { damping: 12, stiffness: 160 } });
  const done = check > 0.5;
  return (
    <div
      style={{
        opacity: enter,
        transform: `translateX(${interpolate(enter, [0, 1], [36, 0])}px)`,
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "13px 15px",
        borderRadius: 18,
        background: C.graphite,
        border: `1px solid ${C.border}`,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: done ? accent : "transparent",
          border: `2px solid ${done ? accent : C.border}`,
          transform: `scale(${0.6 + check * 0.4})`,
          color: "#fff",
          fontSize: 17,
          fontWeight: 900,
        }}
      >
        {done ? "✓" : ""}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 16.5,
            fontWeight: 600,
            color: done ? C.muted : C.white,
            textDecoration: done ? "line-through" : "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 13, color: C.faint }}>{meta}</div>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: accent, opacity: check }}>+10 XP</div>
    </div>
  );
};

export const ChatBubble: React.FC<{
  from: "user" | "ai";
  children: React.ReactNode;
  delay: number;
  width?: string;
}> = ({ from, children, delay, width = "86%" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 120 } });
  const isUser = from === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
      <div
        style={{
          opacity: p,
          transform: `translateY(${interpolate(p, [0, 1], [22, 0])}px) scale(${interpolate(p, [0, 1], [0.9, 1])})`,
          maxWidth: width,
          padding: "13px 17px",
          borderRadius: isUser ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
          background: isUser ? `linear-gradient(120deg, ${C.cerulean}, #005F7A)` : C.graphite,
          border: isUser ? "none" : `1px solid ${C.border}`,
          color: C.white,
          fontSize: 16.5,
          lineHeight: 1.45,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Typing dots shown briefly before an AI bubble lands. */
export const TypingDots: React.FC<{ delay: number; dur?: number }> = ({ delay, dur = 26 }) => {
  const frame = useCurrentFrame();
  const visible = frame >= delay && frame < delay + dur;
  if (!visible) return null;
  return (
    <div style={{ display: "flex", marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "14px 18px",
          borderRadius: "20px 20px 20px 6px",
          background: C.graphite,
          border: `1px solid ${C.border}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              background: C.ceruleanLight,
              opacity: 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.35 - i * 0.7)),
              transform: `translateY(${Math.sin(frame * 0.35 - i * 0.7) * -3}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
