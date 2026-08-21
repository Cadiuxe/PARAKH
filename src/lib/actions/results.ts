"use server";

/**
 * PARAKH — Database-Backed Results Server Actions
 * Phase 5.5: Database-backed Student Results
 *
 * Provides server-authoritative result data for completed assessment sessions.
 *
 * Security guarantees:
 * - Student identity authenticated from SSR cookies (never trusted from client).
 * - Session ownership enforced: student can only access their own sessions.
 * - Full question details (correct answer, explanation) are included ONLY for
 *   completed sessions, fetched entirely server-side.
 * - In-progress or abandoned sessions return appropriate errors.
 */

import { getAuthenticatedStudent } from "./assessment";
import { getStudentSessions, getSessionById } from "@/lib/db/sessions";
import { getSessionResponses } from "@/lib/db/responses";
import { fetchQuestionById } from "@/lib/db/questions";
import { getAbilityLevelLabel } from "@/lib/assessment-storage";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ResultQuestionItem {
  /** Sequential index (1-based) in this session. */
  questionNumber: number;
  questionId: string;
  questionText: string;
  options: string[];
  topic: string;
  topicCode: string;
  subtopic: string;
  difficultyLevel: number;
  difficultyLabel: string;
  /** Index the student selected (-1 = timed out / not answered). */
  selectedOptionIndex: number;
  /** Index of the correct answer — revealed only in completed results view. */
  correctOptionIndex: number;
  /** Explanation — revealed only in completed results view. */
  explanation: string;
  isCorrect: boolean;
  timeTakenSec: number;
  timeRemainingSec: number;
  abilityBefore: number;
  abilityAfter: number;
  baseScore: number;
  speedBonus: number;
  totalScore: number;
}

export interface ResultTopicSummary {
  id: string;
  name: string;
  code: string;
  color: string;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
  proficiency: number;
  status: "Not Assessed" | "Needs Work" | "Developing" | "Strong";
  assessed: boolean;
}

export interface SessionHistoryItem {
  id: string;
  topic: string;
  completedAt: string;
  formattedDate: string;
  questionCount: number;
  correctCount: number;
  percentageScore: number;
  abilityFinal: number;
}

export type ResultError =
  | "unauthenticated"
  | "not_found"
  | "not_yours"
  | "not_completed"
  | "no_sessions";

export interface SessionResultData {
  ok: true;
  sessionId: string;
  topic: string;
  completedAt: string;
  formattedDate: string;
  questionCount: number;
  correctCount: number;
  percentageScore: number;
  totalScore: number;
  totalBonus: number;
  abilityStart: number;
  abilityFinal: number;
  abilityDelta: number;
  abilityLabel: string;
  questions: ResultQuestionItem[];
  /** Per-topic breakdown scoped to THIS session only. */
  topicSummaries: ResultTopicSummary[];
  /** Ability trajectory: one point per question. */
  chartPoints: { questionNumber: string; ability: number; difficulty: number; correct: boolean }[];
  /** Full session history list for the sidebar/selector. */
  sessionHistory: SessionHistoryItem[];
}

export interface SessionResultError {
  ok: false;
  error: ResultError;
  message: string;
}

export type SessionResult = SessionResultData | SessionResultError;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOPIC_METADATA: Record<string, { id: string; name: string; color: string }> = {
  DSA: { id: "dsa", name: "Data Structures & Algorithms", color: "#6366f1" },
  OS: { id: "os", name: "Operating Systems", color: "#06b6d4" },
  DBMS: { id: "dbms", name: "Database Management Systems", color: "#f59e0b" },
  CN: { id: "cn", name: "Computer Networks", color: "#ec4899" },
  Mixed: { id: "mixed", name: "Mixed Topics", color: "#8b5cf6" },
};

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "Recently";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Recently";
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return `${dateStr} • ${timeStr}`;
  } catch {
    return "Recently";
  }
}

function buildTopicSummaries(
  questions: ResultQuestionItem[]
): ResultTopicSummary[] {
  const stats: Record<string, { total: number; correct: number; abilitySum: number }> = {};

  for (const q of questions) {
    const code = q.topicCode;
    if (!stats[code]) stats[code] = { total: 0, correct: 0, abilitySum: 0 };
    stats[code].total += 1;
    if (q.isCorrect) stats[code].correct += 1;
    stats[code].abilitySum += q.abilityAfter;
  }

  return Object.entries(stats).map(([code, s]) => {
    const meta = TOPIC_METADATA[code] || { id: code.toLowerCase(), name: code, color: "#6366f1" };
    const assessed = s.total > 0;
    const accuracy = assessed ? Math.round((s.correct / s.total) * 100) : 0;
    const avgAbility = assessed ? Math.round(s.abilitySum / s.total) : 0;
    const proficiency = assessed ? Math.min(100, Math.round(accuracy * 0.6 + avgAbility * 0.4)) : 0;

    let status: ResultTopicSummary["status"] = "Not Assessed";
    if (assessed) {
      if (proficiency >= 78) status = "Strong";
      else if (proficiency >= 62) status = "Developing";
      else status = "Needs Work";
    }

    return {
      id: meta.id,
      name: meta.name,
      code,
      color: meta.color,
      totalQuestions: s.total,
      correctQuestions: s.correct,
      accuracy,
      proficiency,
      status,
      assessed,
    };
  });
}

// ---------------------------------------------------------------------------
// Main server action
// ---------------------------------------------------------------------------

