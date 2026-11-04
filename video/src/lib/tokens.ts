// AinA MAXX — design tokens (mirrors AGENTS.md §4, no Tailwind inside Remotion)
export const C = {
  black: "#0A0A0A",
  graphite: "#1A1A1D",
  graphite2: "#232329",
  border: "#2C2C33",
  rose: "#FF2D95",
  roseSoft: "rgba(255,45,149,0.14)",
  cerulean: "#007BA7",
  ceruleanLight: "#3FB6E0",
  ceruleanSoft: "rgba(63,182,224,0.12)",
  white: "#F5F7FA",
  muted: "#9BA3AF",
  faint: "#6B7280",
  green: "#34D399",
  amber: "#FBBF24",
  red: "#F87171",
} as const;

export const FONT_DISPLAY = "'Space Grotesk', sans-serif";
export const FONT_BODY = "'Inter', sans-serif";
export const FONT_BANGLA = "'Noto Sans Bengali', sans-serif";

// Scene timing map — 30fps, 5400 frames total (3:00)
export const FPS = 30;
export const SCENES = [
  { id: "cold-open", from: 0, duration: 360 }, // 0:00-0:12
  { id: "problem", from: 360, duration: 480 }, // 0:12-0:28
  { id: "mirror", from: 840, duration: 480 }, // 0:28-0:44
  { id: "world", from: 1320, duration: 360 }, // 0:44-0:56
  { id: "solution", from: 1680, duration: 300 }, // 0:56-1:06
  { id: "roadmap", from: 1980, duration: 420 }, // 1:06-1:20
  { id: "coded", from: 2400, duration: 420 }, // 1:20-1:34
  { id: "lookbook", from: 2820, duration: 420 }, // 1:34-1:48
  { id: "coach", from: 3240, duration: 360 }, // 1:48-2:00
  { id: "competitors", from: 3600, duration: 360 }, // 2:00-2:12
  { id: "market", from: 3960, duration: 420 }, // 2:12-2:26
  { id: "business", from: 4380, duration: 420 }, // 2:26-2:40
  { id: "risks-future", from: 4800, duration: 360 }, // 2:40-2:52
  { id: "finale", from: 5160, duration: 240 }, // 2:52-3:00
] as const;

export const TOTAL_FRAMES = 5400;
