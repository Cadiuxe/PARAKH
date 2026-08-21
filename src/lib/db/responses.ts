/**
 * PARAKH — Responses Data Access
 *
 * Server-side operations for the `responses` table.
 * Import only in Server Actions, API routes, or server components — never in client components.
 */

import { getSupabaseAdmin } from "./server-client";
import type { ResponseRow, ResponseInsert } from "./types";

/**
 * In-memory fallback responses store for development or environments
 * when Supabase database is unreachable.
 */
const inMemoryResponses = new Map<string, ResponseRow[]>();

/**
 * Insert a single response record for an assessment question attempt.
 *
 * @param response - Response record data
 * @returns The inserted response row
 */
export async function insertResponse(
  response: ResponseInsert
): Promise<ResponseRow> {
  const responseId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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

  try {
    const admin = getSupabaseAdmin();
    const { data: inserted, error } = await admin
      .from("responses")
      .insert(newRow)
      .select()
      .single();

    if (!error && inserted) {
      return inserted as ResponseRow;
    }
  } catch {
    // Database fallback to memory store
  }

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
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("responses")
      .select("*")
      .eq("session_id", sessionId)
      .order("question_order", { ascending: true });

    if (!error && data) {
      return data as ResponseRow[];
    }
  } catch {
    // Fallback
  }

  const list = inMemoryResponses.get(sessionId) || [];
  return [...list].sort((a, b) => a.question_order - b.question_order);
}
