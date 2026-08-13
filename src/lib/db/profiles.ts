/**
 * PARAKH — Profile Data Access
 *
 * Client and server-side profile operations for the `profiles` table.
 */

import { getSupabaseClient } from "./client";
import type { ProfileRow, ProfileStudentUpdate } from "./types";

/**
 * Fetch a student's profile by their auth user ID.
 * Returns null if the profile does not exist or fetch fails.
 *
 * @param userId - The auth.users.id UUID
 */
export async function getProfile(userId: string): Promise<ProfileRow | null> {
  if (!userId) return null;
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as ProfileRow;
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    return null;
  }
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
  if (!userId) return null;
  try {
    const supabase = getSupabaseClient();
    const { data: updated, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId)
      .select()
      .single();

    if (error || !updated) {
      console.error("Error updating profile:", error);
      return null;
    }
    return updated as ProfileRow;
  } catch (err) {
    console.error("Failed to update profile:", err);
    return null;
  }
}
