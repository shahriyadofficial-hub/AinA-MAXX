// lib/browser/webgl.ts
// AinA (Ai∩A MAXX) — client-only capability probes.
//
// Every function here is SSR-safe: on the server (or in any non-DOM test
// environment) it returns the "unsupported" answer instead of touching
// `window`/`document`. WebGL contexts are probed on a throwaway canvas and
// released immediately, so probing never leaks GPU contexts (browsers cap
// live contexts at ~8–16 per page).

/** True only in a real browser environment. */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Probes for a usable WebGL2/WebGL1 context. Returns `false` — never throws —
 * when WebGL is unavailable, blocklisted, or context creation fails (the
 * exact failure mode that crashes an unguarded React Three Fiber `<Canvas>`
 * mount on low-end / GPU-blocklisted devices).
 */
export function supportsWebGL(): boolean {
  if (!isBrowser()) return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGLRenderingContext | null) ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return false;
    // Release the probe context so we don't count against the browser cap.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** True when the user asked the OS/browser to minimize motion. Never throws. */
export function prefersReducedMotion(): boolean {
  if (!isBrowser() || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * The single gate every 3D surface must pass before mounting a `<Canvas>`:
 * real WebGL support AND no reduced-motion preference.
 */
export function canRender3D(): boolean {
  return supportsWebGL() && !prefersReducedMotion();
}
