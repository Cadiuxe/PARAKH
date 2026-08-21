/**
 * PARAKH Adaptive Engine
 *
 * Adaptive testing algorithm using continuous difficulty targeting (Phase 5.6),
 * continuous residual-based ability estimation (Phase 5.7),
 * refined selection with topic balancing (Phase 5.8),
 * and speed-weighted psychometric updates (Phase 5.9).
 *
 * Design goals:
 *  - Correct answer → ability increases dynamically based on item difficulty and speed
 *  - Incorrect/timed-out answer → ability decreases
 *  - Expected probability E = 1 / (1 + 10^(-(ability - difficultyScore) / 40))
 *  - Speed weight: correct → 1.0 + 0.20*(timeRemaining/totalTime); incorrect → 1.0 + 0.15*(timeRemaining/totalTime)
 *  - Delta = 15 * (y - E) * weight
 *  - Next question difficulty directly tracks current continuous ability (0–100)
 *  - No question repeats within one session
 *  - Topic filter is respected
 *
 * Ability and difficulty are on a continuous 0–100 scale.
 * Level centroids:
 *   1 (Easy)      → 15.00
 *   2 (Easy+)     → 30.00
 *   3 (Medium)    → 50.00
 *   4 (Hard)      → 70.00
 *   5 (Very Hard) → 88.00
 */

import { AssessmentQuestion, QUESTION_BANK, getDifficultyScoreFromLevel } from "./mock-data";

// ─── Constants ────────────────────────────────────────────────────────────────

export const INITIAL_ABILITY = 50;
export const TIMER_SECONDS = 90;
export const SPEED_BONUS_MAX = 25;      // maximum bonus points for instant correct answer
export const BASE_CORRECT_SCORE = 100;  // base points for a correct answer

// ─── Ability Updates ──────────────────────────────────────────────────────────

/**
 * Update the estimated ability after answering a question using speed-weighted continuous ability estimation (Phase 5.9).
 *
 * Expected probability formula:
 *   E = 1 / (1 + 10^(-(ability - difficultyScore) / 40))
 *
 * Speed weighting multiplier (bounded):
 *   timeRatio = clamp(timeRemainingSec / totalTimeSec, 0, 1)
 *   weight = correct ? 1.0 + 0.20 * timeRatio : 1.0 + 0.15 * timeRatio
 *   (If timeRemainingSec is omitted, weight defaults to 1.0 for backward compatibility)
 *
 * Delta adjustment:
 *   delta = 15 * (y - E) * weight, where y = 1 (correct) or 0 (incorrect)
 *
 * Properties:
 *  - Fast correct → stronger positive ability update
 *  - Slow correct → smaller positive update
 *  - Thoughtful incorrect → approximately baseline penalty
 *  - Very rapid incorrect → slightly stronger penalty
 *  - Timeout → incorrect with no speed weighting bonus (weight = 1.0)
 *
 * @param ability              Current ability estimate (0–100)
 * @param correct              Whether the answer was correct
 * @param difficultyScoreOrLevel Question's continuous difficultyScore (0–100) or legacy level (1–5)
 * @param timeRemainingSec     Optional seconds remaining when answered
 * @param totalTimeSec         Optional total allowed seconds (defaults to TIMER_SECONDS = 90)
 * @returns New continuous ability estimate clamped to [5, 100], rounded to 1 decimal place
 */
