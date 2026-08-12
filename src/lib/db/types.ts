/**
 * PARAKH — Supabase Database Type Definitions
 *
 * These types mirror the PostgreSQL schema exactly.
 * Generated manually to match the migration in:
 *   supabase/migrations/20240101000000_parakh_foundation.sql
 *
 * In a future phase these can be auto-generated via:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/db/types.ts
 *
 * Do not add business logic here — only database types.
 */

// ─── Row types (what the DB returns) ─────────────────────────────────────────

export interface ProfileRow {
  id: string; // uuid — same as auth.users.id
  full_name: string;
  roll_number: string | null;
  institution: string | null;
  role: "student" | "admin";
  created_at: string; // ISO timestamptz
  updated_at: string;
}

export interface TopicRow {
  id: string; // uuid
  code: string; // 'DSA' | 'DBMS' | 'OS' | 'CN'
  name: string;
  parent_id: string | null;
  display_order: number;
  created_at: string;
}

export interface QuestionRow {
  id: string; // uuid
  topic_id: string;
  subtopic: string;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  difficulty_label: string;
  question_text: string;
  options: string[]; // jsonb — array of 4 strings
  correct_option_index: 0 | 1 | 2 | 3;
  explanation: string | null;
  source: "question_bank" | "ai_generated";
  review_status: "approved" | "pending" | "rejected";
  is_active: boolean;
  times_used: number;
  correct_count: number;
  incorrect_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Safe question fields that can be sent to the client.
 * Does NOT include correct_option_index or explanation.
 * Use this type when serving questions to students.
 */
export interface QuestionSafeRow {
  id: string;
  topic_id: string;
  subtopic: string;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  difficulty_label: string;
  question_text: string;
  options: string[];
}

export interface SessionRow {
  id: string; // uuid
  student_id: string;
  topic_filter: "Mixed" | "DSA" | "DBMS" | "OS" | "CN";
  requested_count: number;
  actual_count: number;
  correct_count: number;
  percentage_score: number;
  total_score: number;
  total_bonus: number;
  ability_start: number;
  ability_final: number;
  ability_delta: number;
  status: "completed" | "abandoned";
  started_at: string;
  completed_at: string | null;
}

export interface ResponseRow {
  id: string; // uuid
  session_id: string;
  question_id: string;
  question_order: number;
  topic_code: string; // denormalized at time of attempt
  difficulty_level: number; // denormalized at time of attempt
  selected_option_index: number; // -1 = timeout, 0–3 = selected
  is_correct: boolean;
  time_remaining_sec: number;
  time_taken_sec: number;
  ability_before: number;
  ability_after: number;
  base_score: number;
  speed_bonus: number;
  total_score: number;
  answered_at: string;
}

export interface AbilityEstimateRow {
  id: string; // uuid
  student_id: string; // uuid -> profiles.id
  topic_id: string; // uuid -> topics.id
  ability: number; // numeric(6,2)
  total_questions: number; // integer
  correct_count: number; // integer
  updated_at: string; // ISO timestamptz
}

// ─── Insert types (what we send to the DB) ───────────────────────────────────

/**
 * Used only by the database trigger (handle_new_user).
 * Role is NOT included — the trigger always sets it to 'student'.
 * Never construct this manually in application code.
 */
export type ProfileInsert = Pick<ProfileRow, "id" | "full_name"> &
  Partial<Pick<ProfileRow, "roll_number" | "institution">>;

/**
 * SERVER-ONLY: Used exclusively in Server Actions via the service_role client.
 * Never construct or send this from a browser component.
 *
 * Sensitive fields (correct_count, percentage_score, total_score, total_bonus,
 * ability_start, ability_final, ability_delta) are computed server-side.
 * Students must never supply these values directly.
 */
export type SessionInsert = Omit<SessionRow, "id">;

/**
 * SERVER-ONLY: Used exclusively in Server Actions via the service_role client.
 * Never construct or send this from a browser component.
 *
 * Sensitive fields (is_correct, ability_before, ability_after, base_score,
 * speed_bonus, total_score) are computed server-side by the adaptive engine.
 * Students must never supply these values directly.
 */
export type ResponseInsert = Omit<ResponseRow, "id" | "answered_at">;

export type AbilityEstimateInsert = Omit<
  AbilityEstimateRow,
  "id" | "updated_at"
> &
  Partial<Pick<AbilityEstimateRow, "total_questions" | "correct_count">>;

// ─── Update types (partial patches) ──────────────────────────────────────────

/**
 * Student-allowed profile updates.
 * role, id, created_at, updated_at are intentionally excluded.
 * Use this type in any code path that handles student-initiated updates.
 * Enforced at DB level by the RLS WITH CHECK subquery on profiles.
 */
export type ProfileStudentUpdate = Partial<
  Pick<ProfileRow, "full_name" | "roll_number" | "institution">
>;

/**
 * Admin-only profile updates (server-side, service_role only).
 * Includes role — may only be used in trusted server-side migrations or
 * admin Server Actions. Never call this from a client component.
 */
export type ProfileAdminUpdate = Partial<ProfileRow>;

export type AbilityEstimateUpdate = Partial<
  Omit<AbilityEstimateRow, "id" | "student_id" | "topic_id">
>;

// ─── Database interface (for createClient<Database>) ─────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        // Default Update type is student-safe (excludes role, id, created_at, updated_at).
        // For admin role changes use ProfileAdminUpdate with the service_role client.
        Update: ProfileStudentUpdate;
      };
      topics: {
        Row: TopicRow;
        Insert: Omit<TopicRow, "id" | "created_at">;
        Update: Partial<TopicRow>;
      };
      questions: {
        Row: QuestionRow;
        Insert: Omit<QuestionRow, "id" | "created_at" | "updated_at"> &
          Partial<
            Pick<QuestionRow, "times_used" | "correct_count" | "incorrect_count">
          >;
        Update: Partial<QuestionRow>;
      };
      sessions: {
        Row: SessionRow;
        Insert: SessionInsert;
        Update: Partial<SessionRow>;
      };
      responses: {
        Row: ResponseRow;
        Insert: ResponseInsert;
        Update: Partial<ResponseRow>;
      };
      ability_estimates: {
        Row: AbilityEstimateRow;
        Insert: AbilityEstimateInsert;
        Update: AbilityEstimateUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: {
        Args: { user_id: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}
