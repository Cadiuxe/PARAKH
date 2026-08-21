/**
 * PARAKH Pre-Assessment Knowledge Diagnostic Engine
 *
 * Provides diagnostic sampling across domain areas (DSA, OS, DBMS, CN),
 * evaluates baseline student ability per subject or across all subjects,
 * generates domain/subtopic mastery analytics, and records baseline pre-assessment sessions.
 */

import { AssessmentQuestion, QUESTION_BANK } from "./mock-data";
import {
  saveCompletedAssessment,
  CompletedAssessment,
  QuestionResponseResult,
  getAbilityLevelLabel,
} from "./assessment-storage";

export interface DomainMastery {
  code: string;
  name: string;
  correct: number;
  total: number;
  percentage: number;
  status: "Needs Focus" | "Developing" | "Proficient" | "Mastered";
  color: string;
}

export interface DiagnosticInsight {
  topic: string;
  detail: string;
  recommendedAction?: string;
}

export interface PreAssessmentResult {
  subject: string;              // "Mixed" | "DSA" | "DBMS" | "OS" | "CN"
  subjectName: string;          // e.g. "Data Structures & Algorithms"
  overallScore: number;         // percentage correct (0-100)
  initialAbility: number;       // baseline ability score (0-100)
  abilityLevel: string;         // Beginner | Elementary | Intermediate | Advanced | Expert
  domainBreakdown: DomainMastery[];
  strengths: DiagnosticInsight[];
  areasToImprove: DiagnosticInsight[];
  recommendedStartingDifficulty: number; // 1-5
  totalQuestions: number;
  correctCount: number;
  avgTimeSec: number;
}

export const TOPIC_CONFIG: Record<string, { name: string; color: string }> = {
  DSA: { name: "Data Structures & Algorithms", color: "#6366f1" },
  OS: { name: "Operating Systems", color: "#06b6d4" },
  DBMS: { name: "Database Management Systems", color: "#f59e0b" },
  CN: { name: "Computer Networks", color: "#ec4899" },
};

/**
 * Generate a balanced diagnostic question set for pre-assessment based on chosen subject.
 *
 * @param count Number of diagnostic items (5, 8, 10, or 12)
 * @param subject "Mixed" or specific topic code ("DSA", "DBMS", "OS", "CN")
 */
export function getDiagnosticQuestionSet(
  count: number = 8,
  subject: string = "Mixed"
): AssessmentQuestion[] {
  if (subject !== "Mixed") {
    // Subject-specific diagnostic sampler
    const topicPool = QUESTION_BANK.filter((q) => q.topic === subject);
    const sorted = [...topicPool].sort((a, b) => a.difficultyLevel - b.difficultyLevel);

    if (sorted.length <= count) {
      return [...sorted].sort(() => Math.random() - 0.5);
    }

    const selected: AssessmentQuestion[] = [];
    const step = (sorted.length - 1) / (count - 1);
    for (let i = 0; i < count; i++) {
      const index = Math.round(i * step);
      selected.push(sorted[index]);
    }
    return selected.sort(() => Math.random() - 0.5);
  } else {
    // Multi-subject mixed diagnostic sampler
    const topics = ["DSA", "OS", "DBMS", "CN"];
    const perTopic = Math.max(1, Math.floor(count / topics.length));
    const selected: AssessmentQuestion[] = [];

    for (const topic of topics) {
      const topicPool = QUESTION_BANK.filter((q) => q.topic === topic);
      const sorted = [...topicPool].sort((a, b) => a.difficultyLevel - b.difficultyLevel);

      if (sorted.length <= perTopic) {
        selected.push(...sorted);
      } else {
        const step = (sorted.length - 1) / (perTopic - 1);
        for (let i = 0; i < perTopic; i++) {
          const index = Math.round(i * step);
          selected.push(sorted[index]);
        }
      }
    }

    return selected.sort(() => Math.random() - 0.5);
  }
}

/**
 * Evaluate pre-assessment answers and produce a comprehensive knowledge analysis.
 */
