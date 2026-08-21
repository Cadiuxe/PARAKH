"use server";

/**
 * PARAKH — Server Authoritative Assessment Actions
 *
 * All assessment lifecycle events (session creation, answer validation,
 * scoring, ability tracking, next question selection, and completion)
 * happen server-side here.
 *
 * The client NEVER evaluates correctness or scores.
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database, QuestionSafeRow, SessionRow } from "@/lib/db/types";
import {
  fetchApprovedQuestions,
  fetchQuestionById,
  toSafeQuestion,
} from "@/lib/db/questions";
import {
  createSession,
  getActiveSession,
  updateSession,
  getSessionById,
} from "@/lib/db/sessions";
import {
  insertResponse,
  getSessionResponses,
} from "@/lib/db/responses";
import { upsertAbilityEstimates } from "@/lib/db/ability";
import {
  selectNextQuestion,
  updateAbility,
  questionScore,
  INITIAL_ABILITY,
  TIMER_SECONDS,
} from "@/lib/adaptive-engine";
import type { AssessmentQuestion } from "@/lib/mock-data";

/**
 * Authenticate the student from SSR session cookies.
 */
async function getAuthenticatedStudent(): Promise<{ id: string; email?: string } | null> {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // In guest or local development mode with no Supabase configured
      return { id: "demo-student-user", email: "demo@parakh.edu" };
    }

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore in Server Actions
          }
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      return { id: user.id, email: user.email };
    }
  } catch {
    // In non-request execution contexts or unauthenticated demo sessions
  }

  // Fallback for demo mode if not logged in
  return { id: "demo-student-user", email: "demo@parakh.edu" };
}

