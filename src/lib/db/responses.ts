/**
 * PARAKH — Responses Data Access
 *
 * Server-side operations for the `responses` table.
 * Import only in Server Actions, API routes, or server components — never in client components.
 */

import { getSupabaseAdmin, isSupabaseServerConfigured } from "./server-client";
import type { ResponseRow, ResponseInsert } from "./types";

/**
 * In-memory fallback responses store for development or demo environments
 * when Supabase database is genuinely not configured.
 */
const inMemoryResponses = new Map<string, ResponseRow[]>();

function isValidUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Insert a single response record for an assessment question attempt.
 *
 * @param response - Response record data
 * @returns The inserted response row
 */
export async function insertResponse(
  response: ResponseInsert
): Promise<ResponseRow> {
  const responseId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newRow: ResponseRow = {
    id: responseId,
    session_id: response.session_id,
    question_id: response.question_id,
    question_order: response.question_order,
    topic_code: response.topic_code,
    difficulty_level: response.difficulty_level,
    difficulty_score: response.difficulty_score ?? null,
    selected_option_index: response.selected_option_index,
    is_correct: response.is_correct,
    time_remaining_sec: response.time_remaining_sec,
    time_taken_sec: response.time_taken_sec,
    ability_before: response.ability_before,
    ability_after: response.ability_after,
    base_score: response.base_score,
    speed_bonus: response.speed_bonus,
    total_score: response.total_score,
    answered_at: now,
  };

  // Check if session belongs to in-memory store
  const { getSessionById } = await import("./sessions");
  const memSession = await getSessionById(response.session_id);
  const isInMemorySession = !memSession || !isValidUUID(memSession.student_id);

  if (
    isSupabaseServerConfigured() &&
    !isInMemorySession &&
    isValidUUID(response.session_id) &&
    isValidUUID(response.question_id)
  ) {
    const admin = getSupabaseAdmin();
    const { data: inserted, error } = await admin
      .from("responses")
      .insert(newRow)
      .select()
      .single();

    if (error) {
      console.error("[insertResponse] Supabase database error:", error.message);
      throw new Error(`Failed to insert question response: ${error.message}`);
    }

    return inserted as ResponseRow;
  }

  // Explicit demo mode
  const existing = inMemoryResponses.get(response.session_id) || [];
  inMemoryResponses.set(response.session_id, [...existing, newRow]);
  return newRow;
}

/**
 * Batch-insert all response records for a completed session.
 *
 * @param responses - Array of response records
 * @returns Array of inserted response rows
 */
export async function insertResponses(
  responses: ResponseInsert[]
): Promise<ResponseRow[]> {
  const results: ResponseRow[] = [];
  for (const resp of responses) {
    const row = await insertResponse(resp);
    results.push(row);
  }
  return results;
}

/**
 * Fetch all responses for a session, ordered by question_order ascending.
 *
 * @param sessionId - UUID of the session
 * @param studentId - Optional student ID for ownership verification
 */
export async function getSessionResponses(
  sessionId: string,
  studentId?: string
): Promise<ResponseRow[]> {
  if (isSupabaseServerConfigured() && isValidUUID(sessionId)) {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("responses")
      .select("*")
      .eq("session_id", sessionId)
      .order("question_order", { ascending: true });

    if (error) {
      console.error("[getSessionResponses] Supabase database error:", error.message);
      throw new Error(`Failed to fetch session responses: ${error.message}`);
    }

    if (data && data.length > 0) {
      return data as ResponseRow[];
    }
  }

  // Explicit demo mode / in-memory session
  const list = inMemoryResponses.get(sessionId) || [];
  return [...list].sort((a, b) => a.question_order - b.question_order);
}

/**
 * Batch-fetch responses for multiple sessions in a SINGLE Supabase query.
 * Returns a Map keyed by session_id for O(1) lookup.
 *
 * Use this instead of calling getSessionResponses() in a loop.
 *
 * @param sessionIds - Array of session UUIDs
 */
export async function getResponsesForSessions(
  sessionIds: string[]
): Promise<Map<string, ResponseRow[]>> {
  const result = new Map<string, ResponseRow[]>();
  if (!sessionIds.length) return result;

  const validIds = sessionIds.filter(isValidUUID);

  if (isSupabaseServerConfigured() && validIds.length > 0) {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("responses")
      .select("*")
      .in("session_id", validIds)
      .order("question_order", { ascending: true });

    if (error) {
      console.error("[getResponsesForSessions] Supabase database error:", error.message);
      throw new Error(`Failed to batch-fetch session responses: ${error.message}`);
    }

    for (const row of data as ResponseRow[]) {
      const arr = result.get(row.session_id) || [];
      arr.push(row);
      result.set(row.session_id, arr);
    }
    return result;
  }

  // Demo mode: collect from in-memory
  for (const id of sessionIds) {
    const list = inMemoryResponses.get(id) || [];
    result.set(id, [...list].sort((a, b) => a.question_order - b.question_order));
  }
  return result;
}
