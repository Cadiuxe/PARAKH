/**
 * PARAKH — Ability Estimates Data Access
 *
 * Server-side operations for the `ability_estimates` table.
 * Import only in Server Actions or API routes — never in client components.
 *
 * Phase 5.1: Type stubs — implementations added in Phase 5.4/5.5.
 */

import type { AbilityEstimateRow, AbilityEstimateInsert } from "./types";

/**
 * Upsert rolling per-topic ability estimates for a student after an assessment session.
 *
 * Called server-side when an assessment finishes.
 * Writes to ability_estimates using the service_role client.
 *
 * @param estimates - Array of ability estimate data to upsert
 */
export async function upsertAbilityEstimates(
  estimates: AbilityEstimateInsert[]
): Promise<AbilityEstimateRow[]> {
  // Implementation: Phase 5.4 (database-backed assessment completion)
  void estimates;
  return [];
}

/**
 * Fetch all per-topic ability estimates for a student.
 * Used by the dashboard to show topic proficiency cards.
 *
 * @param studentId - UUID of the requesting student (auth.users.id)
 */
export async function getStudentAbility(
  studentId: string
): Promise<AbilityEstimateRow[]> {
  // Implementation: Phase 5.5 (dashboard from DB)
  void studentId;
  return [];
}