export type StartSessionResult =
  | {
      success: true;
      sessionId: string;
      topic: string;
      requestedCount: number;
      initialAbility: number;
      firstQuestion: QuestionSafeRow;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Start a new server-authoritative assessment session.
 */
export async function startAssessmentSession(
  topic: string,
  count: number
): Promise<StartSessionResult> {
  const student = await getAuthenticatedStudent();
  if (!student) {
    return { success: false, error: "Unauthorized: Please log in to begin an assessment." };
  }

  const validTopics = ["Mixed", "DSA", "DBMS", "OS", "CN"];
  const topicFilter = validTopics.includes(topic) ? (topic as any) : "Mixed";
  const requestedCount = [5, 10, 15].includes(count) ? count : 5;

  // Load pool and select first question on server
  const pool = await fetchApprovedQuestions(topicFilter);
  const firstQuestion = selectNextQuestion(INITIAL_ABILITY, new Set(), topicFilter);

  if (!firstQuestion) {
    return { success: false, error: "No questions available for the selected topic." };
  }

  // Create database session record with in_progress status
  const session = await createSession({
    student_id: student.id,
    topic_filter: topicFilter,
    requested_count: requestedCount,
    ability_start: INITIAL_ABILITY,
    status: "in_progress",
  });

  return {
    success: true,
    sessionId: session.id,
    topic: topicFilter,
    requestedCount,
    initialAbility: INITIAL_ABILITY,
    firstQuestion: toSafeQuestion(firstQuestion),
  };
}

export interface QuestionFeedback {
  isCorrect: boolean;
  correctOptionIndex: number;
  explanation: string;
  baseScore: number;
  speedBonus: number;
  totalScore: number;
  abilityBefore: number;
  abilityAfter: number;
}

export interface CompletedSessionSummary {
  id: string;
  completedAt: string;
  topic: string;
  requestedCount: number;
  actualCount: number;
  correctCount: number;
  percentageScore: number;
  totalScore: number;
  totalBonus: number;
  abilityStart: number;
  abilityFinal: number;
  abilityDelta: number;
  responses: Array<{
    questionId: string;
    questionText: string;
    topic: string;
    subtopic: string;
    difficultyLevel: number;
    difficultyLabel: string;
    options: string[];
    selectedIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
    explanation: string;
    timeRemaining: number;
    baseScore: number;
    speedBonus: number;
    totalScore: number;
    abilityBefore: number;
    abilityAfter: number;
  }>;
}

export type SubmitAnswerResult =
  | {
      success: true;
      feedback: QuestionFeedback;
      isCompleted: false;
      nextQuestion: QuestionSafeRow;
      nextQuestionIndex: number;
    }
  | {
      success: true;
      feedback: QuestionFeedback;
      isCompleted: true;
      completedSummary: CompletedSessionSummary;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Submit an answer for the current question. Evaluated entirely on server.
 * Handles duplicate submissions idempotently.
 */
export async function submitQuestionAnswer(params: {
  sessionId: string;
  questionId: string;
  selectedOptionIndex: number;
  timeRemainingSec: number;
}): Promise<SubmitAnswerResult> {
  const student = await getAuthenticatedStudent();
  if (!student) {
    return { success: false, error: "Unauthorized." };
  }

  const { sessionId, questionId, selectedOptionIndex, timeRemainingSec } = params;

  // 1. Verify session exists and belongs to student
  const session = await getSessionById(sessionId, student.id);
  if (!session) {
    return { success: false, error: "Assessment session not found or unauthorized." };
  }

  if (session.status !== "in_progress") {
    return { success: false, error: "Assessment session is already completed or abandoned." };
  }

  // 2. Fetch existing responses for this session
  const previousResponses = await getSessionResponses(sessionId);

  // DUPLICATE SUBMISSION GUARD:
  // If this questionId was already answered, return existing response result idempotently
  const existingResponse = previousResponses.find((r) => r.question_id === questionId);
  const question = await fetchQuestionById(questionId);

  if (!question) {
    return { success: false, error: "Question not found." };
  }

  let isCorrect: boolean;
  let baseScore: number;
  let speedBonus: number;
  let totalScore: number;
  let abilityBefore: number;
  let abilityAfter: number;

  if (existingResponse) {
    // Already recorded — use saved values
    isCorrect = existingResponse.is_correct;
    baseScore = existingResponse.base_score;
    speedBonus = existingResponse.speed_bonus;
    totalScore = existingResponse.total_score;
    abilityBefore = existingResponse.ability_before;
    abilityAfter = existingResponse.ability_after;
  } else {
    // 3. Evaluate correctness and score server-side
    isCorrect =
      selectedOptionIndex !== -1 &&
      selectedOptionIndex === question.correctOptionIndex;

    const clampedTimeRemaining = Math.max(0, Math.min(TIMER_SECONDS, timeRemainingSec));
    const scored = questionScore(isCorrect, clampedTimeRemaining, TIMER_SECONDS);
    baseScore = scored.base;
    speedBonus = scored.bonus;
    totalScore = scored.total;

    abilityBefore =
      previousResponses.length > 0
        ? previousResponses[previousResponses.length - 1].ability_after
        : session.ability_start;

    abilityAfter = updateAbility(abilityBefore, isCorrect, question.difficultyLevel);

    // 4. Save response to database
    await insertResponse({
      session_id: sessionId,
      question_id: questionId,
      question_order: previousResponses.length + 1,
      topic_code: question.topic,
      difficulty_level: question.difficultyLevel,
      selected_option_index: selectedOptionIndex,
      is_correct: isCorrect,
      time_remaining_sec: clampedTimeRemaining,
      time_taken_sec: Math.max(0, TIMER_SECONDS - clampedTimeRemaining),
      ability_before: abilityBefore,
      ability_after: abilityAfter,
      base_score: baseScore,
      speed_bonus: speedBonus,
      total_score: totalScore,
    });
  }

  const feedback: QuestionFeedback = {
    isCorrect,
    correctOptionIndex: question.correctOptionIndex,
    explanation: question.explanation,
    baseScore,
    speedBonus,
    totalScore,
    abilityBefore,
    abilityAfter,
  };

  // Re-fetch all responses to check completion
  const allResponses = await getSessionResponses(sessionId);
  const currentCount = allResponses.length;
  const isCompleted = currentCount >= session.requested_count;

  if (!isCompleted) {
    // 5. Select next question adaptively on server
    const usedIds = new Set(allResponses.map((r) => r.question_id));
    const nextQuestion = selectNextQuestion(abilityAfter, usedIds, session.topic_filter);

    if (nextQuestion) {
      return {
        success: true,
        feedback,
        isCompleted: false,
        nextQuestion: toSafeQuestion(nextQuestion),
        nextQuestionIndex: currentCount,
      };
    }
  }

  // 6. Complete assessment session server-side
  const actualCount = allResponses.length;
  const correctCount = allResponses.filter((r) => r.is_correct).length;
  const percentageScore = Math.round((correctCount / actualCount) * 100);
  const sumTotalScore = allResponses.reduce((s, r) => s + r.total_score, 0);
  const sumTotalBonus = allResponses.reduce((s, r) => s + r.speed_bonus, 0);
  const finalAbility = allResponses[allResponses.length - 1]?.ability_after ?? abilityAfter;
  const abilityDelta = finalAbility - session.ability_start;
  const completedAt = new Date().toISOString();

  await updateSession(sessionId, {
    actual_count: actualCount,
    correct_count: correctCount,
    percentage_score: percentageScore,
    total_score: sumTotalScore,
    total_bonus: sumTotalBonus,
    ability_final: finalAbility,
    ability_delta: abilityDelta,
    status: "completed",
    completed_at: completedAt,
  });

  // 7. Update student's rolling ability estimates in database
  await upsertAbilityEstimates([
    {
      student_id: student.id,
      topic_id: session.topic_filter,
      ability: finalAbility,
      total_questions: actualCount,
      correct_count: correctCount,
    },
  ]);

  // Build full response review
  const fullResponsesReview = [];
  for (const resp of allResponses) {
    const qDetails = await fetchQuestionById(resp.question_id);
    if (qDetails) {
      fullResponsesReview.push({
        questionId: qDetails.id,
        questionText: qDetails.questionText,
        topic: qDetails.topic,
        subtopic: qDetails.subtopic,
        difficultyLevel: qDetails.difficultyLevel,
        difficultyLabel: qDetails.difficultyLabel,
        options: qDetails.options,
        selectedIndex: resp.selected_option_index,
        correctOptionIndex: qDetails.correctOptionIndex,
        isCorrect: resp.is_correct,
        explanation: qDetails.explanation,
        timeRemaining: resp.time_remaining_sec,
        baseScore: resp.base_score,
        speedBonus: resp.speed_bonus,
        totalScore: resp.total_score,
        abilityBefore: resp.ability_before,
        abilityAfter: resp.ability_after,
      });
    }
  }

  const completedSummary: CompletedSessionSummary = {
    id: sessionId,
    completedAt,
    topic: session.topic_filter,
    requestedCount: session.requested_count,
    actualCount,
    correctCount,
    percentageScore,
    totalScore: sumTotalScore,
    totalBonus: sumTotalBonus,
    abilityStart: session.ability_start,
    abilityFinal: finalAbility,
    abilityDelta,
    responses: fullResponsesReview,
  };

  return {
    success: true,
    feedback,
    isCompleted: true,
    completedSummary,
  };
}

export type ActiveSessionResult =
  | {
      hasActiveSession: true;
      sessionId: string;
      topic: string;
      requestedCount: number;
      questionIndex: number;
      currentAbility: number;
      abilityStart: number;
      currentQuestion: QuestionSafeRow;
      previousResults: Array<{
        questionId: string;
        questionText: string;
        topic: string;
        subtopic: string;
        difficultyLevel: number;
        difficultyLabel: string;
        options: string[];
        selectedIndex: number;
        correctOptionIndex: number;
        isCorrect: boolean;
        explanation: string;
        timeRemaining: number;
        baseScore: number;
        speedBonus: number;
        totalScore: number;
        abilityBefore: number;
        abilityAfter: number;
      }>;
    }
  | {
      hasActiveSession: false;
    };

/**
 * Check for an ongoing active assessment session upon refresh or reconnect.
 */
export async function getActiveAssessmentSession(): Promise<ActiveSessionResult> {
  const student = await getAuthenticatedStudent();
  if (!student) {
    return { hasActiveSession: false };
  }

  const activeSession = await getActiveSession(student.id);
  if (!activeSession) {
    return { hasActiveSession: false };
  }

  const responses = await getSessionResponses(activeSession.id);
  const usedIds = new Set(responses.map((r) => r.question_id));
  const currentAbility =
    responses.length > 0
      ? responses[responses.length - 1].ability_after
      : activeSession.ability_start;

  // Build previous results
  const previousResults = [];
  for (const resp of responses) {
    const qDetails = await fetchQuestionById(resp.question_id);
    if (qDetails) {
      previousResults.push({
        questionId: qDetails.id,
        questionText: qDetails.questionText,
        topic: qDetails.topic,
        subtopic: qDetails.subtopic,
        difficultyLevel: qDetails.difficultyLevel,
        difficultyLabel: qDetails.difficultyLabel,
        options: qDetails.options,
        selectedIndex: resp.selected_option_index,
        correctOptionIndex: qDetails.correctOptionIndex,
        isCorrect: resp.is_correct,
        explanation: qDetails.explanation,
        timeRemaining: resp.time_remaining_sec,
        baseScore: resp.base_score,
        speedBonus: resp.speed_bonus,
        totalScore: resp.total_score,
        abilityBefore: resp.ability_before,
        abilityAfter: resp.ability_after,
      });
    }
  }

  if (responses.length < activeSession.requested_count) {
    const nextQuestion = selectNextQuestion(
      currentAbility,
      usedIds,
      activeSession.topic_filter
    );
    if (nextQuestion) {
      return {
        hasActiveSession: true,
        sessionId: activeSession.id,
        topic: activeSession.topic_filter,
        requestedCount: activeSession.requested_count,
        questionIndex: responses.length,
        currentAbility,
        abilityStart: activeSession.ability_start,
        currentQuestion: toSafeQuestion(nextQuestion),
        previousResults,
      };
    }
  }

  return { hasActiveSession: false };
}

/**
 * Abandon an in-progress assessment session.
 */
export async function abandonAssessmentSession(
  sessionId: string
): Promise<{ success: boolean }> {
  const student = await getAuthenticatedStudent();
  if (!student) return { success: false };

  const session = await getSessionById(sessionId, student.id);
  if (!session) return { success: false };

  await updateSession(sessionId, { status: "abandoned" });
  return { success: true };
}