export function evaluatePreAssessment(
  responses: Array<{
    question: AssessmentQuestion;
    selectedIndex: number;
    timeTakenSec: number;
  }>,
  subject: string = "Mixed"
): PreAssessmentResult {
  const totalQuestions = responses.length;
  let correctCount = 0;
  let totalTime = 0;

  // Track breakdown by topic or by subtopic depending on subject mode
  const breakdownStats: Record<string, { name: string; color: string; correct: number; total: number }> = {};

  if (subject === "Mixed") {
    Object.keys(TOPIC_CONFIG).forEach((code) => {
      breakdownStats[code] = {
        name: TOPIC_CONFIG[code].name,
        color: TOPIC_CONFIG[code].color,
        correct: 0,
        total: 0,
      };
    });
  } else {
    // For single subject, break down by subtopics
    const palette = ["#6366f1", "#06b6d4", "#f59e0b", "#ec4899", "#10b981", "#8b5cf6", "#f43f5e"];
    let colorIdx = 0;
    responses.forEach((resp) => {
      const st = resp.question.subtopic || "General";
      if (!breakdownStats[st]) {
        breakdownStats[st] = {
          name: st,
          color: palette[colorIdx % palette.length],
          correct: 0,
          total: 0,
        };
        colorIdx++;
      }
    });
  }

  // Base ability calculation starting at 50
  let ability = 50;

  responses.forEach((resp) => {
    const isCorrect = resp.selectedIndex === resp.question.correctOptionIndex;
    const diff = resp.question.difficultyLevel;
    totalTime += resp.timeTakenSec;

    if (isCorrect) {
      correctCount++;
      const boost = diff * 4;
      ability += boost;
    } else {
      const penalty = (6 - diff) * 3;
      ability -= penalty;
    }

    const key = subject === "Mixed" ? resp.question.topic : (resp.question.subtopic || "General");
    if (breakdownStats[key]) {
      breakdownStats[key].total++;
      if (isCorrect) breakdownStats[key].correct++;
    }
  });

  const initialAbility = Math.max(15, Math.min(95, Math.round(ability)));
  const overallScore = Math.round((correctCount / totalQuestions) * 100);
  const avgTimeSec = Math.round(totalTime / totalQuestions);
  const abilityLevel = getAbilityLevelLabel(initialAbility);

  // Compute Domain/Subtopic Breakdown
  const domainBreakdown: DomainMastery[] = Object.keys(breakdownStats).map((code) => {
    const stats = breakdownStats[code];
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

    let status: DomainMastery["status"] = "Needs Focus";
    if (pct >= 80) status = "Mastered";
    else if (pct >= 60) status = "Proficient";
    else if (pct >= 40) status = "Developing";

    return {
      code,
      name: stats.name,
      correct: stats.correct,
      total: stats.total,
      percentage: pct,
      status,
      color: stats.color,
    };
  });

  // Generate Diagnostic Insights
  const strengths: DiagnosticInsight[] = [];
  const areasToImprove: DiagnosticInsight[] = [];

  domainBreakdown.forEach((dom) => {
    if (dom.percentage >= 65) {
      strengths.push({
        topic: dom.name,
        detail: `Demonstrated ${dom.percentage}% mastery (${dom.correct}/${dom.total} questions correct). Ready for higher-difficulty challenges.`,
      });
    } else {
      areasToImprove.push({
        topic: dom.name,
        detail: `Baseline accuracy is ${dom.percentage}% (${dom.correct}/${dom.total} correct). Concepts need reinforcement.`,
        recommendedAction: `Focus adaptive practice on ${dom.name} fundamentals.`,
      });
    }
  });

  let recommendedStartingDifficulty = 3;
  if (initialAbility < 35) recommendedStartingDifficulty = 1;
  else if (initialAbility < 50) recommendedStartingDifficulty = 2;
  else if (initialAbility < 70) recommendedStartingDifficulty = 3;
  else if (initialAbility < 85) recommendedStartingDifficulty = 4;
  else recommendedStartingDifficulty = 5;

  const subjectName = subject === "Mixed" ? "All Subjects (Mixed)" : (TOPIC_CONFIG[subject]?.name || subject);

  return {
    subject,
    subjectName,
    overallScore,
    initialAbility,
    abilityLevel,
    domainBreakdown,
    strengths,
    areasToImprove,
    recommendedStartingDifficulty,
    totalQuestions,
    correctCount,
    avgTimeSec,
  };
}

/**
 * Save pre-assessment completed session to local storage history.
 */
export function savePreAssessmentSession(
  result: PreAssessmentResult,
  responses: Array<{
    question: AssessmentQuestion;
    selectedIndex: number;
    timeTakenSec: number;
  }>,
  subject: string = "Mixed"
): CompletedAssessment {
  let currAbility = 50;
  const detailedResults: QuestionResponseResult[] = responses.map((resp) => {
    const isCorrect = resp.selectedIndex === resp.question.correctOptionIndex;
    const abilityBefore = currAbility;
    const delta = isCorrect ? resp.question.difficultyLevel * 4 : -((6 - resp.question.difficultyLevel) * 3);
    currAbility = Math.max(15, Math.min(95, currAbility + delta));
    const base = isCorrect ? 100 : 0;

    return {
      questionId: resp.question.id,
      question: resp.question,
      selectedIndex: resp.selectedIndex,
      correct: isCorrect,
      abilityBefore,
      abilityAfter: currAbility,
      timeRemaining: Math.max(0, 90 - resp.timeTakenSec),
      base,
      bonus: 0,
      score: base,
    };
  });

  const now = new Date();
  const sessionTopic = subject === "Mixed" ? "Pre-Assessment (Mixed)" : `Pre-Assessment (${subject})`;

  const completedAssessment: CompletedAssessment = {
    id: `pre-asmt-${Date.now()}`,
    completedAt: now.toISOString(),
    formattedDate: now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " • " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    topic: sessionTopic,
    questionCount: result.totalQuestions,
    correctCount: result.correctCount,
    percentageScore: result.overallScore,
    totalScore: result.correctCount * 100,
    totalBonus: 0,
    abilityStart: 50,
    abilityFinal: result.initialAbility,
    abilityDelta: result.initialAbility - 50,
    results: detailedResults,
  };

  saveCompletedAssessment(completedAssessment);
  return completedAssessment;
}
