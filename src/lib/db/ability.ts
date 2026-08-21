/**
 * PARAKH — Ability Estimates Data Access
 *
 * Server-side operations for the `ability_estimates` table.
 * Import only in Server Actions, API routes, or server components — never in client components.
 */

import { getSupabaseAdmin } from "./server-client";
import type { AbilityEstimateRow, AbilityEstimateInsert } from "./types";

const inMemoryAbility = new Map<string, AbilityEstimateRow>();

/**
 * Upsert rolling per-topic ability estimates for a student after an assessment session.
 *
 * @param estimates - Array of ability estimate data to upsert
 */
export async function upsertAbilityEstimates(
  estimates: AbilityEstimateInsert[]
): Promise<AbilityEstimateRow[]> {
  const results: AbilityEstimateRow[] = [];

  for (const est of estimates) {
    const row: AbilityEstimateRow = {
      id: est.id || `ab_${est.student_id}_${est.topic_id}`,
      student_id: est.student_id,
      topic_id: est.topic_id,
      ability: est.ability,
      total_questions: est.total_questions ?? 0,
      correct_count: est.correct_count ?? 0,
      updated_at: new Date().toISOString(),
    };

    try {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from("ability_estimates")
        .upsert(row, { onConflict: "student_id,topic_id" })
        .select()
        .single();

      if (!error && data) {
        results.push(data as AbilityEstimateRow);
        continue;
      }
    } catch {
      // Fallback
    }

    const key = `${est.student_id}:${est.topic_id}`;
    inMemoryAbility.set(key, row);
    results.push(row);
  }

  return results;
}

/**
 * Fetch all per-topic ability estimates for a student.
 *
 * @param studentId - UUID of the requesting student
 */
export async function getStudentAbility(
  studentId: string
): Promise<AbilityEstimateRow[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("ability_estimates")
      .select("*")
      .eq("student_id", studentId);

    if (!error && data) {
      return data as AbilityEstimateRow[];
    }
  } catch {
    // Fallback
  }

  const list: AbilityEstimateRow[] = [];
  for (const [key, val] of inMemoryAbility.entries()) {
    if (key.startsWith(`${studentId}:`)) {
      list.push(val);
    }
  }
  return list;
}
