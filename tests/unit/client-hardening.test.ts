// tests/unit/client-hardening.test.ts
// Regression contracts for the Vercel "Ready but crashes on load" fix:
//  1. Supabase browser client never throws when NEXT_PUBLIC keys are absent.
//  2. WebGL capability probes answer `false` (never throw) outside a browser.
//  3. Route-level 3D isolation: WebGL/gesture surfaces are only reachable
//     behind next/dynamic ssr:false, and root error boundaries exist.

import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

describe("Defensive Supabase browser client (lib/supabase/client)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns null (offline/mock mode) instead of throwing when keys are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.resetModules();
    const mod = await import("@/lib/supabase/client");
    expect(mod.isSupabaseConfigured()).toBe(false);
    expect(() => mod.createClient()).not.toThrow();
    expect(mod.createClient()).toBeNull();
  });

  it("never reads server-only secrets from env (code, not comments)", () => {
    const src = read("lib/supabase/client.ts");
    expect(src).not.toContain("process.env.SUPABASE_SERVICE_ROLE_KEY");
    expect(src).not.toContain("process.env.MODEL_API_KEY");
    expect(src).not.toContain("process.env.GEMINI_API_KEY");
    // Only the two public, client-safe keys may be read.
    expect(src).toContain("process.env.NEXT_PUBLIC_SUPABASE_URL");
    expect(src).toContain("process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });

  it("server client also degrades to null without env (no throw)", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.resetModules();
    const mod = await import("@/lib/supabase/server");
    await expect(mod.createClient()).resolves.toBeNull();
    expect(mod.createAdminClient()).toBeNull();
  });
});

describe("WebGL capability probes (lib/browser/webgl)", () => {
  it("answer false — never throw — outside a browser (SSR/test env)", async () => {
    const { isBrowser, supportsWebGL, prefersReducedMotion, canRender3D } = await import(
      "@/lib/browser/webgl"
    );
    expect(isBrowser()).toBe(false);
    expect(() => supportsWebGL()).not.toThrow();
    expect(supportsWebGL()).toBe(false);
    expect(prefersReducedMotion()).toBe(false);
    expect(canRender3D()).toBe(false);
  });
});

describe("3D / WebGL route isolation", () => {
  it("drip + wardrobe render the hub only through the client-only loader", () => {
    for (const page of ["app/(dashboard)/drip/page.tsx", "app/wardrobe/page.tsx"]) {
      const src = read(page);
      expect(src, page).toContain("FashionHubLoader");
      // No static import of the WebGL hub (or three) in the server page.
      expect(src, page).not.toMatch(/import\s+\{\s*FashionHub\s*\}\s+from/);
      expect(src, page).not.toContain("@react-three/fiber");
      expect(src, page).not.toContain("from \"three\"");
      // Pages stay Server Components (metadata) — no "use client".
      expect(src, page).not.toContain('"use client"');
    }
    // The ssr:false boundary itself lives in the Client Component loader
    // (Next.js forbids ssr:false directly in Server Components).
    const loader = read("components/fashion/FashionHubLoader.tsx");
    expect(loader).toContain('"use client"');
    expect(loader).toContain("next/dynamic");
    expect(loader).toContain("ssr: false");
    expect(loader).toContain("LOADING 3D STUDIO...");
  });

  it("orzr renders the gesture experience only through the client-only loader", () => {
    const src = read("app/orzr/page.tsx");
    expect(src).toContain("OrzrExperienceLoader");
    expect(src).not.toMatch(/import\s+\{\s*OrzrExperience\s*\}\s+from/);
    expect(src).not.toContain('"use client"');
    const loader = read("components/fashion/OrzrExperienceLoader.tsx");
    expect(loader).toContain('"use client"');
    expect(loader).toContain("ssr: false");
  });

  it("FashionHub keeps both R3F experiences behind ssr:false dynamics", () => {
    const src = read("components/fashion/FashionHub.tsx");
    expect(src).toContain("Interactive3DLookbook");
    expect(src).toContain("RailHangerCarousel");
    expect(src.match(/ssr:\s*false/g)?.length).toBeGreaterThanOrEqual(2);
    expect(src).not.toContain("@react-three/fiber");
  });

  it("3D canvases only mount after a guarded client probe (no optimistic WebGL)", () => {
    const lookbook = read("components/fashion/Interactive3DLookbook.tsx");
    expect(lookbook).toContain("useState<boolean | null>(null)");
    expect(lookbook).toContain("canRender3D()");
    expect(lookbook).toContain("hasWebGL === null");
    expect(lookbook).toContain("WebGLBoundary");
    expect(lookbook).not.toContain("useState(true)");

    const rail = read("components/fashion/RailHangerCarousel.tsx");
    expect(rail).toContain("canRender3D()");
    expect(rail).toContain("WebGLBoundary");
  });

  it("GarmentScene3D reports canvas context loss instead of dying black", () => {
    const src = read("components/fashion/GarmentScene3D.tsx");
    expect(src).toContain("onCanvasError");
    expect(src).toContain("webglcontextlost");
  });
});

describe("Root error boundaries", () => {
  it("app/error.tsx and app/global-error.tsx exist with reset affordances", () => {
    expect(existsSync(path.join(root, "app/error.tsx"))).toBe(true);
    expect(existsSync(path.join(root, "app/global-error.tsx"))).toBe(true);
    expect(read("app/error.tsx")).toContain("reset");
    const globalErr = read("app/global-error.tsx");
    expect(globalErr).toContain("<html");
    expect(globalErr).toContain("reset");
    // Brand tokens survive even when the app shell (and Tailwind) is gone.
    expect(globalErr).toContain("#0A0A0A");
    expect(globalErr).toContain("#FF2D95");
  });

  it("root layout wraps the shell in the reusable ErrorBoundary", () => {
    const src = read("app/layout.tsx");
    expect(src).toContain("ErrorBoundary");
    expect(src).toContain('label="App shell"');
  });

  it("ErrorBoundary component is a client class boundary with retry", () => {
    const src = read("components/system/ErrorBoundary.tsx");
    expect(src).toContain('"use client"');
    expect(src).toContain("getDerivedStateFromError");
    expect(src).toContain("componentDidCatch");
    expect(src).toContain("WebGLBoundary");
  });
});

describe("Guarded browser APIs", () => {
  it("sizing persistence never touches localStorage/WebCrypto unguarded", () => {
    const src = read("lib/engine/bangladeshSizing.ts");
    expect(src).toContain('typeof window === "undefined"');
    expect(src).toContain("getLocalStorage()");
    expect(src).toContain("getSubtleCrypto()");
    // No bare localStorage.* calls outside the guarded accessor.
    const bare = src
      .split("\n")
      .filter((line) => /(^|[^.\w])localStorage\./.test(line) && !line.includes("return localStorage"));
    expect(bare).toEqual([]);
  });

  it("layout metadataBase cannot throw on a malformed NEXT_PUBLIC_APP_URL", () => {
    const src = read("app/layout.tsx");
    expect(src).toContain("try {");
    expect(src).toContain('new URL("http://localhost:3000")');
  });
});
