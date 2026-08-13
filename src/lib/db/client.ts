/**
 * PARAKH — Supabase Browser Client
 *
 * Uses @supabase/ssr createBrowserClient for browser component authentication and session persistence.
 * Uses the public anon key — safe for browser bundles.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let _client: SupabaseClient<Database> | null = null;

/**
 * Returns the Supabase browser client (singleton).
 * Throws at call-time if environment variables are not configured.
 * The build succeeds even without .env.local — the error only surfaces at runtime.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[PARAKH] Supabase is not configured.\n" +
        "Copy .env.local.example to .env.local and fill in:\n" +
        "  NEXT_PUBLIC_SUPABASE_URL\n" +
        "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  _client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return _client;
}
