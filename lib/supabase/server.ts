// lib/supabase/server.ts
// AinA (Ai∩A MAXX) — defensive server Supabase client (Route Handlers /
// Server Components only; never import from a Client Component).
//
// Mirrors the browser client's contract: missing or malformed public
// credentials resolve to `null` (offline / demo mode) instead of throwing
// `supabaseUrl is required.` inside a request handler. The service-role
// client is a separate, explicit opt-in so the privileged key can never
// leak into a code path that also runs with the anon key.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Cookie-aware server client bound to the current request, or `null` when
 * Supabase is not configured. Never throws for missing env.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ Supabase server client skipped: NEXT_PUBLIC keys missing. Offline/mock mode.");
    return null;
  }

  try {
    const cookieStore = await cookies();
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — cookie writes are handled by
            // middleware/route handlers; ignoring is the documented pattern.
          }
        },
      },
    });
  } catch (error) {
    console.warn("⚠️ Supabase server client failed to initialize. Offline/mock mode.", error);
    return null;
  }
}

/**
 * Privileged service-role client for trusted server jobs only (private
 * bucket signed URLs, admin writes). Returns `null` when unconfigured.
 * `SUPABASE_SERVICE_ROLE_KEY` is server-only — never expose to the client.
 */
export function createAdminClient(): SupabaseClient | null {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn("⚠️ Supabase admin client skipped: URL or service-role key missing.");
    return null;
  }
  try {
    return createServiceClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch (error) {
    console.warn("⚠️ Supabase admin client failed to initialize.", error);
    return null;
  }
}

export default createClient;
