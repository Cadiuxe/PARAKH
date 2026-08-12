/**
 * PARAKH — Sessions Data Access
 *
 * Server-side operations for the `sessions` table.
 * Import only in Server Actions or API routes — never in client components.
 *
 * Phase 5.1: Type stubs — implementations added in Phase 5.4 (DB session persistence).
 */

import type { SessionRow, SessionInsert } from "./types";

/**
 * Create a new completed session record.
 * Called server-side when an assessment finishes.
 *
 * IMPORTANT: Score, ability, and bonus values must be calculated server-side
 * before calling this function — do not trust client-supplied values directly.
 *
 * @param data - Full session data including scores computed server-side
 * @returns The created session row, or null on error
 */
export async function createSession(
  data: SessionInsert
): Promise<SessionRow | null> {
  // Implementation: Phase 5.4 (database-backed assessment completion)
  void data;
  return null;
}

/**
 * Fetch a single session by ID, scoped to a specific student.
 * Returns null if the session does not exist or does not belong to the student.
 *
 * @param sessionId - UUID of the session
 * @param studentId - UUID of the requesting student (auth.users.id)
 */
export async function getSessionById(
  sessionId: string,
  studentId: string
): Promise<SessionRow | null> {
  // Implementation: Phase 5.4
  void sessionId;
  void studentId;
  return null;
}

/**
 * Fetch all completed sessions for a student, ordered by completion time descending.
 *
 * @param studentId - UUID of the student (auth.users.id)
 * @param limit     - Max sessions to return (default 20)
 */
export async function getStudentSessions(
  studentId: string,
  limit = 20
): Promise<SessionRow[]> {
  // Implementation: Phase 5.5 (dashboard from DB)
  void studentId;
  void limit;
  return [];
}
