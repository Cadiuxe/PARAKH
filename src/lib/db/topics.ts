/**
 * PARAKH — Topics Data Access & Code-to-UUID Mapping
 *
 * Provides canonical mapping between topic codes ("DSA", "DBMS", "OS", "CN")
 * and their database-backed topics.id UUIDs.
 */

import { getSupabaseAdmin, isSupabaseServerConfigured } from "./server-client";

export interface TopicItem {
  id: string; // uuid
  code: string; // "DSA" | "DBMS" | "OS" | "CN"
  name: string;
}

const topicCodeToIdCache = new Map<string, string>();
const topicIdToCodeCache = new Map<string, string>();

let cachedTopics: TopicItem[] | null = null;

/**
 * Fetch all topics from Supabase or memory cache.
 */
export async function getAllTopics(): Promise<TopicItem[]> {
  if (cachedTopics && cachedTopics.length > 0) {
    return cachedTopics;
  }

  if (isSupabaseServerConfigured()) {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("topics")
      .select("id, code, name")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[getAllTopics] Supabase database error:", error.message);
      throw new Error(`Failed to fetch topics: ${error.message}`);
    }

    if (data && data.length > 0) {
      for (const t of data) {
        topicCodeToIdCache.set(t.code, t.id);
        topicIdToCodeCache.set(t.id, t.code);
      }
      cachedTopics = data as TopicItem[];
      return cachedTopics;
    }
  }

  // Fallback default topics for demo / unconfigured mode
  const fallback = [
    { id: "11111111-1111-1111-1111-111111111101", code: "DSA", name: "Data Structures & Algorithms" },
    { id: "11111111-1111-1111-1111-111111111102", code: "DBMS", name: "Database Management Systems" },
    { id: "11111111-1111-1111-1111-111111111103", code: "OS", name: "Operating Systems" },
    { id: "11111111-1111-1111-1111-111111111104", code: "CN", name: "Computer Networks" },
  ];
  for (const t of fallback) {
    topicCodeToIdCache.set(t.code, t.id);
    topicIdToCodeCache.set(t.id, t.code);
  }
  return fallback;
}

/**
 * Resolve topic code (e.g. "DSA") to its corresponding topics.id UUID.
 */
export async function getTopicIdByCode(code: string): Promise<string | null> {
  if (code === "Mixed") return null;

  if (topicCodeToIdCache.has(code)) {
    return topicCodeToIdCache.get(code)!;
  }

  const topics = await getAllTopics();
  const match = topics.find((t) => t.code === code);
  if (match) {
    topicCodeToIdCache.set(match.code, match.id);
    topicIdToCodeCache.set(match.id, match.code);
    return match.id;
  }

  return null;
}

/**
 * Resolve topic UUID to its corresponding topic code (e.g. "DSA").
 */
export async function getTopicCodeById(id: string): Promise<string | null> {
  if (topicIdToCodeCache.has(id)) {
    return topicIdToCodeCache.get(id)!;
  }

  const topics = await getAllTopics();
  const match = topics.find((t) => t.id === id);
  if (match) {
    topicCodeToIdCache.set(match.code, match.id);
    topicIdToCodeCache.set(match.id, match.code);
    return match.code;
  }

  return null;
}
