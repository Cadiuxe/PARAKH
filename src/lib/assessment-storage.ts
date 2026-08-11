/**
 * PARAKH Local Assessment Persistence & Analytics Engine
 *
 * Provides a single source of truth for persisting and retrieving completed assessment
 * results in localStorage, and calculating real student analytics from actual sessions.
 */

import { AssessmentQuestion } from "./mock-data";

export interface QuestionResponseResult {
  questionId: string;
  question: AssessmentQuestion;
  selectedIndex: number; // -1 = timed out
  correct: boolean;
  abilityBefore: number;
  abilityAfter: number;
  timeRemaining: number;
  base: number;
  bonus: number;
  score: number;
}

export interface CompletedAssessment {
  id: string;
  completedAt: string; // ISO string
  formattedDate: string; // e.g., "Aug 11, 2026 • 9:30 PM"
  topic: string; // "Mixed", "DSA", "DBMS", "OS", "CN"
  questionCount: number; // 5, 10, 15
  correctCount: number;
  percentageScore: number; // 0 - 100
  totalScore: number; // sum of base + bonus
  totalBonus: number;
  abilityStart: number;
  abilityFinal: number;
  abilityDelta: number;
  results: QuestionResponseResult[];
}

export interface TopicAnalytics {
  id: string;
  name: string;
  code: string;
  proficiency: number; // 0-100
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number; // 0-100
  status: "Not Assessed" | "Needs Work" | "Developing" | "Strong";
  color: string;
  assessed: boolean;
}

export interface StrengthOrWeakness {
  topic: string;
  detail: string;
  recommendedAction?: string;
}

const STORAGE_KEY = "parakh:assessments";

/**
 * Safely load all completed assessments from localStorage.
 */
export function getStoredAssessments(): CompletedAssessment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error("Failed to read assessments from localStorage:", err);
    return [];
  }
}

/**
 * Persist a newly completed assessment to localStorage.
 */
export function saveCompletedAssessment(assessment: CompletedAssessment): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredAssessments();
    // Add to the beginning (latest first)
    const updated = [assessment, ...existing.filter((a) => a.id !== assessment.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save assessment to localStorage:", err);
  }
}

/**
 * Retrieve a specific assessment by ID.
 */
export function getAssessmentById(id: string): CompletedAssessment | null {
  const all = getStoredAssessments();
  return all.find((a) => a.id === id) || null;
}

/**
 * Retrieve the most recently completed assessment.
 */
export function getLatestAssessment(): CompletedAssessment | null {
  const all = getStoredAssessments();
  return all.length > 0 ? all[0] : null;
}

/**
 * Clear all assessment history (useful for testing or reset).
 */
export function clearAssessmentHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear assessment history:", err);
  }
}

/**
 * Map ability value to a human-readable proficiency level descriptor.
 */
export function getAbilityLevelLabel(ability: number): string {
  if (ability < 35) return "Beginner";
  if (ability < 50) return "Elementary";
  if (ability < 68) return "Intermediate";
  if (ability < 84) return "Advanced";
  return "Expert";
}

const TOPIC_METADATA = [
  { id: "dsa", name: "Data Structures & Algorithms", code: "DSA", color: "#6366f1" },
  { id: "os", name: "Operating Systems", code: "OS", color: "#06b6d4" },
  { id: "dbms", name: "Database Management Systems", code: "DBMS", color: "#f59e0b" },
  { id: "cn", name: "Computer Networks", code: "CN", color: "#ec4899" },
];

/**
 * Calculate topic breakdown based strictly on questions answered in real assessments.
 */
export function calculateTopicAnalytics(assessments: CompletedAssessment[]): TopicAnalytics[] {
  // Aggregate topic stats
  const topicStats: Record<string, { total: number; correct: number; abilitySum: number }> = {
    DSA: { total: 0, correct: 0, abilitySum: 0 },
    OS: { total: 0, correct: 0, abilitySum: 0 },
    DBMS: { total: 0, correct: 0, abilitySum: 0 },
    CN: { total: 0, correct: 0, abilitySum: 0 },
  };

  for (const asmt of assessments) {
    for (const res of asmt.results) {
      const t = res.question.topic;
      if (topicStats[t]) {
        topicStats[t].total += 1;
        if (res.correct) topicStats[t].correct += 1;
        topicStats[t].abilitySum += res.abilityAfter;
      }
    }
  }

  return TOPIC_METADATA.map((meta) => {
    const stats = topicStats[meta.code] || { total: 0, correct: 0, abilitySum: 0 };
    const assessed = stats.total > 0;
    const accuracy = assessed ? Math.round((stats.correct / stats.total) * 100) : 0;
    const avgAbility = assessed ? Math.round(stats.abilitySum / stats.total) : 0;
    const proficiency = assessed ? Math.min(100, Math.round((accuracy * 0.6) + (avgAbility * 0.4))) : 0;

    let status: TopicAnalytics["status"] = "Not Assessed";
    if (assessed) {
      if (proficiency >= 78) status = "Strong";
      else if (proficiency >= 62) status = "Developing";
      else status = "Needs Work";
    }

    return {
      id: meta.id,
      name: meta.name,
      code: meta.code,
      proficiency,
      totalQuestions: stats.total,
      correctQuestions: stats.correct,
      accuracy,
      status,
      color: meta.color,
      assessed,
    };
  });
}

/**
 * Derive strengths and areas to improve strictly from real topic analytics.
 */
export function calculateInsights(topicAnalytics: TopicAnalytics[]): {
  strengths: StrengthOrWeakness[];
  areasToImprove: StrengthOrWeakness[];
} {
  const assessedTopics = topicAnalytics.filter((t) => t.assessed);

  const strengths: StrengthOrWeakness[] = [];
  const areasToImprove: StrengthOrWeakness[] = [];

  for (const topic of assessedTopics) {
    if (topic.proficiency >= 75) {
      strengths.push({
        topic: topic.name,
        detail: `Strong accuracy (${topic.accuracy}%) across ${topic.totalQuestions} answered items.`,
      });
    } else if (topic.proficiency < 65) {
      areasToImprove.push({
        topic: topic.name,
        detail: `Accuracy is ${topic.accuracy}% across ${topic.totalQuestions} items.`,
        recommendedAction: `Focus on foundational ${topic.code} concepts and practice medium difficulty items.`,
      });
    }
  }

  return { strengths, areasToImprove };
}
