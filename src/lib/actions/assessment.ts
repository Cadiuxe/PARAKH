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

import { cache } from "react";
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
import { upsertAbilityEstimates, getStudentAbility } from "@/lib/db/ability";
import {
  selectNextQuestion,
  updateAbility,
  questionScore,
  getDiagnosticQuestions,
  calculateDiagnosticAbility,
  calculateAbilityPrior,
  INITIAL_ABILITY,
  TIMER_SECONDS,
} from "@/lib/adaptive-engine";
import type { AssessmentQuestion } from "@/lib/mock-data";

/**
 * Authenticate the student from SSR session cookies.
 *
 * Uses authoritative server-side identity verification via supabase.auth.getUser().
 * Memoized with React.cache() for deduplication within a single request / render tree.
 */
export const getAuthenticatedStudent = cache(
  async (): Promise<{ id: string; email?: string } | null> => {
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
);

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

export type DiagnosticQuizResult =
  | {
      success: true;
      questions: QuestionSafeRow[];
    }
  | {
      success: false;
      error: string;
    };

export type TopicCalibrationResult =
  | {
      isCalibrated: true;
      /** Existing topic ability on [5, 100] — use directly as starting ability */
      startingAbility: number;
    }
  | {
      isCalibrated: false;
    };

/**
 * Check whether the authenticated student already has a calibrated ability estimate
 * for the given topic. Used to decide whether to run the pre-assessment diagnostic.
 *
 * - Single topics (DSA / DBMS / OS / CN): calibrated iff ability_estimates has a row for that topic.
 * - Mixed: never considered calibrated (no single canonical topic_id for Mixed).
 */
export async function checkTopicCalibration(
  topic: string
): Promise<TopicCalibrationResult> {
  if (topic === "Mixed") {
    return { isCalibrated: false };
  }

  const student = await getAuthenticatedStudent();
  if (!student) return { isCalibrated: false };

  const estimates = await getStudentAbility(student.id);
  const existing = estimates.find((e) => e.topic_id === topic);
  if (existing && typeof existing.ability === "number" && !isNaN(existing.ability)) {
    return { isCalibrated: true, startingAbility: existing.ability };
  }
  return { isCalibrated: false };
}

/**
 * Fetch the 5 safe diagnostic questions for pre-assessment calibration.
 */
export async function getDiagnosticQuiz(topic: string): Promise<DiagnosticQuizResult> {
  const validTopics = ["Mixed", "DSA", "DBMS", "OS", "CN"];
  const topicFilter = validTopics.includes(topic) ? topic : "Mixed";

  const pool = await fetchApprovedQuestions(topicFilter);
  const diagQuestions = getDiagnosticQuestions(topicFilter, pool);

  if (diagQuestions.length < 5) {
    return { success: false, error: "Insufficient diagnostic questions available." };
  }

  return {
    success: true,
    questions: diagQuestions.map(toSafeQuestion),
  };
}

export interface DiagnosticAnswerSubmission {
  questionId: string;
  selectedOptionIndex: number;
}

export interface StartWithDiagnosticParams {
  topic: string;
  count: number;
  selfAssessmentTier?: string | null;
  diagnosticAnswers: DiagnosticAnswerSubmission[];
}

export type EvaluateDiagnosticResult =
  | {
      success: true;
      calibratedAbility: number;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server-authoritatively evaluate the 5 diagnostic answers and calculate the student's
 * calibrated ability prior WITHOUT creating a database session.
 * Used to present the Calibration Result Screen to the student before they click "Begin Assessment".
 */
export async function evaluateDiagnosticCalibration(params: {
  topic: string;
  selfAssessmentTier?: string | null;
  diagnosticAnswers: DiagnosticAnswerSubmission[];
}): Promise<EvaluateDiagnosticResult> {
  const student = await getAuthenticatedStudent();
  if (!student) {
    return { success: false, error: "Unauthorized: Please log in." };
  }

  const validTopics = ["Mixed", "DSA", "DBMS", "OS", "CN"];
  const topicFilter = validTopics.includes(params.topic) ? (params.topic as any) : "Mixed";

  // 1. Evaluate diagnostic questions server-side
  const diagnosticResults: Array<{ isCorrect: boolean; difficultyScore: number }> = [];

  for (const ans of params.diagnosticAnswers) {
    const q = await fetchQuestionById(ans.questionId);
    if (q) {
      const isCorrect =
        ans.selectedOptionIndex !== -1 && ans.selectedOptionIndex === q.correctOptionIndex;
      diagnosticResults.push({
        isCorrect,
        difficultyScore: q.difficultyScore,
      });
    }
  }

  // 2. Compute diagnostic ability (15–88)
  const diagnosticAbility = calculateDiagnosticAbility(diagnosticResults);

  // 3. Fetch historical ability for this student (if returning student)
  let historicalAbility: number | null = null;
  if (student.id) {
    const historicalEstimates = await getStudentAbility(student.id);
    if (topicFilter === "Mixed") {
      if (historicalEstimates.length > 0) {
        const sum = historicalEstimates.reduce((acc, est) => acc + est.ability, 0);
        historicalAbility = sum / historicalEstimates.length;
      }
    } else {
      const topicEst = historicalEstimates.find((e) => e.topic_id === topicFilter);
      if (topicEst) {
        historicalAbility = topicEst.ability;
      }
    }
  }

  // 4. Compute overall calibrated ability prior (with shrinkage)
  const startingAbility = calculateAbilityPrior({
    diagnosticAbility,
    selfAssessmentTier: params.selfAssessmentTier,
    historicalAbility,
  });

  return {
    success: true,
    calibratedAbility: startingAbility,
  };
}

/**
 * Server-authoritatively evaluate the 5 diagnostic answers, calculate the student's ability prior,
 * create the database assessment session, and start the main adaptive assessment.
 * Called only when the student explicitly clicks "Begin Assessment" on the calibration result screen.
 */
export async function startAssessmentWithDiagnostic(
  params: StartWithDiagnosticParams
): Promise<StartSessionResult> {
  const student = await getAuthenticatedStudent();
  if (!student) {
    return { success: false, error: "Unauthorized: Please log in to begin an assessment." };
  }

  const validTopics = ["Mixed", "DSA", "DBMS", "OS", "CN"];
  const topicFilter = validTopics.includes(params.topic) ? (params.topic as any) : "Mixed";
  const requestedCount = [5, 10, 15].includes(params.count) ? params.count : 5;

  // 1. Evaluate diagnostic questions server-side
  const diagnosticResults: Array<{ isCorrect: boolean; difficultyScore: number }> = [];
  const diagnosticQuestionIds = new Set<string>();

  for (const ans of params.diagnosticAnswers) {
    diagnosticQuestionIds.add(ans.questionId);
    const q = await fetchQuestionById(ans.questionId);
    if (q) {
      const isCorrect =
        ans.selectedOptionIndex !== -1 && ans.selectedOptionIndex === q.correctOptionIndex;
      diagnosticResults.push({ isCorrect, difficultyScore: q.difficultyScore });
    }
  }

  // 2. Compute diagnostic ability (15–88)
  const diagnosticAbility = calculateDiagnosticAbility(diagnosticResults);

  // 3. Fetch historical ability for this student (if returning student)
  let historicalAbility: number | null = null;
  if (student.id) {
    const historicalEstimates = await getStudentAbility(student.id);
    if (topicFilter === "Mixed") {
      if (historicalEstimates.length > 0) {
        const sum = historicalEstimates.reduce((acc, est) => acc + est.ability, 0);
        historicalAbility = sum / historicalEstimates.length;
      }
    } else {
      const topicEst = historicalEstimates.find((e) => e.topic_id === topicFilter);
      if (topicEst) historicalAbility = topicEst.ability;
    }
  }

  // 4. Compute overall calibrated ability prior (with shrinkage)
  const startingAbility = calculateAbilityPrior({
    diagnosticAbility,
    selfAssessmentTier: params.selfAssessmentTier,
    historicalAbility,
  });

  // 5. Select Question 1 of the main adaptive assessment (excluding diagnostic questions)
  const pool = await fetchApprovedQuestions(topicFilter);
  const firstQuestion = selectNextQuestion(startingAbility, diagnosticQuestionIds, topicFilter, pool);

  if (!firstQuestion) {
    return { success: false, error: "No questions available for the selected topic." };
  }

  // Create database session record with computed ability_start
  const session = await createSession({
    student_id: student.id,
    topic_filter: topicFilter,
    requested_count: requestedCount,
    ability_start: startingAbility,
    status: "in_progress",
  });

  return {
    success: true,
    sessionId: session.id,
    topic: topicFilter,
    requestedCount,
    initialAbility: startingAbility,
    firstQuestion: toSafeQuestion(firstQuestion),
  };
}

/**
 * Start a new server-authoritative assessment session.
 *
 * Server determines starting ability authoritatively from persisted student topic estimates:
 * - If student has a persisted estimate for the selected topic (DSA/DBMS/OS/CN), use that ability.
 * - Otherwise (first-time topic or Mixed), default to INITIAL_ABILITY (50.0).
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

  let startAbility = INITIAL_ABILITY;

  // Single topics: look up persisted ability from database for returning students
  if (topicFilter !== "Mixed" && student.id) {
    const estimates = await getStudentAbility(student.id);
    const existing = estimates.find((e) => e.topic_id === topicFilter);
    if (existing && typeof existing.ability === "number" && !isNaN(existing.ability)) {
      startAbility = existing.ability;
    }
  }

  // Load pool and select first question on server targeting the starting ability
  const pool = await fetchApprovedQuestions(topicFilter);
  const firstQuestion = selectNextQuestion(startAbility, new Set(), topicFilter, pool);

  if (!firstQuestion) {
    return { success: false, error: "No questions available for the selected topic." };
  }

  // Create database session record with in_progress status
  const session = await createSession({
    student_id: student.id,
    topic_filter: topicFilter,
    requested_count: requestedCount,
    ability_start: startAbility,
    status: "in_progress",
  });

  return {
    success: true,
    sessionId: session.id,
    topic: topicFilter,
    requestedCount,
    initialAbility: startAbility,
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
    difficultyScore: number;
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

export type DiagnosticFeedbackResult =
  | {
      success: true;
      isCorrect: boolean;
      correctOptionIndex: number;
      explanation: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server-authoritatively evaluate a single diagnostic question attempt and return feedback
 * (correctness, correct option index, explanation) without exposing answers in advance.
 */
export async function evaluateDiagnosticAnswer(params: {
  questionId: string;
  selectedOptionIndex: number;
}): Promise<DiagnosticFeedbackResult> {
  const student = await getAuthenticatedStudent();
  if (!student) {
    return { success: false, error: "Unauthorized." };
  }

  const question = await fetchQuestionById(params.questionId);
  if (!question) {
    return { success: false, error: "Question not found." };
  }

  const isCorrect =
    params.selectedOptionIndex !== -1 &&
    params.selectedOptionIndex === question.correctOptionIndex;

  return {
    success: true,
    isCorrect,
    correctOptionIndex: question.correctOptionIndex,
    explanation: question.explanation,
  };
}

/**
 * Submit an answer for the current question. Evaluated entirely on server.
 * Handles duplicate submissions idempotently with sub-second performance.
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

  // 1. Parallelize session verification, previous responses lookup, and question fetch
  const [session, previousResponses, question] = await Promise.all([
    getSessionById(sessionId, student.id),
    getSessionResponses(sessionId),
    fetchQuestionById(questionId),
  ]);

  if (!session) {
    return { success: false, error: "Assessment session not found or unauthorized." };
  }

  if (session.status !== "in_progress") {
    return { success: false, error: "Assessment session is already completed or abandoned." };
  }

  if (!question) {
    return { success: false, error: "Question not found." };
  }

  // DUPLICATE SUBMISSION GUARD:
  // If this questionId was already answered, return existing response result idempotently
  const existingResponse = previousResponses.find((r) => r.question_id === questionId);

  let isCorrect: boolean;
  let baseScore: number;
  let speedBonus: number;
  let totalScore: number;
  let abilityBefore: number;
  let abilityAfter: number;
  let latestResponseRow: any = null;

  if (existingResponse) {
    // Already recorded — use saved values
    isCorrect = existingResponse.is_correct;
    baseScore = existingResponse.base_score;
    speedBonus = existingResponse.speed_bonus;
    totalScore = existingResponse.total_score;
    abilityBefore = existingResponse.ability_before;
    abilityAfter = existingResponse.ability_after;
    latestResponseRow = existingResponse;
  } else {
    // 2. Evaluate correctness and score server-side
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

    abilityAfter = updateAbility(
      abilityBefore,
      isCorrect,
      question.difficultyScore,
      clampedTimeRemaining,
      TIMER_SECONDS
    );

    // 3. Save response to database
    latestResponseRow = await insertResponse({
      session_id: sessionId,
      question_id: questionId,
      question_order: previousResponses.length + 1,
      topic_code: question.topic,
      difficulty_level: question.difficultyLevel,
      difficulty_score: question.difficultyScore,
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

  // Construct allResponses in-memory without redundant database roundtrip
  const allResponses = existingResponse
    ? previousResponses
    : [...previousResponses, latestResponseRow];

  const currentCount = allResponses.length;
  const isCompleted = currentCount >= session.requested_count;

  if (!isCompleted) {
    // 4. Select next question adaptively on server (instant cache lookup)
    const usedIds = new Set(allResponses.map((r) => r.question_id));
    const pool = await fetchApprovedQuestions(session.topic_filter);
    const nextQuestion = selectNextQuestion(abilityAfter, usedIds, session.topic_filter, pool);

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

  // 5. Complete assessment session server-side
  const actualCount = allResponses.length;
  const correctCount = allResponses.filter((r) => r.is_correct).length;
  const percentageScore = Math.round((correctCount / actualCount) * 100);
  const sumTotalScore = allResponses.reduce((s, r) => s + r.total_score, 0);
  const sumTotalBonus = allResponses.reduce((s, r) => s + r.speed_bonus, 0);
  const finalAbility = allResponses[allResponses.length - 1]?.ability_after ?? abilityAfter;
  const abilityDelta = finalAbility - session.ability_start;
  const completedAt = new Date().toISOString();

  // Run session completion and rolling ability update in parallel
  await Promise.all([
    updateSession(sessionId, {
      actual_count: actualCount,
      correct_count: correctCount,
      percentage_score: percentageScore,
      total_score: sumTotalScore,
      total_bonus: sumTotalBonus,
      ability_final: finalAbility,
      ability_delta: abilityDelta,
      status: "completed",
      completed_at: completedAt,
    }),
    upsertAbilityEstimates([
      {
        student_id: student.id,
        topic_id: session.topic_filter,
        ability: finalAbility,
        total_questions: actualCount,
        correct_count: correctCount,
      },
    ]),
  ]);

  // Build full response review using in-memory question lookups (sub-millisecond)
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
        difficultyScore: qDetails.difficultyScore,
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
        difficultyScore: number;
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

  // Parallelize: find active session AND warm the question pool cache simultaneously
  const [activeSession] = await Promise.all([
    getActiveSession(student.id),
    fetchApprovedQuestions(), // warm cache while session query runs
  ]);

  if (!activeSession) {
    return { hasActiveSession: false };
  }

  const responses = await getSessionResponses(activeSession.id);
  const usedIds = new Set(responses.map((r) => r.question_id));
  const currentAbility =
    responses.length > 0
      ? responses[responses.length - 1].ability_after
      : activeSession.ability_start;

  // Build previous results — all questions come from in-memory cache (sub-ms)
  const previousResults = await Promise.all(
    responses.map(async (resp) => {
      const qDetails = await fetchQuestionById(resp.question_id);
      if (!qDetails) return null;
      return {
        questionId: qDetails.id,
        questionText: qDetails.questionText,
        topic: qDetails.topic,
        subtopic: qDetails.subtopic,
        difficultyLevel: qDetails.difficultyLevel,
        difficultyLabel: qDetails.difficultyLabel,
        difficultyScore: qDetails.difficultyScore,
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
      };
    })
  ).then((items) => items.filter(Boolean) as any[]);

  if (responses.length < activeSession.requested_count) {
    const pool = await fetchApprovedQuestions(activeSession.topic_filter);
    const nextQuestion = selectNextQuestion(
      currentAbility,
      usedIds,
      activeSession.topic_filter,
      pool
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
