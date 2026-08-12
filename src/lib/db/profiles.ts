/**
 * PARAKH — Profile Data Access
 *
 * Server-side operations for the `profiles` table.
 * Import only in Server Actions or API routes.
 *
 * Phase 5.1: Type stubs — implementations added in Phase 5.2 (auth integration).
 */

import type { ProfileRow, ProfileStudentUpdate } from "./types";

/**
 * Fetch a student's profile by their auth user ID.
 * Returns null if the profile does not exist yet.
 *
 * @param userId - The auth.users.id UUID
 */
export async function getProfile(userId: string): Promise<ProfileRow | null> {
  // Implementation: Phase 5.2 (auth integration)
  void userId;
  return null;
}

/**
 * Update mutable profile fields for a student.
 * The role field is NOT in ProfileStudentUpdate — it cannot be changed here.
 *
 * @param userId - The auth.users.id UUID
 * @param data   - Allowed fields: full_name, roll_number, institution
 */
export async function updateProfile(
  userId: string,
  data: ProfileStudentUpdate
): Promise<ProfileRow | null> {
  // Implementation: Phase 5.2 (auth integration)
  void userId;
  void data;
  return null;
}
