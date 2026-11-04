// lib/supabase/client.ts
// AinA (Ai∩A MAXX) — defensive browser Supabase client.
//
// Why this module is defensive:
// - `NEXT_PUBLIC_*` values are inlined at *build* time. A Vercel deploy that
//   builds before the env vars are set (or with them temporarily empty)
//   ships a bundle where the URL/key are empty strings — and
//   `createBrowserClient('', '')` throws `supabaseUrl is required.` at
//   module evaluation, taking down the whole client tree on first render.
// - So: never throw at module scope, never throw from `createClient()`.
//   When credentials are absent we warn once and return `null`; callers
//   treat `null` as "offline / demo mode" and keep rendering. The app's
//   data layer is Prisma-backed API routes, so a missing browser client
//   must never be fatal to the UI.
//
// Security: only the public anon key is read here. `SUPABASE_SERVICE_ROLE_KEY`
// and every other server secret must never be referenced from this file.

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let cachedClient: SupabaseClient | null = null;
let warnedMissingConfig = false;

/** True when both public Supabase credentials are present in this bundle. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Browser Supabase client, or `null` when the public credentials are
 * missing/empty (offline / mock mode). Never throws — safe to call during
 * render, effects, or event handlers on any device.
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    if (!warnedMissingConfig) {
      warnedMissingConfig = true;
      console.warn(
        "⚠️ Supabase client initialized without NEXT_PUBLIC keys. Running in offline/mock mode."
      );
    }
    return null;
  }

  if (cachedClient) return cachedClient;

  try {
    cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    // Malformed URL/key in env must degrade to offline mode, not a crash.
    console.warn("⚠️ Supabase browser client failed to initialize. Running in offline/mock mode.", error);
    cachedClient = null;
  }
  return cachedClient;
}

export default createClient;
