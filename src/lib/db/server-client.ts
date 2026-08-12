/**
 * PARAKH — Supabase Server Client
 *
 * IMPORTANT: This file must ONLY be imported in:
 *   - Next.js Server Actions  ('use server')
 *   - Next.js API Route handlers (route.ts)
 *   - Server Components
 *
 * It must NEVER be imported in:
 *   - 'use client' components
 *   - Any file that ends up in the browser bundle
 *
 * The service-role key bypasses Row Level Security.
 * Exposing it to the browser would be a critical security vulnerability.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let _adminClient: SupabaseClient<Database> | null = null;

/**
 * Returns the server-side Supabase admin client (singleton).
 * Uses the service-role key — bypasses RLS for trusted server-side operations.
 * Throws at call-time if environment variables are not configured.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (_adminClient) return _adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "[PARAKH] Supabase server client is not configured.\n" +
        "Set in .env.local:\n" +
        "  NEXT_PUBLIC_SUPABASE_URL\n" +
        "  SUPABASE_SERVICE_ROLE_KEY\n" +
        "NEVER prefix SUPABASE_SERVICE_ROLE_KEY with NEXT_PUBLIC_."
    );
  }

  _adminClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // Server client is stateless — no session persistence
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return _adminClient;
}
