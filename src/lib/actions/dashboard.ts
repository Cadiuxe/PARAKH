"use server";

/**
 * PARAKH — Database-Backed Student Dashboard Server Actions
 * Phase 5.4: Database-backed Student Dashboard
 *
 * Provides server-authoritative aggregation of student assessment performance,
 * ability progression, per-topic proficiency breakdown, strengths, areas to improve,
 * and recent assessment history directly from Supabase tables:
 * - public.sessions
 * - public.responses
 * - public.ability_estimates
 *
 * Lifetime totals (totalSessions, totalQuestions, topicAnalytics, avgProficiency,
 * currentAbility, strengths, areasToImprove, chartData) are computed from ALL
 * completed sessions — no arbitrary cap.
 *
 * recentSessions (displayed in the Recent Assessments card) is capped at
 * RECENT_DISPLAY_LIMIT (4) for display purposes only.
 */

import { getAuthenticatedStudent } from "./assessment";
import { getStudentSessions } from "@/lib/db/sessions";
import { getResponsesForSessions } from "@/lib/db/responses";
import { getAbilityLevelLabel } from "@/lib/assessment-storage";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface DashboardSessionSummary {
  id: string;
  topic: string;
  completedAt: string;
  formattedDate: string;
  questionCount: number;
  correctCount: number;
  percentageScore: number;
  totalScore: number;
  totalBonus: number;
  abilityStart: number;
  abilityFinal: number;
  abilityDelta: number;
}

export interface DashboardTopicAnalytics {
  id: string;
  name: string;
  code: string;
  /** Composite proficiency score 0–100 (60% accuracy + 40% avg ability). */
  proficiency: number;
  totalQuestions: number;
  correctQuestions: number;
  /** Raw accuracy 0–100 (% correct). */
  accuracy: number;
  status: "Not Assessed" | "Needs Work" | "Developing" | "Strong";
  color: string;
  assessed: boolean;
}

export interface DashboardInsightItem {
  topic: string;
  detail: string;
  recommendedAction?: string;
}

export interface DashboardChartPoint {
  label: string;
  ability: number;
  topic?: string;
}

export interface StudentDashboardData {
  hasData: boolean;
  studentId: string | null;
  /** Lifetime count of ALL completed sessions (no display cap). */
  totalSessions: number;
  /** Lifetime count of ALL answered questions across ALL completed sessions. */
  totalQuestions: number;
  /** Average percentage score across ALL completed sessions. */
  avgProficiency: number;
  latestSession: DashboardSessionSummary | null;
  currentAbility: number;
  currentAbilityLabel: string;
  chartData: DashboardChartPoint[];
  chartSubtitle: string;
  /** Per-topic breakdown computed from ALL sessions (no cap). */
  topicAnalytics: DashboardTopicAnalytics[];
  strengths: DashboardInsightItem[];
  areasToImprove: DashboardInsightItem[];
  /** Most recent RECENT_DISPLAY_LIMIT sessions shown in the Recent Assessments card. */
  recentSessions: DashboardSessionSummary[];
}

// ---------------------------------------------------------------------------
// Constants / helpers
// ---------------------------------------------------------------------------

const TOPIC_METADATA = [
  { id: "dsa", name: "Data Structures & Algorithms", code: "DSA", color: "#6366f1" },
  { id: "os", name: "Operating Systems", code: "OS", color: "#06b6d4" },
  { id: "dbms", name: "Database Management Systems", code: "DBMS", color: "#f59e0b" },
  { id: "cn", name: "Computer Networks", code: "CN", color: "#ec4899" },
];

/** Number of sessions shown in the Recent Assessments display card. */
const RECENT_DISPLAY_LIMIT = 4;

function formatSessionDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Recently";
    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${dateStr} • ${timeStr}`;
  } catch {
    return "Recently";
  }
}

function getDefaultTopicAnalytics(): DashboardTopicAnalytics[] {
  return TOPIC_METADATA.map((meta) => ({
    id: meta.id,
    name: meta.name,
    code: meta.code,
    proficiency: 0,
    totalQuestions: 0,
    correctQuestions: 0,
    accuracy: 0,
    status: "Not Assessed",
    color: meta.color,
    assessed: false,
  }));
}

type SessionRow = {
  id: string;
  topic_filter: string;
  completed_at: string | null;
  started_at: string;
  actual_count: number;
  requested_count: number;
  correct_count: number;
  percentage_score: number;
  total_score: number;
  total_bonus: number;
  ability_start: number;
  ability_final: number;
  ability_delta: number;
};

function mapSessionSummary(s: SessionRow): DashboardSessionSummary {
  return {
    id: s.id,
    topic: s.topic_filter,
    completedAt: s.completed_at || s.started_at,
    formattedDate: formatSessionDate(s.completed_at || s.started_at),
    questionCount: s.actual_count || s.requested_count,
    correctCount: s.correct_count,
    percentageScore: s.percentage_score,
    totalScore: s.total_score,
    totalBonus: s.total_bonus,
    abilityStart: s.ability_start,
    abilityFinal: s.ability_final,
    abilityDelta: s.ability_delta,
  };
}

const EMPTY_STATE = (studentId: string | null): StudentDashboardData => ({
  hasData: false,
  studentId,
  totalSessions: 0,
  totalQuestions: 0,
  avgProficiency: 0,
  latestSession: null,
  currentAbility: 50,
  currentAbilityLabel: "Not Assessed",
  chartData: [],
  chartSubtitle: "Real ability progression derived from completed sessions.",
  topicAnalytics: getDefaultTopicAnalytics(),
  strengths: [],
  areasToImprove: [],
  recentSessions: [],
});

// ---------------------------------------------------------------------------
// Main server action
// ---------------------------------------------------------------------------

/**
 * Fetch and aggregate database-persisted performance statistics for the
 * authenticated student.
 *
 * Lifetime aggregate stats (totalSessions, totalQuestions, topicAnalytics,
 * avgProficiency, strengths, areasToImprove, chartData) are computed over
 * ALL completed sessions — never capped.
 *
 * recentSessions is limited to the latest RECENT_DISPLAY_LIMIT sessions for
 * the display card only.
 */
export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  const student = await getAuthenticatedStudent();
  if (!student) return EMPTY_STATE(null);

  // 1. Fetch completed sessions — capped at 200 (more than enough for this prototype)
  const allSessions = await getStudentSessions(student.id, 200);
  if (!allSessions || allSessions.length === 0) return EMPTY_STATE(student.id);

  // 2. Map all sessions to summary objects (newest-first from DB).
  const allSessionSummaries: DashboardSessionSummary[] = allSessions.map(mapSessionSummary);

  const latestSession = allSessionSummaries[0] || null;
  const totalSessions = allSessionSummaries.length;
  const totalQuestions = allSessionSummaries.reduce((sum, s) => sum + s.questionCount, 0);
  const avgProficiency = Math.round(
    allSessionSummaries.reduce((sum, s) => sum + s.percentageScore, 0) / totalSessions
  );
  const currentAbility = latestSession ? latestSession.abilityFinal : 50;
  const currentAbilityLabel = latestSession
    ? getAbilityLevelLabel(latestSession.abilityFinal)
    : "Not Assessed";

  // 3. Slice the display list (newest-first, capped for the card UI).
  const recentSessions = allSessionSummaries.slice(0, RECENT_DISPLAY_LIMIT);

  // 4. Accumulate lifetime topic stats from ALL sessions in parallel
  const topicStats: Record<string, { total: number; correct: number; abilitySum: number }> = {
    DSA: { total: 0, correct: 0, abilitySum: 0 },
    OS: { total: 0, correct: 0, abilitySum: 0 },
    DBMS: { total: 0, correct: 0, abilitySum: 0 },
    CN: { total: 0, correct: 0, abilitySum: 0 },
  };

  // 4. Batch-fetch ALL responses for ALL sessions in a single Supabase query
  const sessionIds = allSessions.map((s) => s.id);
  const responsesBySession = await getResponsesForSessions(sessionIds);
  const sessionResponsesList = allSessions.map((s) => responsesBySession.get(s.id) || []);

  for (const sessionResponses of sessionResponsesList) {
    for (const resp of sessionResponses) {
      const code = resp.topic_code;
      if (topicStats[code]) {
        topicStats[code].total += 1;
        if (resp.is_correct) topicStats[code].correct += 1;
        topicStats[code].abilitySum += resp.ability_after;
      }
    }
  }

  // 5. Compute per-topic proficiency & status.
  const topicAnalytics: DashboardTopicAnalytics[] = TOPIC_METADATA.map((meta) => {
    const stats = topicStats[meta.code] || { total: 0, correct: 0, abilitySum: 0 };
    const assessed = stats.total > 0;
    const accuracy = assessed ? Math.round((stats.correct / stats.total) * 100) : 0;
    const avgAbility = assessed ? Math.round(stats.abilitySum / stats.total) : 0;
    const proficiency = assessed ? Math.min(100, Math.round(accuracy * 0.6 + avgAbility * 0.4)) : 0;

    let status: DashboardTopicAnalytics["status"] = "Not Assessed";
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

  // 6. Generate strengths & areas to improve from lifetime topic analytics.
  const strengths: DashboardInsightItem[] = [];
  const areasToImprove: DashboardInsightItem[] = [];

  for (const topic of topicAnalytics) {
    if (topic.assessed) {
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
  }

  // 7. Build ability trajectory chart data.
  let chartData: DashboardChartPoint[] = [];
  let chartSubtitle = "Real ability progression derived from completed sessions.";

  if (totalSessions === 1 && allSessions[0]) {
    // 1 session: question-by-question progression using already fetched responses
    const singleSessionResponses = sessionResponsesList[0] || [];
    chartSubtitle = `Question-by-question ability trajectory for latest ${allSessions[0].topic_filter} session.`;
    chartData = singleSessionResponses.map((r, idx) => ({
      label: `Q${idx + 1}`,
      ability: r.ability_after,
      topic: r.topic_code,
    }));
  } else {
    // Multiple sessions: oldest-to-newest across ALL sessions.
    chartSubtitle = `Ability progression across all ${totalSessions} completed sessions.`;
    const sortedOldestFirst = [...allSessionSummaries].reverse();
    chartData = sortedOldestFirst.map((s, idx) => ({
      label: `S${idx + 1} (${s.topic})`,
      ability: s.abilityFinal,
      topic: s.topic,
    }));
  }

  return {
    hasData: true,
    studentId: student.id,
    totalSessions,
    totalQuestions,
    avgProficiency,
    latestSession,
    currentAbility,
    currentAbilityLabel,
    chartData,
    chartSubtitle,
    topicAnalytics,
    strengths,
    areasToImprove,
    recentSessions,
  };
}