export function updateAbility(
  ability: number,
  correct: boolean,
  difficultyScoreOrLevel: number,
  timeRemainingSec?: number,
  totalTimeSec: number = TIMER_SECONDS
): number {
  // If a legacy integer difficulty level (1–5) is passed, map it to its continuous centroid
  const difficultyScore =
    difficultyScoreOrLevel >= 1 && difficultyScoreOrLevel <= 5 && Number.isInteger(difficultyScoreOrLevel)
      ? getDifficultyScoreFromLevel(difficultyScoreOrLevel)
      : difficultyScoreOrLevel;

  // Expected performance probability based on ability-difficulty difference
  const exponent = -(ability - difficultyScore) / 40;
  const expected = 1 / (1 + Math.pow(10, exponent));

  // Compute bounded speed-weighting multiplier
  let weight = 1.0;
  if (timeRemainingSec !== undefined && timeRemainingSec !== null) {
    const totalTime = totalTimeSec > 0 ? totalTimeSec : TIMER_SECONDS;
    const timeRatio = Math.max(0, Math.min(1, timeRemainingSec / totalTime));
    weight = correct ? 1.0 + 0.20 * timeRatio : 1.0 + 0.15 * timeRatio;
  }

  // Sensitivity constant K = 15
  const K = 15;
  const outcome = correct ? 1 : 0;
  const delta = K * (outcome - expected) * weight;

  const nextAbility = ability + delta;
  const clamped = Math.max(5, Math.min(100, nextAbility));

  // Round to 1 decimal place for clean persistence and presentation
  return Math.round(clamped * 10) / 10;
}

// ─── Target Difficulty ────────────────────────────────────────────────────────

/**
 * Continuous target difficulty is directly the student's current ability score.
 *
 * @param ability Current ability estimate (0–100)
 * @returns Target difficulty on 0–100 scale
 */
export function targetDifficultyScore(ability: number): number {
  return Math.max(0, Math.min(100, ability));
}

/**
 * Legacy discrete target difficulty level helper (kept for backward compatibility).
 */
export function targetDifficulty(ability: number): number {
  if (ability < 30) return 1;
  if (ability < 48) return 2;
  if (ability < 65) return 3;
  if (ability < 82) return 4;
  return 5;
}

// ─── Question Selection ───────────────────────────────────────────────────────

/**
 * Select the next question adaptively using refined continuous difficulty targeting (Phase 5.8).
 *
 * Ranking & Selection Strategy:
 *  1. Eligibility Filter:
 *     - Exclude questions whose ID is in `usedIds`.
 *     - Restrict to `topic` (or allow all if "Mixed").
 *     - Return null if eligible pool is empty (pool exhausted).
 *
 *  2. Continuous Distance Minimization:
 *     - Target difficulty = clamped ability (0–100).
 *     - For each eligible question, compute absolute distance |difficultyScore - target|.
 *     - Find the minimum distance (minDistance) in the eligible pool.
 *     - Collect top candidates whose distance is within a tight proximity tolerance (tolerance = 5.0).
 *
 *  3. Topic Balancing for Mixed Assessments:
 *     - When topic === "Mixed", count how many questions from each topic have already been used in this session.
 *     - Determine the minimum usage count among the top difficulty candidates.
 *     - Filter candidates to those belonging to the least-represented topic(s) so far.
 *
 *  4. Controlled Random Tie-Breaking:
 *     - Select uniformly at random among remaining candidates with equal top-tier priority.
 *
 * @param ability      Current student ability estimate (0–100)
 * @param usedIds      Set of question IDs already used in this session
 * @param topic        "Mixed" or a specific topic code ("DSA", "DBMS", "OS", "CN")
 * @param questionBank Optional pool override (defaults to QUESTION_BANK)
 * @returns            The selected question or null if pool is exhausted
 */
