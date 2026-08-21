/**
 * PARAKH — Questions Data Access
 *
 * Server-side operations for the `questions` table.
 * Import only in Server Actions, API routes, or server components — never in client components.
 *
 * SECURITY NOTE: This layer is the only place that reads correct_option_index.
 * The adaptive engine receives full QuestionRow / AssessmentQuestion objects server-side.
 * Client components receive ONLY QuestionSafeRow (no answer key or explanation before submission).
 */

import { getSupabaseAdmin, isSupabaseServerConfigured } from "./server-client";
import type { QuestionRow, QuestionSafeRow } from "./types";
import { QUESTION_BANK, AssessmentQuestion, getDifficultyScoreFromLevel } from "../mock-data";

/**
 * Helper to convert AssessmentQuestion (from mock-data) to QuestionRow format if needed.
 */
function mockToQuestionRow(q: AssessmentQuestion): QuestionRow {
  return {
    id: q.id,
    topic_id: q.topic,
    subtopic: q.subtopic,
    difficulty_level: q.difficultyLevel as 1 | 2 | 3 | 4 | 5,
    difficulty_label: q.difficultyLabel,
    difficulty_score: q.difficultyScore ?? getDifficultyScoreFromLevel(q.difficultyLevel),
    question_text: q.questionText,
    options: q.options,
    correct_option_index: q.correctOptionIndex as 0 | 1 | 2 | 3,
    explanation: q.explanation,
    source: "question_bank",
    review_status: "approved",
    is_active: true,
    times_used: 0,
    correct_count: 0,
    incorrect_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Strips answer key and explanation to create a safe question payload for the browser.
 */
export function toSafeQuestion(
  q: QuestionRow | AssessmentQuestion
): QuestionSafeRow {
  if ("questionText" in q) {
    return {
      id: q.id,
      topic_id: q.topic,
      subtopic: q.subtopic,
      difficulty_level: q.difficultyLevel as 1 | 2 | 3 | 4 | 5,
      difficulty_label: q.difficultyLabel,
      difficulty_score: q.difficultyScore,
      question_text: q.questionText,
      options: q.options,
    };
  }
  return {
    id: q.id,
    topic_id: q.topic_id,
    subtopic: q.subtopic,
    difficulty_level: q.difficulty_level,
    difficulty_label: q.difficulty_label,
    difficulty_score: q.difficulty_score,
    question_text: q.question_text,
    options: q.options,
  };
}

// In-memory cache for approved assessment questions to avoid redundant DB roundtrips
let cachedQuestions: AssessmentQuestion[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

/**
 * Fetch all approved, active questions for the adaptive engine.
 * Optionally filter by topic code (e.g., 'DSA', 'DBMS').
 *
 * Returns full QuestionRow including correct_option_index.
 * This result is SERVER-ONLY — never sent to the browser directly.
 *
 * @param topicCode - Optional topic filter. If omitted or 'Mixed', returns all.
 */
export async function fetchApprovedQuestions(
  topicCode?: string
): Promise<AssessmentQuestion[]> {
  const now = Date.now();

  // Return from in-memory cache if fresh
  if (cachedQuestions && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedQuestions.filter((q) => {
      if (topicCode && topicCode !== "Mixed" && q.topic !== topicCode) return false;
      return true;
    });
  }

  if (isSupabaseServerConfigured()) {
    try {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from("questions")
        .select("*")
        .eq("is_active", true)
        .eq("review_status", "approved");

      if (error) {
        console.error("[fetchApprovedQuestions] Supabase error (falling back to QUESTION_BANK):", error.message);
      } else if (data && data.length > 0) {
        // Resolve topic UUIDs → codes via in-memory cache (avoids DB join)
        const { getTopicCodeById } = await import("./topics");
        const mapped: AssessmentQuestion[] = await Promise.all(
          data.map(async (row: any) => ({
            id: row.id,
            topic: (await getTopicCodeById(row.topic_id)) || "Mixed",
            subtopic: row.subtopic,
            difficultyLabel: row.difficulty_label,
            difficultyLevel: row.difficulty_level,
            difficultyScore:
              row.difficulty_score != null
                ? Number(row.difficulty_score)
                : getDifficultyScoreFromLevel(row.difficulty_level),
            questionText: row.question_text,
            options: row.options as string[],
            correctOptionIndex: row.correct_option_index,
            explanation: row.explanation || "",
          }))
        );

        cachedQuestions = mapped;
        lastCacheTime = now;

        return cachedQuestions.filter((q) => {
          if (topicCode && topicCode !== "Mixed" && q.topic !== topicCode) return false;
          return true;
        });
      } else {
        console.warn("[fetchApprovedQuestions] No questions returned from Supabase, falling back to QUESTION_BANK");
      }
    } catch (err: any) {
      console.error("[fetchApprovedQuestions] Unexpected error (falling back to QUESTION_BANK):", err?.message);
    }
  }

  // Fallback: Supabase not configured, returned 0 rows, or query failed
  cachedQuestions = QUESTION_BANK;
  lastCacheTime = now;

  return QUESTION_BANK.filter((q) => {
    if (topicCode && topicCode !== "Mixed" && q.topic !== topicCode) return false;
    return true;
  });
}

/**
 * Fetch a single question by ID (full details for evaluation).
 * Server-only function.
 */
export async function fetchQuestionById(
  questionId: string
): Promise<AssessmentQuestion | null> {
  // 1. Check cache first for sub-millisecond lookup
  if (cachedQuestions) {
    const found = cachedQuestions.find((q) => q.id === questionId);
    if (found) return found;
  }

  // 2. Populate cache if not loaded
  const all = await fetchApprovedQuestions();
  const match = all.find((q) => q.id === questionId);
  if (match) return match;

  // 3. Fallback check
  const fallback = QUESTION_BANK.find((q) => q.id === questionId);
  return fallback || null;
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
  const full = await fetchQuestionById(questionId);
  if (!full) return null;
  return toSafeQuestion(full);
}
