import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

// Load brand fonts (Space Grotesk / Inter / Noto Sans Bengali) before first frame.
// delayRender keeps rendering deterministic — frames wait for fonts.
const { loadFont: loadSpace } = require("@remotion/google-fonts/SpaceGrotesk");
const { loadFont: loadInter } = require("@remotion/google-fonts/Inter");
const { loadFont: loadBangla } = require("@remotion/google-fonts/NotoSansBengali");

Promise.all([loadSpace(), loadInter(), loadBangla()]).catch(() => {
  // Font CDN unreachable — fall back to system fonts rather than failing the render.
});

registerRoot(RemotionRoot);
