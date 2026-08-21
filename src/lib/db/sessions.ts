/**
 * PARAKH — Sessions Data Access
 *
 * Server-side operations for the `sessions` table.
 * Import only in Server Actions, API routes, or server components — never in client components.
 */

import { getSupabaseAdmin } from "./server-client";
import type { SessionRow, SessionInsert } from "./types";

/**
 * In-memory fallback session store for development or environments
 * when Supabase database is unreachable.
 */
const inMemorySessions = new Map<string, SessionRow>();

/**
 * Create a new session record in the database.
 * Default status is 'in_progress'.
 *
 * @param data - Initial session configuration
 * @returns The created session row
 */
export async function createSession(
  data: SessionInsert
): Promise<SessionRow> {
  const sessionId = data.id || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const newSession: SessionRow = {
    id: sessionId,
    student_id: data.student_id,
    topic_filter: data.topic_filter,
    requested_count: data.requested_count,
    actual_count: data.actual_count ?? 0,
    correct_count: data.correct_count ?? 0,
    percentage_score: data.percentage_score ?? 0,
    total_score: data.total_score ?? 0,
    total_bonus: data.total_bonus ?? 0,
    ability_start: data.ability_start,
    ability_final: data.ability_final ?? data.ability_start,
    ability_delta: data.ability_delta ?? 0,
    status: data.status ?? "in_progress",
    started_at: data.started_at ?? now,
    completed_at: data.completed_at ?? null,
  };

  try {
    const admin = getSupabaseAdmin();
    const { data: inserted, error } = await admin
      .from("sessions")
      .insert({
        ...newSession,
      })
      .select()
      .single();

    if (!error && inserted) {
      return inserted as SessionRow;
    }
  } catch {
    // Database fallback to memory store
  }

  inMemorySessions.set(sessionId, newSession);
  return newSession;
}

/**
 * Fetch the active in-progress session for a student (for reconnect/refresh).
 *
 * @param studentId - UUID of the requesting student
 */
export async function getActiveSession(
  studentId: string
): Promise<SessionRow | null> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("sessions")
      .select("*")
      .eq("student_id", studentId)
      .eq("status", "in_progress")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return data as SessionRow;
    }
  } catch {
    // Fallback
  }

  // Check in-memory store
  for (const session of inMemorySessions.values()) {
    if (session.student_id === studentId && session.status === "in_progress") {
      return session;
    }
  }

  return null;
}

/**
 * Update an existing session's progress or completion details.
 *
 * @param sessionId - UUID of the session
 * @param patch - Fields to update
 */
export async function updateSession(
  sessionId: string,
  patch: Partial<SessionRow>
): Promise<SessionRow | null> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("sessions")
      .update(patch)
      .eq("id", sessionId)
      .select()
      .single();

    if (!error && data) {
      return data as SessionRow;
    }
  } catch {
    // Fallback
  }

  const existing = inMemorySessions.get(sessionId);
  if (existing) {
    const updated = { ...existing, ...patch };
    inMemorySessions.set(sessionId, updated);
    return updated;
  }

  return null;
}

/**
 * Fetch a single session by ID, scoped to a specific student.
 * Returns null if the session does not exist or does not belong to the student.
 *
 * @param sessionId - UUID of the session
 * @param studentId - Optional UUID of the requesting student (for ownership verification)
 */
export async function getSessionById(
  sessionId: string,
  studentId?: string
): Promise<SessionRow | null> {
  try {
    const admin = getSupabaseAdmin();
    let query = admin.from("sessions").select("*").eq("id", sessionId);

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error } = await query.single();

    if (!error && data) {
      return data as SessionRow;
    }
  } catch {
    // Fallback
  }

  const session = inMemorySessions.get(sessionId);
  if (session) {
    if (studentId && session.student_id !== studentId) return null;
    return session;
  }

  return null;
}

/**
 * Fetch all completed sessions for a student, ordered by completion time descending.
 *
 * @param studentId - UUID of the student
 * @param limit     - Max sessions to return (default 20)
 */
export async function getStudentSessions(
  studentId: string,
  limit = 20
): Promise<SessionRow[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("sessions")
      .select("*")
      .eq("student_id", studentId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (!error && data) {
      return data as SessionRow[];
    }
  } catch {
    // Fallback
  }

  const results: SessionRow[] = [];
  for (const session of inMemorySessions.values()) {
    if (session.student_id === studentId && session.status === "completed") {
      results.push(session);
    }
  }
  return results.slice(0, limit);
}
