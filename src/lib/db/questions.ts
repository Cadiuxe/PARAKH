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

import { getSupabaseAdmin } from "./server-client";
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
  try {
    const admin = getSupabaseAdmin();
    let query = admin
      .from("questions")
      .select("*, topics!inner(code)")
      .eq("is_active", true)
      .eq("review_status", "approved");

    if (topicCode && topicCode !== "Mixed") {
      query = query.eq("topics.code", topicCode);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        topic: row.topics?.code || topicCode || "Mixed",
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
      }));
    }
  } catch {
    // Supabase unconfigured or DB offline: fallback gracefully to curated QUESTION_BANK
  }

  // Fallback to memory question bank
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
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("questions")
      .select("*, topics(code)")
      .eq("id", questionId)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        topic: (data as any).topics?.code || "Mixed",
        subtopic: data.subtopic,
        difficultyLabel: data.difficulty_label,
        difficultyLevel: data.difficulty_level,
        difficultyScore:
          data.difficulty_score != null
            ? Number(data.difficulty_score)
            : getDifficultyScoreFromLevel(data.difficulty_level),
        questionText: data.question_text,
        options: data.options as string[],
        correctOptionIndex: data.correct_option_index,
        explanation: data.explanation || "",
      };
    }
  } catch {
    // Fallback to local memory bank
  }

  const found = QUESTION_BANK.find((q) => q.id === questionId);
  return found || null;
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
