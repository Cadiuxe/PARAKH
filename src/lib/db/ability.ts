/**
 * PARAKH — Ability Estimates Data Access
 *
 * Server-side operations for the `ability_estimates` table.
 * Import only in Server Actions, API routes, or server components — never in client components.
 */

import { getSupabaseAdmin, isSupabaseServerConfigured } from "./server-client";
import { getTopicIdByCode } from "./topics";
import type { AbilityEstimateRow, AbilityEstimateInsert } from "./types";

const inMemoryAbility = new Map<string, AbilityEstimateRow>();

function isValidUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

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
    // Mixed assessments are meta-topic filters spanning multiple topics;
    // they do not map to a single topics.id foreign key row in PostgreSQL.
    if (est.topic_id === "Mixed" || !isValidUUID(est.student_id)) {
      const key = `${est.student_id}:${est.topic_id}`;
      const memRow: AbilityEstimateRow = {
        id: crypto.randomUUID(),
        student_id: est.student_id,
        topic_id: est.topic_id,
        ability: est.ability,
        total_questions: est.total_questions ?? 0,
        correct_count: est.correct_count ?? 0,
        updated_at: new Date().toISOString(),
      };
      inMemoryAbility.set(key, memRow);
      results.push(memRow);
      continue;
    }

    if (isSupabaseServerConfigured()) {
      // Resolve topic code ("DSA", "DBMS", "OS", "CN") to its database UUID
      const topicUuid = (await getTopicIdByCode(est.topic_id)) || est.topic_id;
      const admin = getSupabaseAdmin();
      const now = new Date().toISOString();
      const { data, error } = await admin
        .from("ability_estimates")
        .upsert(
          {
            student_id: est.student_id,
            topic_id: topicUuid,
            ability: est.ability,
            total_questions: est.total_questions ?? 0,
            correct_count: est.correct_count ?? 0,
            updated_at: now,
          },
          { onConflict: "student_id,topic_id" }
        )
        .select("id")
        .single();

      if (error) {
        console.error("[upsertAbilityEstimates] Supabase database error:", error.message);
        throw new Error(`Failed to persist ability estimate: ${error.message}`);
      }

      // Reconstruct from known inputs — no join needed
      const row: AbilityEstimateRow = {
        id: (data as any).id,
        student_id: est.student_id,
        topic_id: est.topic_id, // already the code ("DSA" etc.)
        ability: est.ability,
        total_questions: est.total_questions ?? 0,
        correct_count: est.correct_count ?? 0,
        updated_at: now,
      };
      results.push(row);
      continue;
    }

    // Explicit demo mode (when Supabase server credentials are not configured)
    const row: AbilityEstimateRow = {
      id: crypto.randomUUID(),
      student_id: est.student_id,
      topic_id: est.topic_id,
      ability: est.ability,
      total_questions: est.total_questions ?? 0,
      correct_count: est.correct_count ?? 0,
      updated_at: new Date().toISOString(),
    };
    const key = `${est.student_id}:${est.topic_id}`;
    inMemoryAbility.set(key, row);
    results.push(row);
  }

  return results;
}

/**
 * Fetch all per-topic ability estimates for a student.
 * Maps topics.id UUIDs back to topic codes ("DSA", "DBMS", etc.) for application consistency.
 *
 * @param studentId - UUID of the requesting student
 */
export async function getStudentAbility(
  studentId: string
): Promise<AbilityEstimateRow[]> {
  if (isSupabaseServerConfigured() && isValidUUID(studentId)) {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("ability_estimates")
      .select("*")
      .eq("student_id", studentId);

    if (error) {
      console.error("[getStudentAbility] Supabase database error:", error.message);
      throw new Error(`Failed to fetch student ability estimates: ${error.message}`);
    }

    const { getTopicCodeById } = await import("./topics");
    const list: AbilityEstimateRow[] = [];
    for (const row of data || []) {
      const topicCode = (await getTopicCodeById(row.topic_id)) || row.topic_id;
      list.push({
        id: row.id,
        student_id: row.student_id,
        topic_id: topicCode,
        ability: Number(row.ability),
        total_questions: row.total_questions ?? 0,
        correct_count: row.correct_count ?? 0,
        updated_at: row.updated_at,
      });
    }
    return list;
  }

  // Explicit demo mode / Non-UUID student ID
  const list: AbilityEstimateRow[] = [];
  for (const [key, val] of inMemoryAbility.entries()) {
    if (key.startsWith(`${studentId}:`)) {
      list.push(val);
    }
  }
  return list;
}
