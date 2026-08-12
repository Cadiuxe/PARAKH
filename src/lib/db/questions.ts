/**
 * PARAKH — Questions Data Access
 *
 * Server-side operations for the `questions` table.
 * Import only in Server Actions or API routes — never in client components.
 *
 * SECURITY NOTE: This layer is the only place that reads correct_option_index.
 * The adaptive engine receives full QuestionRow objects server-side.
 * Client components receive only QuestionSafeRow (no answer key).
 *
 * Phase 5.1: Type stubs — implementations added in Phase 5.3 (DB question pool).
 */

import type { QuestionRow, QuestionSafeRow } from "./types";

/**
 * Fetch all approved, active questions for the adaptive engine.
 * Optionally filter by topic code (e.g., 'DSA', 'DBMS').
 *
 * Called server-side before a session starts.
 * Returns full QuestionRow including correct_option_index.
 * This result is NEVER sent to the browser — only passed to adaptive-engine.ts.
 *
 * @param topicCode - Optional topic filter. If omitted or 'Mixed', returns all.
 */
export async function fetchApprovedQuestions(
  topicCode?: string
): Promise<QuestionRow[]> {
  // Implementation: Phase 5.3 (adaptive engine uses DB questions)
  void topicCode;
  return [];
}

/**
 * Fetch a single question's safe (client-side) representation.
 * Does NOT include correct_option_index or explanation.
 *
 * @param questionId - UUID of the question
 */
export async function fetchQuestionSafe(
  questionId: string
): Promise<QuestionSafeRow | null> {
  // Implementation: Phase 5.3
  void questionId;
  return null;
}
