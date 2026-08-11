/**
 * PARAKH Adaptive Engine
 *
 * A simple, transparent rule-based adaptive algorithm.
 *
 * Design goals:
 *  - Correct answer → ability increases
 *  - Incorrect/timed-out answer → ability decreases
 *  - Next question difficulty tracks current ability
 *  - No question repeats within one session
 *  - Topic filter is respected
 *
 * Ability is on a 0–100 scale.
 * Difficulty levels map as follows:
 *   1 (Easy)      → ability 0–30
 *   2 (Easy+)     → ability 25–45
 *   3 (Medium)    → ability 40–65
 *   4 (Hard)      → ability 60–85
 *   5 (Very Hard) → ability 80–100
 */

import { AssessmentQuestion, QUESTION_BANK } from "./mock-data";

// ─── Constants ────────────────────────────────────────────────────────────────

export const INITIAL_ABILITY = 50;
export const TIMER_SECONDS = 90;
export const SPEED_BONUS_MAX = 25;      // maximum bonus points for instant correct answer
export const BASE_CORRECT_SCORE = 100;  // base points for a correct answer

// ─── Ability Updates ──────────────────────────────────────────────────────────

/**
 * Update the estimated ability after answering a question.
 *
 * @param ability   Current ability estimate (0–100)
 * @param correct   Whether the answer was correct
 * @param level     Difficulty level of the question (1–5)
 * @returns New ability estimate clamped to [5, 100]
 */
export function updateAbility(ability: number, correct: boolean, level: number): number {
  // How much the ability changes depends on question difficulty
  // Correct on hard question = bigger reward; wrong on easy question = bigger penalty
  const delta = level * 3; // e.g., level 3 → ±9, level 5 → ±15

  const next = correct ? ability + delta : ability - delta;
  return Math.max(5, Math.min(100, next));
}

// ─── Target Difficulty ────────────────────────────────────────────────────────

/**
 * Determine the target difficulty level for the next question
 * given the current ability estimate.
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
 * Select the next question adaptively.
 *
 * Strategy:
 *  1. Filter by topic (or "Mixed" = all topics).
 *  2. Exclude already-used question IDs.
 *  3. Prefer questions at the target difficulty (based on current ability).
 *  4. Fall back to adjacent difficulties if no exact match is available.
 *  5. Return null if no question is available (pool exhausted).
 *
 * @param ability    Current ability estimate
 * @param usedIds    Set of question IDs already used this session
 * @param topic      "Mixed" or a specific topic ("DSA", "DBMS", "OS", "CN")
 * @returns          The selected question or null
 */
export function selectNextQuestion(
  ability: number,
  usedIds: Set<string>,
  topic: string
): AssessmentQuestion | null {
  // 1. Build the eligible pool
  const pool = QUESTION_BANK.filter((q) => {
    if (usedIds.has(q.id)) return false;
    if (topic !== "Mixed" && q.topic !== topic) return false;
    return true;
  });

  if (pool.length === 0) return null;

  // 2. Determine target difficulty
  const target = targetDifficulty(ability);

  // 3. Try to find a question at the exact target difficulty
  const exact = pool.filter((q) => q.difficultyLevel === target);
  if (exact.length > 0) {
    return exact[Math.floor(Math.random() * exact.length)];
  }

  // 4. Expand search by proximity (distance from target)
  for (let delta = 1; delta <= 4; delta++) {
    const adjacent = pool.filter(
      (q) =>
        q.difficultyLevel === target + delta ||
        q.difficultyLevel === target - delta
    );
    if (adjacent.length > 0) {
      return adjacent[Math.floor(Math.random() * adjacent.length)];
    }
  }

  // 5. No questions left — return null
  return null;
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
