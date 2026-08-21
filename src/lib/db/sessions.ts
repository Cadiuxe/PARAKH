/**
 * PARAKH — Sessions Data Access
 *
 * Server-side operations for the `sessions` table.
 * Import only in Server Actions, API routes, or server components — never in client components.
 */

import { getSupabaseAdmin, isSupabaseServerConfigured } from "./server-client";
import type { SessionRow, SessionInsert } from "./types";

/**
 * In-memory fallback session store for development or demo environments
 * when Supabase database is genuinely not configured.
 */
const inMemorySessions = new Map<string, SessionRow>();

function isValidUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

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
  const sessionId = data.id && isValidUUID(data.id) ? data.id : crypto.randomUUID();
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

  if (isSupabaseServerConfigured() && isValidUUID(data.student_id)) {
    const admin = getSupabaseAdmin();
    const { data: inserted, error } = await admin
      .from("sessions")
      .insert({
        ...newSession,
      })
      .select()
      .single();

    if (error) {
      console.error("[createSession] Supabase database error:", error.message);
      throw new Error(`Failed to create assessment session: ${error.message}`);
    }

    return inserted as SessionRow;
  }

  // Explicit demo mode
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
  if (isSupabaseServerConfigured() && isValidUUID(studentId)) {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("sessions")
      .select("*")
      .eq("student_id", studentId)
      .eq("status", "in_progress")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[getActiveSession] Supabase database error:", error.message);
      throw new Error(`Failed to fetch active session: ${error.message}`);
    }

    return (data as SessionRow) || null;
  }

  // Fallback / Demo mode / Non-UUID student ID
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
  // Check in-memory first — in-memory sessions have real UUIDs but no Supabase row
  const inMemory = inMemorySessions.get(sessionId);
  if (inMemory) {
    const updated = { ...inMemory, ...patch };
    inMemorySessions.set(sessionId, updated);
    return updated;
  }

  if (isSupabaseServerConfigured() && isValidUUID(sessionId)) {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("sessions")
      .update(patch)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("[updateSession] Supabase database error:", error.message);
      throw new Error(`Failed to update session: ${error.message}`);
    }

    return (data as SessionRow) || null;
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
  // Check in-memory first — demo sessions have real UUIDs but no Supabase row
  const inMemory = inMemorySessions.get(sessionId);
  if (inMemory) {
    if (studentId && inMemory.student_id !== studentId) return null;
    return inMemory;
  }

  if (
    isSupabaseServerConfigured() &&
    isValidUUID(sessionId) &&
    (!studentId || isValidUUID(studentId))
  ) {
    const admin = getSupabaseAdmin();
    let query = admin.from("sessions").select("*").eq("id", sessionId);

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("[getSessionById] Supabase database error:", error.message);
      throw new Error(`Failed to fetch session by id: ${error.message}`);
    }

    return (data as SessionRow) || null;
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
  if (isSupabaseServerConfigured() && isValidUUID(studentId)) {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("sessions")
      .select("*")
      .eq("student_id", studentId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getStudentSessions] Supabase database error:", error.message);
      throw new Error(`Failed to fetch student sessions: ${error.message}`);
    }

    return (data as SessionRow[]) || [];
  }

  // Explicit demo mode
  const results: SessionRow[] = [];
  for (const session of inMemorySessions.values()) {
    if (session.student_id === studentId && session.status === "completed") {
      results.push(session);
    }
  }
  return results.slice(0, limit);
}