export function selectNextQuestion(
  ability: number,
  usedIds: Set<string>,
  topic: string,
  questionBank: AssessmentQuestion[] = QUESTION_BANK
): AssessmentQuestion | null {
  // 1. Build the eligible pool (unanswered questions matching topic filter)
  const pool = questionBank.filter((q) => {
    if (usedIds.has(q.id)) return false;
    if (topic !== "Mixed" && q.topic !== topic) return false;
    return true;
  });

  if (pool.length === 0) return null;

  // 2. Continuous distance minimization
  const target = targetDifficultyScore(ability);
  let minDistance = Infinity;
  for (const q of pool) {
    const dist = Math.abs(q.difficultyScore - target);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  // Collect top candidates within proximity tolerance
  const tolerance = 5.0;
  const closestCandidates = pool.filter(
    (q) => Math.abs(q.difficultyScore - target) <= minDistance + tolerance
  );

  // 3. Multi-topic session balancing for Mixed assessments
  if (topic === "Mixed" && closestCandidates.length > 1) {
    // Count questions per topic already used in the current session
    const topicUsage = new Map<string, number>();
    for (const q of questionBank) {
      if (usedIds.has(q.id)) {
        topicUsage.set(q.topic, (topicUsage.get(q.topic) || 0) + 1);
      }
    }

    // Find the minimum representation count among the closest candidates' topics
    let minTopicCount = Infinity;
    for (const q of closestCandidates) {
      const count = topicUsage.get(q.topic) || 0;
      if (count < minTopicCount) {
        minTopicCount = count;
      }
    }

    // Retain only candidates from the least-represented topic(s)
    const balancedCandidates = closestCandidates.filter(
      (q) => (topicUsage.get(q.topic) || 0) === minTopicCount
    );

    if (balancedCandidates.length > 0) {
      return balancedCandidates[Math.floor(Math.random() * balancedCandidates.length)];
    }
  }

  // 4. Controlled uniform random selection among top candidate ties
  return closestCandidates[Math.floor(Math.random() * closestCandidates.length)];
}

// ─── Speed Bonus ──────────────────────────────────────────────────────────────

/**
 * Calculate the speed bonus for a correct answer.
 *
 * bonus = floor(SPEED_BONUS_MAX × remainingTime / totalTime)
 *
 * Maximum: SPEED_BONUS_MAX (e.g., 25) for an instant answer.
 * Minimum: 0 (no bonus for an incorrect answer or timeout).
 *
 * @param correct        Whether the answer was correct
 * @param remainingTime  Seconds remaining when the student submitted
 * @param totalTime      Total time allowed per question
 * @returns              Speed bonus points (0–SPEED_BONUS_MAX)
 */
export function calculateSpeedBonus(
  correct: boolean,
  remainingTime: number,
  totalTime: number
): number {
  if (!correct) return 0;
  return Math.floor(SPEED_BONUS_MAX * (remainingTime / totalTime));
}

/**
 * Calculate the score for a single question response.
 *
 * @param correct        Whether the answer was correct
 * @param remainingTime  Seconds remaining when answered
 * @param totalTime      Total seconds allowed
 * @returns              { base, bonus, total }
 */
export function questionScore(
  correct: boolean,
  remainingTime: number,
  totalTime: number
): { base: number; bonus: number; total: number } {
  if (!correct) return { base: 0, bonus: 0, total: 0 };
  const bonus = calculateSpeedBonus(correct, remainingTime, totalTime);
  return { base: BASE_CORRECT_SCORE, bonus, total: BASE_CORRECT_SCORE + bonus };
}

// ─── Pre-Assessment / Ability Prior (Phase 5.10) ──────────────────────────────

export type SelfAssessmentTier =
  | "novice"
  | "beginner"
  | "intermediate"
  | "proficient"
  | "advanced";

export const SELF_ASSESSMENT_ANCHORS: Record<SelfAssessmentTier, number> = {
  novice: 20.0,
  beginner: 35.0,
  intermediate: 50.0,
  proficient: 65.0,
  advanced: 80.0,
};

/**
 * Retrieve exactly 5 diagnostic questions with a deliberate difficulty spread (Levels 1–5).
 *
 * @param topic "DSA" | "DBMS" | "OS" | "CN" | "Mixed"
 * @param questionBank Optional pool override
 * @returns Array of exactly 5 diagnostic questions
 */
export function getDiagnosticQuestions(
  topic: string,
  questionBank: AssessmentQuestion[] = QUESTION_BANK
): AssessmentQuestion[] {
  const levels = [1, 2, 3, 4, 5];
  const diagnostic: AssessmentQuestion[] = [];
  const used = new Set<string>();

  if (topic === "Mixed") {
    // Spread across the 4 core topics and 5 levels: DSA(L1), DBMS(L2), OS(L3), CN(L4), and mixed L5
    const mixedSpecs = [
      { topic: "DSA", level: 1 },
      { topic: "DBMS", level: 2 },
      { topic: "OS", level: 3 },
      { topic: "CN", level: 4 },
      { topic: "DSA", level: 5 },
    ];
    for (const spec of mixedSpecs) {
      const match =
        questionBank.find(
          (q) => !used.has(q.id) && q.topic === spec.topic && q.difficultyLevel === spec.level
        ) || questionBank.find((q) => !used.has(q.id) && q.difficultyLevel === spec.level);
      if (match) {
        used.add(match.id);
        diagnostic.push(match);
      }
    }
  } else {
    // Single topic: pick 1 question per difficulty level (1 to 5)
    for (const lvl of levels) {
      const match =
        questionBank.find(
          (q) => !used.has(q.id) && q.topic === topic && q.difficultyLevel === lvl
        ) || questionBank.find((q) => !used.has(q.id) && q.topic === topic);
      if (match) {
        used.add(match.id);
        diagnostic.push(match);
      }
    }
  }

  return diagnostic;
}

/**
 * Calculate diagnostic ability from the 5 diagnostic question results.
 *
 * @param results Array of correctness and difficultyScore for the 5 diagnostic items
 * @returns Diagnostic ability estimate (20.0–85.0)
 */
export function calculateDiagnosticAbility(
  results: Array<{ isCorrect: boolean; difficultyScore: number }>
): number {
  if (results.length === 0) return INITIAL_ABILITY;

  const correctCount = results.filter((r) => r.isCorrect).length;
  // Discrete base calibration anchors
  const baseAnchors = [20.0, 35.0, 45.0, 55.0, 70.0, 85.0];
  let baseAbility = baseAnchors[Math.min(correctCount, 5)];

  // Fine-tune with difficulties of questions answered correctly
  if (correctCount > 0 && correctCount < 5) {
    const avgCorrectDiff =
      results.filter((r) => r.isCorrect).reduce((sum, r) => sum + r.difficultyScore, 0) /
      correctCount;
    // Slight adjustment (+/- up to 3 points) based on difficulty of items solved
    baseAbility += Math.max(-3, Math.min(3, (avgCorrectDiff - 50) * 0.1));
  }

  return Math.round(Math.max(15, Math.min(88, baseAbility)) * 10) / 10;
}

/**
 * Calculate the overall ability prior by combining diagnostic evidence, optional self-assessment,
 * historical ability, and shrinkage toward the 50.0 baseline.
 *
 * @param params Object containing diagnosticAbility, optional selfAssessmentTier, and optional historicalAbility
 * @returns Calibrated starting ability on [15, 88] rounded to 1 decimal place
 */
export function calculateAbilityPrior(params: {
  diagnosticAbility: number;
  selfAssessmentTier?: string | null;
  historicalAbility?: number | null;
}): number {
  const { diagnosticAbility, selfAssessmentTier, historicalAbility } = params;

  // 1. Incorporate optional self-assessment
  let prior = diagnosticAbility;
  if (selfAssessmentTier && selfAssessmentTier in SELF_ASSESSMENT_ANCHORS) {
    const anchor = SELF_ASSESSMENT_ANCHORS[selfAssessmentTier as SelfAssessmentTier];
    // Weight diagnostic evidence 70%, self-assessment 30%
    prior = 0.7 * diagnosticAbility + 0.3 * anchor;
  }

  // 2. Incorporate historical ability if returning student
  if (historicalAbility !== undefined && historicalAbility !== null && !isNaN(historicalAbility)) {
    // Dynamic recalibration: 65% diagnostic evidence, 35% historical ability
    prior = 0.65 * prior + 0.35 * historicalAbility;
  } else {
    // Moderate Bayesian shrinkage toward population baseline 50.0
    prior = 0.85 * prior + 0.15 * INITIAL_ABILITY;
  }

  return Math.round(Math.max(15, Math.min(88, prior)) * 10) / 10;
}
