/**
 * PARAKH Adaptive Engine
 *
 * Adaptive testing algorithm using continuous difficulty targeting (Phase 5.6)
 * and continuous residual-based ability estimation (Phase 5.7).
 *
 * Design goals:
 *  - Correct answer → ability increases dynamically based on item difficulty: delta = K * (1 - E)
 *  - Incorrect/timed-out answer → ability decreases: delta = K * (0 - E)
 *  - Expected probability E = 1 / (1 + 10^(-(ability - difficultyScore) / 40))
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
 * Update the estimated ability after answering a question using continuous ability estimation (Phase 5.7).
 *
 * Expected probability formula:
 *   E = 1 / (1 + 10^(-(ability - difficultyScore) / 40))
 *
 * Delta adjustment:
 *   delta = K * (y - E), where K = 15 and y = 1 (correct) or 0 (incorrect)
 *
 * Properties:
 *  - Correct on harder question (d > ability): larger reward (+7.5 to +14.5)
 *  - Correct on easier question (d < ability): smaller reward (+0.5 to +7.5)
 *  - Incorrect on easier question (d < ability): larger penalty (-7.5 to -14.5)
 *  - Incorrect on harder question (d > ability): smaller penalty (-0.5 to -7.5)
 *  - Matched question (d = ability): ±7.5
 *
 * @param ability              Current ability estimate (0–100)
 * @param correct              Whether the answer was correct
 * @param difficultyScoreOrLevel Question's continuous difficultyScore (0–100) or legacy level (1–5)
 * @returns New continuous ability estimate clamped to [5, 100], rounded to 1 decimal place
 */
export function updateAbility(
  ability: number,
  correct: boolean,
  difficultyScoreOrLevel: number
): number {
  // If a legacy integer difficulty level (1–5) is passed, map it to its continuous centroid
  const difficultyScore =
    difficultyScoreOrLevel >= 1 && difficultyScoreOrLevel <= 5 && Number.isInteger(difficultyScoreOrLevel)
      ? getDifficultyScoreFromLevel(difficultyScoreOrLevel)
      : difficultyScoreOrLevel;

  // Expected performance probability based on ability-difficulty difference
  const exponent = -(ability - difficultyScore) / 40;
  const expected = 1 / (1 + Math.pow(10, exponent));

  // Sensitivity constant K = 15
  const K = 15;
  const outcome = correct ? 1 : 0;
  const delta = K * (outcome - expected);

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
 * Select the next question adaptively using continuous difficulty targeting.
 *
 * Strategy:
 *  1. Filter by topic (or "Mixed" = all topics).
 *  2. Exclude already-used question IDs.
 *  3. Calculate distance between each question's difficultyScore (0–100) and current ability.
 *  4. Find the closest difficulty distance available in the eligible pool.
 *  5. Collect candidates within a tight proximity tolerance to balance deterministic difficulty
 *     proximity with randomness among equally suitable items.
 *  6. Select uniformly at random among top candidates.
 *  7. Return null if no question is available (pool exhausted).
 *
 * @param ability      Current ability estimate (0–100)
 * @param usedIds      Set of question IDs already used this session
 * @param topic        "Mixed" or a specific topic ("DSA", "DBMS", "OS", "CN")
 * @param questionBank Optional pool override (defaults to QUESTION_BANK)
 * @returns            The selected question or null
 */
export function selectNextQuestion(
  ability: number,
  usedIds: Set<string>,
  topic: string,
  questionBank: AssessmentQuestion[] = QUESTION_BANK
): AssessmentQuestion | null {
  // 1. Build the eligible pool
  const pool = questionBank.filter((q) => {
    if (usedIds.has(q.id)) return false;
    if (topic !== "Mixed" && q.topic !== topic) return false;
    return true;
  });

  if (pool.length === 0) return null;

  // 2. Find minimum distance to target continuous ability
  const target = targetDifficultyScore(ability);
  let minDistance = Infinity;
  for (const q of pool) {
    const dist = Math.abs(q.difficultyScore - target);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  // 3. Gather candidates that are closest to the target (within small tolerance)
  const tolerance = 5;
  const candidates = pool.filter(
    (q) => Math.abs(q.difficultyScore - target) <= minDistance + tolerance
  );

  // 4. Randomly pick one among equally closest candidates
  return candidates[Math.floor(Math.random() * candidates.length)];
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