/**
 * Fetch the full result data for a completed assessment session.
 *
 * @param sessionId - ID from the URL query param (?id=...).
 *                    If omitted, the most recently completed session is used.
 *
 * Server-authoritative flow:
 *   1. Authenticate student from SSR cookies.
 *   2. Fetch ALL student sessions for the history list + to find the default.
 *   3. Resolve which session to display (by ID or most recent).
 *   4. Verify session belongs to this student (ownership check).
 *   5. Verify session status === 'completed'.
 *   6. Fetch all responses for the session.
 *   7. Fetch full question details per response (correct answer + explanation).
 *   8. Assemble and return the full result.
 */
export async function getSessionResult(
  sessionId: string | null | undefined
): Promise<SessionResult> {
  // 1. Authenticate
  const student = await getAuthenticatedStudent();
  if (!student) {
    return {
      ok: false,
      error: "unauthenticated",
      message: "You must be signed in to view assessment results.",
    };
  }

  // 2 & 6. Fetch completed sessions AND responses for target in parallel when sessionId is known.
  // Sessions always needed for history sidebar. Responses fetched speculatively if we have an ID.
  const [allSessions, speculativeResponses] = await Promise.all([
    getStudentSessions(student.id, 50),
    sessionId ? getSessionResponses(sessionId) : Promise.resolve(null),
  ]);

  const sessionHistory: SessionHistoryItem[] = (allSessions || []).map((s) => ({
    id: s.id,
    topic: s.topic_filter,
    completedAt: s.completed_at || s.started_at,
    formattedDate: formatDate(s.completed_at || s.started_at),
    questionCount: s.actual_count || s.requested_count,
    correctCount: s.correct_count,
    percentageScore: s.percentage_score,
    abilityFinal: s.ability_final,
  }));

  if (!allSessions || allSessions.length === 0) {
    return {
      ok: false,
      error: "no_sessions",
      message: "You haven't completed any assessments yet. Take your first test to see results here.",
    };
  }

  // 3. Resolve target session (check already-fetched allSessions first to avoid extra DB query)
  let targetSession = sessionId
    ? (allSessions.find((s) => s.id === sessionId) || await getSessionById(sessionId))
    : allSessions[0]; // newest completed session

  if (!targetSession) {
    return {
      ok: false,
      error: "not_found",
      message: "The requested assessment session was not found.",
    };
  }

  // 4. Ownership verification — never trust client-provided identity
  if (targetSession.student_id !== student.id) {
    return {
      ok: false,
      error: "not_yours",
      message: "You do not have permission to view this assessment session.",
    };
  }

  // 5. Status check — only completed sessions have full results
  if (targetSession.status !== "completed") {
    return {
      ok: false,
      error: "not_completed",
      message:
        targetSession.status === "in_progress"
          ? "This assessment is still in progress. Complete it first to see your results."
          : "This assessment session was abandoned and has no results.",
    };
  }

  // 6. Use speculatively-fetched responses if they match, otherwise fetch now
  const responses = (speculativeResponses && sessionId === targetSession.id)
    ? speculativeResponses
    : await getSessionResponses(targetSession.id, student.id);

  // 7. Fetch full question data for ALL responses in parallel (all from in-memory cache)
  const questionItems: ResultQuestionItem[] = await Promise.all(
    responses.map(async (resp) => {
      const question = await fetchQuestionById(resp.question_id);
      return {
        questionNumber: resp.question_order,
        questionId: resp.question_id,
        questionText: question?.questionText || "[Question not found]",
        options: question?.options || [],
        topic: TOPIC_METADATA[resp.topic_code]?.name || resp.topic_code,
        topicCode: resp.topic_code,
        subtopic: question?.subtopic || "",
        difficultyLevel: resp.difficulty_level,
        difficultyLabel: question?.difficultyLabel || `Level ${resp.difficulty_level}`,
        selectedOptionIndex: resp.selected_option_index,
        correctOptionIndex: question?.correctOptionIndex ?? -1,
        explanation: question?.explanation || "",
        isCorrect: resp.is_correct,
        timeTakenSec: resp.time_taken_sec,
        timeRemainingSec: resp.time_remaining_sec,
        abilityBefore: resp.ability_before,
        abilityAfter: resp.ability_after,
        baseScore: resp.base_score,
        speedBonus: resp.speed_bonus,
        totalScore: resp.total_score,
      };
    })
  );
  // Sort by question_order ascending (responses are already ordered but be safe)
  questionItems.sort((a, b) => a.questionNumber - b.questionNumber);

  // 8. Build derived data
  const topicSummaries = buildTopicSummaries(questionItems);

  const chartPoints = questionItems.map((q) => ({
    questionNumber: String(q.questionNumber),
    ability: q.abilityAfter,
    difficulty: q.difficultyLevel * 20, // Scale 1–5 → 20–100 for visual comparison
    correct: q.isCorrect,
  }));

  return {
    ok: true,
    sessionId: targetSession.id,
    topic: targetSession.topic_filter,
    completedAt: targetSession.completed_at || targetSession.started_at,
    formattedDate: formatDate(targetSession.completed_at || targetSession.started_at),
    questionCount: targetSession.actual_count || targetSession.requested_count,
    correctCount: targetSession.correct_count,
    percentageScore: targetSession.percentage_score,
    totalScore: targetSession.total_score,
    totalBonus: targetSession.total_bonus,
    abilityStart: targetSession.ability_start,
    abilityFinal: targetSession.ability_final,
    abilityDelta: targetSession.ability_delta,
    abilityLabel: getAbilityLevelLabel(targetSession.ability_final),
    questions: questionItems,
    topicSummaries,
    chartPoints,
    sessionHistory,
  };
}
