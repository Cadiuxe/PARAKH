"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BrainCircuit,
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  Trophy,
  RotateCcw,
  ChevronRight,
  Lightbulb,
  Target,
  Zap,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  TIMER_SECONDS,
  BASE_CORRECT_SCORE,
  SPEED_BONUS_MAX,
  INITIAL_ABILITY,
} from "@/lib/adaptive-engine";
import {
  saveCompletedAssessment,
  CompletedAssessment,
  QuestionResponseResult,
} from "@/lib/assessment-storage";
import {
  startAssessmentSession,
  checkTopicCalibration,
  getDiagnosticQuiz,
  evaluateDiagnosticAnswer,
  evaluateDiagnosticCalibration,
  startAssessmentWithDiagnostic,
  submitQuestionAnswer,
  getActiveAssessmentSession,
  abandonAssessmentSession,
  QuestionFeedback,
  CompletedSessionSummary,
} from "@/lib/actions/assessment";
import type { QuestionSafeRow } from "@/lib/db/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase =
  | "loading"
  | "setup"
  | "diagnostic_self"
  | "diagnostic_quiz"
  | "diagnostic_calibrating"
  | "diagnostic_result"
  | "question"
  | "complete";

interface ClientQuestionView {
  id: string;
  topic: string;
  subtopic: string;
  difficultyLevel: number;
  difficultyLabel: string;
  questionText: string;
  options: string[];
}

interface CompletedItemReview {
  questionId: string;
  questionText: string;
  topic: string;
  subtopic: string;
  difficultyLevel: number;
  difficultyLabel: string;
  options: string[];
  selectedIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string;
  timeRemaining: number;
  baseScore: number;
  speedBonus: number;
  totalScore: number;
  abilityBefore: number;
  abilityAfter: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPICS = ["Mixed", "DSA", "DBMS", "OS", "CN"] as const;
const QUESTION_COUNTS = [5, 10, 15] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function difficultyColor(level: number) {
  if (level <= 2) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  if (level === 3) return "bg-amber-500/10 border-amber-500/30 text-amber-400";
  return "bg-red-500/10 border-red-500/30 text-red-400";
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function mapSafeToView(q: QuestionSafeRow): ClientQuestionView {
  return {
    id: q.id,
    topic: q.topic_id,
    subtopic: q.subtopic,
    difficultyLevel: q.difficulty_level,
    difficultyLabel: q.difficulty_label,
    questionText: q.question_text,
    options: q.options,
  };
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({
  onStart,
  isLoading,
  error,
}: {
  onStart: (topic: string, count: number) => void;
  isLoading: boolean;
  error: string | null;
}) {
  const [topic, setTopic] = useState<string>("Mixed");
  const [count, setCount] = useState<number>(5);

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto">
          <BrainCircuit className="h-7 w-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Start Adaptive Assessment
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Questions adapt to your ability in real time. Each answer is validated by the server
          to recalibrate difficulty and track your proficiency.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="p-6 border border-border/80 bg-card shadow-md space-y-6">
        {/* Topic */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Topic Focus
          </label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  topic === t
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                    : "border-border/70 text-muted-foreground hover:border-indigo-500/50 hover:text-foreground bg-muted/30"
                }`}
              >
                {t === "Mixed" ? "🔀 Mixed" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Question count */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Number of Questions
          </label>
          <div className="flex gap-2">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`w-16 py-2 rounded-lg text-sm font-medium border transition-all ${
                  count === n
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                    : "border-border/70 text-muted-foreground hover:border-indigo-500/50 hover:text-foreground bg-muted/30"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Scoring info */}
        <div className="rounded-lg bg-muted/30 border border-border/50 p-3 text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            Scoring &amp; Server Authority
          </div>
          <p>Correct answer: <span className="text-foreground font-medium">100 base points</span></p>
          <p>Speed bonus: up to <span className="text-indigo-400 font-medium">+{SPEED_BONUS_MAX} pts</span> for answering quickly</p>
          <p>Answers are validated server-side for integrity and continuous ability estimation.</p>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            {TIMER_SECONDS}s per question
          </span>
          <span className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-emerald-400" />
            Adaptive difficulty
          </span>
        </div>

        <Button
          onClick={() => onStart(topic, count)}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-11 text-sm shadow-lg shadow-indigo-600/20 gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing Calibration Quiz…
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              Begin Assessment
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}

// ─── Pre-Assessment: Self-Assessment Screen ──────────────────────────────────

function SelfAssessmentScreen({
  topic,
  onProceed,
  onSkip,
}: {
  topic: string;
  onProceed: (tier: string) => void;
  onSkip: () => void;
}) {
  const [selectedTier, setSelectedTier] = useState<string>("intermediate");

  const tiers = [
    { id: "novice", title: "Novice", desc: "Brand new to this topic; little to no prior exposure." },
    { id: "beginner", title: "Beginner", desc: "Know the core fundamentals and basic syntax." },
    { id: "intermediate", title: "Intermediate", desc: "Comfortable solving standard textbook problems." },
    { id: "proficient", title: "Proficient", desc: "Strong conceptual grasp and good problem-solving speed." },
    { id: "advanced", title: "Advanced", desc: "Deep mastery, edge cases, and competitive-level fluency." },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="text-center space-y-2">
        <Badge className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          Step 1 of 2: Self-Calibration
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          How familiar are you with {topic === "Mixed" ? "these CS topics" : topic}?
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your response helps calibrate the initial question difficulty. It will be verified by 5 quick diagnostic questions.
        </p>
      </div>

      <Card className="p-6 border border-border/80 bg-card shadow-md space-y-4">
        <div className="space-y-2.5">
          {tiers.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                selectedTier === t.id
                  ? "bg-indigo-600/15 border-indigo-500 text-foreground ring-1 ring-indigo-500/50 shadow-sm"
                  : "border-border/60 hover:border-indigo-500/40 bg-muted/20 text-muted-foreground"
              }`}
            >
              <div>
                <p className="font-semibold text-sm text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  selectedTier === t.id ? "border-indigo-500 bg-indigo-600" : "border-muted-foreground/40"
                }`}
              >
                {selectedTier === t.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1 border-border/70 text-muted-foreground hover:text-foreground"
          >
            Skip Self-Rating
          </Button>
          <Button
            onClick={() => onProceed(selectedTier)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-2 shadow-md shadow-indigo-600/20"
          >
            Continue to 5 Diagnostic Questions
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Pre-Assessment: 5 Diagnostic Questions Screen ───────────────────────────

interface DiagnosticFeedbackState {
  isCorrect: boolean;
  correctOptionIndex: number;
  explanation: string;
}

function DiagnosticQuizScreen({
  questions,
  currentIndex,
  onAnswer,
  isCalibrating,
}: {
  questions: ClientQuestionView[];
  currentIndex: number;
  onAnswer: (questionId: string, optionIndex: number) => void;
  isCalibrating: boolean;
}) {
  const currentQ = questions[currentIndex];
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<DiagnosticFeedbackState | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Reset local state when moving to a new diagnostic question
  useEffect(() => {
    setSelectedOpt(null);
    setFeedback(null);
    setIsEvaluating(false);
  }, [currentIndex, currentQ?.id]);

  const handleSelectOption = async (optIdx: number) => {
    if (selectedOpt !== null || isEvaluating || feedback !== null || !currentQ) return;
    setSelectedOpt(optIdx);
    setIsEvaluating(true);

    try {
      const res = await evaluateDiagnosticAnswer({
        questionId: currentQ.id,
        selectedOptionIndex: optIdx,
      });

      if (res.success) {
        setFeedback({
          isCorrect: res.isCorrect,
          correctOptionIndex: res.correctOptionIndex,
          explanation: res.explanation,
        });
      } else {
        // In case of evaluation error, allow proceeding
        setFeedback({
          isCorrect: false,
          correctOptionIndex: optIdx,
          explanation: "Answer recorded.",
        });
      }
    } catch {
      setFeedback({
        isCorrect: false,
        correctOptionIndex: optIdx,
        explanation: "Answer recorded.",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleProceedNext = () => {
    if (selectedOpt === null || !currentQ || isCalibrating) return;
    onAnswer(currentQ.id, selectedOpt);
  };

  if (!currentQ) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Pre-Assessment Diagnostic
            </Badge>
            <span className="font-semibold text-foreground">
              Question {currentIndex + 1} of 5
            </span>
          </div>
          <span className="text-muted-foreground">
            {Math.round(((currentIndex + 1) / 5) * 100)}%
          </span>
        </div>
        <Progress value={((currentIndex + 1) / 5) * 100} className="h-1.5" />
      </div>

      <Card className="p-6 border border-border/80 bg-card shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <Badge variant="outline" className="text-xs">
            {currentQ.topic} · {currentQ.subtopic}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Baseline Calibration
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
          {currentQ.questionText}
        </h2>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOpt === idx;
            const isAnswered = feedback !== null;
            const isCorrectOption = isAnswered && feedback.correctOptionIndex === idx;
            const isIncorrectSelected = isAnswered && isSelected && !feedback.isCorrect;

            let optionStyle = "border-border/60 hover:border-indigo-500/40 bg-muted/20 text-muted-foreground hover:text-foreground";
            let badgeStyle = "border-border bg-background text-muted-foreground";

            if (isAnswered) {
              if (isCorrectOption) {
                optionStyle = "bg-emerald-500/15 border-emerald-500/70 text-foreground ring-1 ring-emerald-500/30 shadow-sm";
                badgeStyle = "bg-emerald-600 border-emerald-500 text-white";
              } else if (isIncorrectSelected) {
                optionStyle = "bg-red-500/15 border-red-500/70 text-foreground ring-1 ring-red-500/30 shadow-sm";
                badgeStyle = "bg-red-600 border-red-500 text-white";
              } else {
                optionStyle = "border-border/40 bg-muted/10 text-muted-foreground/60 opacity-60";
              }
            } else if (isSelected) {
              if (isEvaluating) {
                optionStyle = "bg-indigo-600/20 border-indigo-500 text-foreground ring-1 ring-indigo-500/50 shadow-sm cursor-wait";
                badgeStyle = "bg-indigo-600 border-indigo-500 text-white";
              } else {
                optionStyle = "bg-indigo-600/20 border-indigo-500 text-foreground ring-1 ring-indigo-500/50 shadow-sm";
                badgeStyle = "bg-indigo-600 border-indigo-500 text-white";
              }
            } else if (isEvaluating) {
              optionStyle = "border-border/40 bg-muted/10 text-muted-foreground/50 opacity-60 cursor-not-allowed";
            }

            return (
              <button
                key={idx}
                disabled={isAnswered || isEvaluating || isCalibrating}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${optionStyle}`}
              >
                <span
                  className={`h-6 w-6 rounded-lg text-xs font-bold flex items-center justify-center border shrink-0 ${badgeStyle}`}
                >
                  {isAnswered && isCorrectOption ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : isAnswered && isIncorrectSelected ? (
                    <XCircle className="h-4 w-4 text-white" />
                  ) : isEvaluating && isSelected ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  ) : (
                    String.fromCharCode(65 + idx)
                  )}
                </span>
                <span className="leading-snug flex-1">{opt}</span>
                {isEvaluating && isSelected && (
                  <span className="text-xs font-medium text-indigo-400 shrink-0 flex items-center gap-1 animate-pulse">
                    Verifying…
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Server Authoritative Diagnostic Feedback & Explanation */}
        {feedback && (
          <div
            className={`rounded-xl border p-4 space-y-2 text-xs transition-all animate-in fade-in-50 duration-200 ${
              feedback.isCorrect
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              {feedback.isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Correct Answer</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>
                    Incorrect · Correct:{" "}
                    <span className="font-bold underline text-foreground">
                      {currentQ.options[feedback.correctOptionIndex]}
                    </span>
                  </span>
                </>
              )}
            </div>
            {feedback.explanation && (
              <p className="text-muted-foreground text-xs leading-relaxed pt-1 border-t border-border/40">
                {feedback.explanation}
              </p>
            )}
          </div>
        )}

        {/* Next / Proceed Button */}
        {feedback ? (
          <Button
            onClick={handleProceedNext}
            disabled={isCalibrating}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-11 text-sm shadow-md shadow-indigo-600/20 gap-2"
          >
            {isCalibrating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Calibrating Starting Ability…
              </>
            ) : currentIndex === 4 ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Proceed to Calibration
              </>
            ) : (
              <>
                <span>Next Diagnostic Question</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <div className="text-center text-xs text-muted-foreground py-1">
            {isEvaluating ? (
              <span className="inline-flex items-center gap-2 text-indigo-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Evaluating answer...
              </span>
            ) : (
              "Select an answer above to see explanation and proceed"
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Pre-Assessment: Calibrating Screen ──────────────────────────────────────

function CalibratingScreen() {
  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-20">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto animate-pulse">
        <BrainCircuit className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Calibrating Adaptive Engine</h2>
        <p className="text-xs text-muted-foreground">
          Synthesizing diagnostic responses, self-assessment priors, and historical metrics to establish your baseline...
        </p>
      </div>
      <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-400" />
    </div>
  );
}

// ─── Pre-Assessment: Calibration Result Screen ───────────────────────────────

function abilityLabel(ability: number): { label: string; description: string; color: string } {
  if (ability < 25) return { label: "Beginner", description: "We'll start with foundational concepts to build your confidence.", color: "text-sky-400" };
  if (ability < 40) return { label: "Elementary", description: "You have some basics — we'll strengthen your fundamentals first.", color: "text-blue-400" };
  if (ability < 55) return { label: "Intermediate", description: "A solid foundation — expect a balanced mix of concepts and problem-solving.", color: "text-indigo-400" };
  if (ability < 70) return { label: "Proficient", description: "You have strong conceptual knowledge — questions will challenge your depth.", color: "text-violet-400" };
  if (ability < 83) return { label: "Advanced", description: "High proficiency detected — expect nuanced and complex questions.", color: "text-amber-400" };
  return { label: "Expert", description: "Exceptional baseline — the assessment will start at the most challenging tier.", color: "text-emerald-400" };
}

function DiagnosticResultScreen({
  ability,
  onBegin,
  isLoading,
  error,
}: {
  ability: number;
  onBegin: () => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  const { label, description, color } = abilityLabel(ability);

  return (
    <div className="max-w-lg mx-auto space-y-6 py-4">
      <div className="text-center space-y-2">
        <Badge className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          Calibration Complete
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Your Starting Level
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Based on your diagnostic responses, the adaptive engine has estimated your baseline ability.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="p-8 border border-border/80 bg-card shadow-md text-center space-y-5">
        {/* Ability icon */}
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto">
          <TrendingUp className="h-8 w-8" />
        </div>

        {/* Numerical Starting Ability & Level Label */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Starting Ability:
            </span>
            <span className="text-sm font-bold text-foreground font-mono">
              {ability.toFixed(1)} / 100
            </span>
          </div>
          <div>
            <p className={`text-3xl font-extrabold tracking-tight ${color}`}>{label}</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed mt-1">
              {description}
            </p>
          </div>
        </div>

        {/* Decorative visual bar — relative width only */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${Math.round(Math.max(8, Math.min(100, ability)))}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Questions will adapt in real-time as you answer.
        </p>

        <Button
          onClick={onBegin}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-11 text-sm shadow-lg shadow-indigo-600/20 gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting Assessment…
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              Begin Assessment
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}

// ─── Question Screen ──────────────────────────────────────────────────────────

function QuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  serverFeedback,
  isSubmitting,
  onSubmitAnswer,
  onProceedNext,
}: {
  question: ClientQuestionView;
  questionIndex: number;
  totalQuestions: number;
  serverFeedback: QuestionFeedback | null;
  isSubmitting: boolean;
  onSubmitAnswer: (selectedIndex: number, timeRemaining: number) => void;
  onProceedNext: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const autoSubmittedRef = useRef(false);
  const deadlineRef = useRef<number>(Date.now() + TIMER_SECONDS * 1000);

  // Authoritative client-side calculation from wall-clock deadline
  const calculateRemainingTime = useCallback(() => {
    const remainingMs = deadlineRef.current - Date.now();
    return Math.max(0, Math.min(TIMER_SECONDS, Math.ceil(remainingMs / 1000)));
  }, []);

  // Reset state and deadline when question changes
  useEffect(() => {
    setSelected(null);
    deadlineRef.current = Date.now() + TIMER_SECONDS * 1000;
    setTimeLeft(TIMER_SECONDS);
    autoSubmittedRef.current = false;
  }, [question.id]);

  // Synchronized countdown timer
  useEffect(() => {
    if (serverFeedback !== null || isSubmitting) return;

    const tick = () => {
      const remaining = calculateRemainingTime();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (!autoSubmittedRef.current) {
          autoSubmittedRef.current = true;
          onSubmitAnswer(-1, 0);
        }
      }
    };

    tick();
    const intervalId = setInterval(tick, 200);
    return () => clearInterval(intervalId);
  }, [serverFeedback, isSubmitting, calculateRemainingTime, onSubmitAnswer]);

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const progress = ((questionIndex) / totalQuestions) * 100;
  const isSubmitted = serverFeedback !== null;

  const handleSubmit = () => {
    if (selected === null || isSubmitted || isSubmitting) return;
    const remainingAtSubmit = calculateRemainingTime();
    onSubmitAnswer(selected, remainingAtSubmit);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Progress & timer row */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Question{" "}
            <span className="font-semibold text-foreground">{questionIndex + 1}</span>{" "}
            of {totalQuestions}
          </span>
          <span
            className={`flex items-center gap-1 font-mono font-semibold tabular-nums ${
              timeLeft <= 15 ? "text-red-400" : timeLeft <= 30 ? "text-amber-400" : "text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Assessment progress bar */}
        <Progress value={progress} className="h-1.5 bg-muted" />

        {/* Timer bar */}
        <div className="w-full h-0.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              timerPct > 40 ? "bg-indigo-500" : timerPct > 17 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${timerPct}%`, transition: "width 0.2s linear" }}
          />
        </div>
      </div>

      {/* Question card */}
      <Card className="p-6 border border-border/80 bg-card shadow-md space-y-5">
        {/* Meta badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
            {question.topic}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-border/60 text-muted-foreground">
            {question.subtopic}
          </Badge>
          <Badge variant="outline" className={`text-[10px] ${difficultyColor(question.difficultyLevel)}`}>
            Level {question.difficultyLevel} — {question.difficultyLabel}
          </Badge>
        </div>

        {/* Question text */}
        <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
          {question.questionText}
        </p>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((option, idx) => {
            let cls =
              "w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ";
            if (!isSubmitted) {
              if (isSubmitting) {
                if (selected === idx) {
                  cls += "border-indigo-500 bg-indigo-500/20 text-foreground ring-1 ring-indigo-500/50 shadow-sm cursor-wait";
                } else {
                  cls += "border-border/30 bg-muted/10 text-muted-foreground/40 opacity-50 cursor-not-allowed";
                }
              } else {
                cls +=
                  selected === idx
                    ? "border-indigo-500 bg-indigo-500/10 text-foreground cursor-pointer"
                    : "border-border/60 bg-muted/20 text-muted-foreground hover:border-indigo-500/50 hover:text-foreground hover:bg-muted/40 cursor-pointer";
              }
            } else {
              if (idx === serverFeedback.correctOptionIndex) {
                cls += "border-emerald-500 bg-emerald-500/10 text-emerald-300";
              } else if (idx === selected && !serverFeedback.isCorrect) {
                cls += "border-red-500 bg-red-500/10 text-red-300";
              } else {
                cls += "border-border/30 bg-muted/10 text-muted-foreground/50 cursor-default";
              }
            }

            return (
              <button
                key={idx}
                className={cls}
                onClick={() => !isSubmitted && !isSubmitting && setSelected(idx)}
                disabled={isSubmitted || isSubmitting}
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md border border-current text-xs font-bold">
                    {isSubmitting && selected === idx ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </span>
                  <span className="leading-snug">{option}</span>
                  {isSubmitting && selected === idx && (
                    <span className="ml-auto text-xs font-semibold text-indigo-400 shrink-0 flex items-center gap-1.5 animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Verifying…
                    </span>
                  )}
                  {isSubmitted && idx === serverFeedback.correctOptionIndex && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {isSubmitted && idx === selected && !serverFeedback.isCorrect && (
                    <XCircle className="ml-auto h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Post-submission: Server Feedback */}
        {isSubmitted && (
          <div className="space-y-3">
            {/* Score row */}
            <div
              className={`flex items-center justify-between rounded-lg px-4 py-2.5 border text-xs font-semibold ${
                serverFeedback.isCorrect
                  ? "bg-emerald-500/[0.06] border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/[0.06] border-red-500/30 text-red-400"
              }`}
            >
              {serverFeedback.isCorrect ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Correct!
                  </span>
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="text-muted-foreground">{serverFeedback.baseScore} base</span>
                    <span className="text-indigo-400 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      +{serverFeedback.speedBonus} speed
                    </span>
                    <span className="font-bold">=&nbsp;{serverFeedback.totalScore} pts</span>
                  </span>
                </>
              ) : selected === -1 || selected === null ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    Time expired
                  </span>
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="text-muted-foreground">{serverFeedback.baseScore} base</span>
                    <span className="text-muted-foreground">+0 speed</span>
                    <span className="font-bold">=&nbsp;0 pts</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                    Incorrect
                  </span>
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="text-muted-foreground">{serverFeedback.baseScore} base</span>
                    <span className="text-muted-foreground">+0 speed</span>
                    <span className="font-bold">=&nbsp;0 pts</span>
                  </span>
                </>
              )}
            </div>

            {/* Explanation */}
            <div
              className={`rounded-xl p-4 border space-y-1.5 ${
                serverFeedback.isCorrect
                  ? "bg-emerald-500/[0.04] border-emerald-500/20"
                  : "bg-amber-500/[0.04] border-amber-500/20"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Lightbulb
                  className={`h-3.5 w-3.5 ${
                    serverFeedback.isCorrect ? "text-emerald-400" : "text-amber-400"
                  }`}
                />
                <span className={serverFeedback.isCorrect ? "text-emerald-400" : "text-amber-400"}>
                  {serverFeedback.isCorrect ? "Correct!" : "Incorrect — Explanation:"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {serverFeedback.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {!isSubmitted && selected === null ? "Select an answer to continue" : ""}
          </span>
          {!isSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={selected === null || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Submit Answer"
              )}
            </Button>
          ) : (
            <Button
              onClick={onProceedNext}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
            >
              {questionIndex + 1 < totalQuestions ? (
                <>
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  See Results
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Complete Screen ──────────────────────────────────────────────────────────

function CompleteScreen({
  summary,
  onRestart,
}: {
  summary: CompletedSessionSummary;
  onRestart: () => void;
}) {
  const {
    actualCount,
    correctCount,
    percentageScore,
    totalScore,
    totalBonus,
    abilityStart,
    abilityFinal,
    abilityDelta,
    responses,
    id: assessmentId,
  } = summary;

  const pct = percentageScore;
  const grade =
    pct >= 85
      ? { label: "Excellent", color: "text-emerald-400" }
      : pct >= 65
      ? { label: "Good", color: "text-indigo-400" }
      : pct >= 45
      ? { label: "Fair", color: "text-amber-400" }
      : { label: "Needs Work", color: "text-red-400" };

  const gridCols =
    actualCount <= 5
      ? "grid-cols-5"
      : actualCount <= 10
      ? "grid-cols-5"
      : "grid-cols-5";

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Assessment Complete
        </h1>
        <p className="text-sm text-muted-foreground">
          You answered{" "}
          <strong className="text-foreground">{correctCount}</strong> of{" "}
          <strong className="text-foreground">{actualCount}</strong> questions correctly.
        </p>
      </div>

      <Card className="p-6 border border-border/80 bg-card shadow-md space-y-5">
        {/* Score headline */}
        <div className="text-center pb-4 border-b border-border/50">
          <span className={`text-5xl font-black ${grade.color}`}>{pct}%</span>
          <p className={`text-base font-bold mt-1 ${grade.color}`}>{grade.label}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5">
            <p className="text-muted-foreground">Correct</p>
            <p className="text-lg font-extrabold text-emerald-400">{correctCount}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5">
            <p className="text-muted-foreground">Incorrect</p>
            <p className="text-lg font-extrabold text-red-400">{actualCount - correctCount}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5">
            <p className="text-muted-foreground">Total Score</p>
            <p className="text-lg font-extrabold text-foreground">{totalScore}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5">
            <p className="text-muted-foreground">Speed Bonus</p>
            <p className="text-lg font-extrabold text-indigo-400">+{totalBonus}</p>
          </div>
        </div>

        {/* Ability change */}
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
          <div className="text-xs">
            <p className="text-muted-foreground mb-0.5">Estimated Ability</p>
            <p className="text-sm font-bold text-foreground">
              {abilityStart}{" "}
              <span className="text-muted-foreground mx-1">→</span>{" "}
              {abilityFinal}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 text-sm font-bold ${
              abilityDelta > 0
                ? "text-emerald-400"
                : abilityDelta < 0
                ? "text-red-400"
                : "text-muted-foreground"
            }`}
          >
            {abilityDelta > 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : abilityDelta < 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : null}
            {abilityDelta > 0 ? `+${abilityDelta}` : abilityDelta === 0 ? "No change" : abilityDelta}
          </div>
        </div>

        {/* Per-question dots */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">Question Breakdown</p>
          <div className={`grid ${gridCols} gap-2`}>
            {responses.map((r, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center py-2 rounded-lg border text-xs font-bold ${
                  r.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : r.selectedIndex === -1
                    ? "bg-muted/30 border-border/40 text-muted-foreground"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
                title={
                  r.isCorrect
                    ? `Q${idx + 1}: Correct (+${r.totalScore}pts)`
                    : r.selectedIndex === -1
                    ? `Q${idx + 1}: Timed out`
                    : `Q${idx + 1}: Incorrect`
                }
              >
                <span>Q{idx + 1}</span>
                {r.isCorrect ? (
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 mt-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Answer review */}
        <div className="border-t border-border/50 pt-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Answer Review
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {responses.map((r, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border/50 bg-muted/10 p-3 text-xs space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-foreground leading-snug">
                    Q{idx + 1}. {r.questionText}
                  </span>
                  {r.isCorrect ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  )}
                </div>
                {r.selectedIndex === -1 ? (
                  <p className="text-muted-foreground italic">Timed out — no answer selected.</p>
                ) : (
                  <p className="text-muted-foreground">
                    Your answer:{" "}
                    <span
                      className={r.isCorrect ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}
                    >
                      {r.options[r.selectedIndex]}
                    </span>
                    {!r.isCorrect && (
                      <>
                        {" "}· Correct:{" "}
                        <span className="text-emerald-400 font-medium">
                          {r.options[r.correctOptionIndex]}
                        </span>
                      </>
                    )}
                  </p>
                )}
                <p className="text-muted-foreground/70 leading-relaxed">
                  {r.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            onClick={onRestart}
            className="flex-1 gap-2 border-border/70"
          >
            <RotateCcw className="h-4 w-4" />
            New Assessment
          </Button>
          <Button asChild className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
            <Link href={`/results?id=${assessmentId}`}>
              View Analytics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Assessment Page Component ──────────────────────────────────────────

export default function AssessmentPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [sessionId, setSessionId] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<ClientQuestionView | null>(null);
  const [nextQuestionBuffered, setNextQuestionBuffered] = useState<ClientQuestionView | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(5);
  const [selectedTopic, setSelectedTopic] = useState("Mixed");
  const [ability, setAbility] = useState(INITIAL_ABILITY);
  const [abilityStart, setAbilityStart] = useState(INITIAL_ABILITY);
  const [serverFeedback, setServerFeedback] = useState<QuestionFeedback | null>(null);
  const [completedSummary, setCompletedSummary] = useState<CompletedSessionSummary | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-Assessment Diagnostic State
  const [pendingTopic, setPendingTopic] = useState<string>("Mixed");
  const [pendingCount, setPendingCount] = useState<number>(5);
  const [selfAssessmentTier, setSelfAssessmentTier] = useState<string | null>(null);
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<ClientQuestionView[]>([]);
  const [diagnosticIndex, setDiagnosticIndex] = useState<number>(0);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<
    Array<{ questionId: string; selectedOptionIndex: number }>
  >([]);
  // Stores the calculated calibrated ability prior to present to the user before session creation
  const [calibratedAbility, setCalibratedAbility] = useState<number>(INITIAL_ABILITY);

  // 1. On Mount: Check for active assessment session to resume upon refresh/reconnect
  useEffect(() => {
    let isMounted = true;
    getActiveAssessmentSession()
      .then((res) => {
        if (!isMounted) return;
        if (res.hasActiveSession) {
          setSessionId(res.sessionId);
          setSelectedTopic(res.topic);
          setTotalCount(res.requestedCount);
          setQuestionIndex(res.questionIndex);
          setAbility(res.currentAbility);
          setAbilityStart(res.abilityStart);
          setCurrentQuestion(mapSafeToView(res.currentQuestion));
          setPhase("question");
        } else {
          setPhase("setup");
        }
      })
      .catch((err) => {
        console.error("Failed to check active session:", err);
        if (isMounted) setPhase("setup");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Start Assessment Setup -> Pre-Assessment (or skip if returning student)
  const handleStart = async (topic: string, count: number) => {
    setIsStarting(true);
    setErrorMsg(null);

    try {
      // Check whether this student already has a calibrated ability for this topic.
      // ability_estimates has a row iff the student completed at least one session for this topic.
      const calibCheck = await checkTopicCalibration(topic);

      if (calibCheck.isCalibrated) {
        // Returning student: skip pre-assessment entirely; server authoritatively uses persisted topic ability
        const res = await startAssessmentSession(topic, count);
        if (res.success) {
          setSessionId(res.sessionId);
          setSelectedTopic(res.topic);
          setTotalCount(res.requestedCount);
          setAbility(res.initialAbility);
          setAbilityStart(res.initialAbility);
          setQuestionIndex(0);
          setCurrentQuestion(mapSafeToView(res.firstQuestion));
          setNextQuestionBuffered(null);
          setServerFeedback(null);
          setCompletedSummary(null);
          setPhase("question");
        } else {
          setErrorMsg(res.error || "Failed to start assessment.");
        }
        return;
      }

      // First-time student (or Mixed): run the pre-assessment diagnostic
      const diagRes = await getDiagnosticQuiz(topic);
      if (diagRes.success && diagRes.questions.length >= 5) {
        setDiagnosticQuestions(diagRes.questions.map(mapSafeToView));
        setPendingTopic(topic);
        setPendingCount(count);
        setDiagnosticAnswers([]);
        setDiagnosticIndex(0);
        setSelfAssessmentTier(null);
        setPhase("diagnostic_self");
      } else {
        // Fallback: diagnostic quiz unavailable, start directly
        const res = await startAssessmentSession(topic, count);
        if (res.success) {
          setSessionId(res.sessionId);
          setSelectedTopic(res.topic);
          setTotalCount(res.requestedCount);
          setAbility(res.initialAbility);
          setAbilityStart(res.initialAbility);
          setQuestionIndex(0);
          setCurrentQuestion(mapSafeToView(res.firstQuestion));
          setNextQuestionBuffered(null);
          setServerFeedback(null);
          setCompletedSummary(null);
          setPhase("question");
        } else {
          setErrorMsg(res.error || "Failed to start assessment.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsStarting(false);
    }
  };

  // Pre-Assessment Step 1: Self-Assessment Proceed / Skip
  const handleSelfAssessmentProceed = (tier: string) => {
    setSelfAssessmentTier(tier);
    setPhase("diagnostic_quiz");
  };

  const handleSelfAssessmentSkip = () => {
    setSelfAssessmentTier(null);
    setPhase("diagnostic_quiz");
  };

  // Pre-Assessment Step 2: Diagnostic Questions Answer & Calibration
  const handleDiagnosticAnswer = async (questionId: string, optionIndex: number) => {
    const updatedAnswers = [
      ...diagnosticAnswers,
      { questionId, selectedOptionIndex: optionIndex },
    ];
    setDiagnosticAnswers(updatedAnswers);

    if (diagnosticIndex < 4) {
      setDiagnosticIndex(diagnosticIndex + 1);
    } else {
      // Finished 5th diagnostic question -> Evaluate ability prior on server WITHOUT creating a session
      setPhase("diagnostic_calibrating");
      try {
        const res = await evaluateDiagnosticCalibration({
          topic: pendingTopic,
          selfAssessmentTier,
          diagnosticAnswers: updatedAnswers,
        });

        if (res.success) {
          setCalibratedAbility(res.calibratedAbility);
          setPhase("diagnostic_result");
        } else {
          setErrorMsg(res.error || "Calibration failed.");
          setPhase("setup");
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Calibration failed.");
        setPhase("setup");
      }
    }
  };

  // Pre-Assessment Step 3: User clicks "Begin Assessment" on the calibration result screen
  // This is the single place where the main in_progress session is created for calibrated assessments
  const handleBeginCalibratedAssessment = async () => {
    setIsStarting(true);
    setErrorMsg(null);

    try {
      const res = await startAssessmentWithDiagnostic({
        topic: pendingTopic,
        count: pendingCount,
        selfAssessmentTier,
        diagnosticAnswers,
      });

      if (res.success) {
        setSessionId(res.sessionId);
        setSelectedTopic(res.topic);
        setTotalCount(res.requestedCount);
        setAbility(res.initialAbility);
        setAbilityStart(res.initialAbility);
        setQuestionIndex(0);
        setCurrentQuestion(mapSafeToView(res.firstQuestion));
        setNextQuestionBuffered(null);
        setServerFeedback(null);
        setCompletedSummary(null);
        setPhase("question");
      } else {
        setErrorMsg(res.error || "Failed to initialize assessment session.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsStarting(false);
    }
  };

  // 3. Submit Answer to Server
  const handleSubmitAnswer = useCallback(
    async (selectedIndex: number, timeRemaining: number) => {
      if (!currentQuestion || !sessionId || isSubmitting) return;

      setIsSubmitting(true);
      setErrorMsg(null);

      try {
        const res = await submitQuestionAnswer({
          sessionId,
          questionId: currentQuestion.id,
          selectedOptionIndex: selectedIndex,
          timeRemainingSec: timeRemaining,
        });

        if (res.success) {
          setServerFeedback(res.feedback);
          setAbility(res.feedback.abilityAfter);

          if (res.isCompleted) {
            setCompletedSummary(res.completedSummary);

            // Sync to local storage for instant dashboard / results view
            const mappedResults: QuestionResponseResult[] = res.completedSummary.responses.map(
              (r) => ({
                questionId: r.questionId,
                question: {
                  id: r.questionId,
                  topic: r.topic,
                  subtopic: r.subtopic,
                  difficultyLevel: r.difficultyLevel,
                  difficultyLabel: r.difficultyLabel,
                  difficultyScore: r.difficultyScore,
                  questionText: r.questionText,
                  options: r.options,
                  correctOptionIndex: r.correctOptionIndex,
                  explanation: r.explanation,
                },
                selectedIndex: r.selectedIndex,
                correct: r.isCorrect,
                abilityBefore: r.abilityBefore,
                abilityAfter: r.abilityAfter,
                timeRemaining: r.timeRemaining,
                base: r.baseScore,
                bonus: r.speedBonus,
                score: r.totalScore,
              })
            );

            const localCompleted: CompletedAssessment = {
              id: res.completedSummary.id,
              completedAt: res.completedSummary.completedAt,
              formattedDate: new Date(res.completedSummary.completedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }),
              topic: res.completedSummary.topic,
              questionCount: res.completedSummary.requestedCount,
              correctCount: res.completedSummary.correctCount,
              percentageScore: res.completedSummary.percentageScore,
              totalScore: res.completedSummary.totalScore,
              totalBonus: res.completedSummary.totalBonus,
              abilityStart: res.completedSummary.abilityStart,
              abilityFinal: res.completedSummary.abilityFinal,
              abilityDelta: res.completedSummary.abilityDelta,
              results: mappedResults,
            };

            saveCompletedAssessment(localCompleted);
          } else {
            setNextQuestionBuffered(mapSafeToView(res.nextQuestion));
          }
        } else {
          setErrorMsg(res.error || "Submission failed.");
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "An unexpected error occurred.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentQuestion, sessionId, isSubmitting]
  );

  // 4. Proceed to Next Question
  const handleProceedNext = useCallback(() => {
    if (completedSummary) {
      setPhase("complete");
    } else if (nextQuestionBuffered) {
      setCurrentQuestion(nextQuestionBuffered);
      setNextQuestionBuffered(null);
      setServerFeedback(null);
      setQuestionIndex((prev) => prev + 1);
    }
  }, [completedSummary, nextQuestionBuffered]);

  // 5. Restart or Abandon
  const handleRestart = async () => {
    if (sessionId && phase === "question") {
      await abandonAssessmentSession(sessionId).catch(() => {});
    }
    setSessionId("");
    setPhase("setup");
    setCurrentQuestion(null);
    setNextQuestionBuffered(null);
    setServerFeedback(null);
    setCompletedSummary(null);
    setQuestionIndex(0);
    setAbility(INITIAL_ABILITY);
    setAbilityStart(INITIAL_ABILITY);
    setDiagnosticAnswers([]);
    setDiagnosticIndex(0);
    setSelfAssessmentTier(null);
    setCalibratedAbility(INITIAL_ABILITY);
    setErrorMsg(null);
  };

  return (
    <DashboardLayout>
      {phase === "loading" && (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-xs text-muted-foreground font-medium">Checking active assessment…</p>
        </div>
      )}

      {phase === "setup" && (
        <SetupScreen
          onStart={handleStart}
          isLoading={isStarting}
          error={errorMsg}
        />
      )}

      {phase === "diagnostic_self" && (
        <SelfAssessmentScreen
          topic={pendingTopic}
          onProceed={handleSelfAssessmentProceed}
          onSkip={handleSelfAssessmentSkip}
        />
      )}

      {phase === "diagnostic_quiz" && (
        <DiagnosticQuizScreen
          questions={diagnosticQuestions}
          currentIndex={diagnosticIndex}
          onAnswer={handleDiagnosticAnswer}
          isCalibrating={false}
        />
      )}

      {phase === "diagnostic_calibrating" && <CalibratingScreen />}

      {phase === "diagnostic_result" && (
        <DiagnosticResultScreen
          ability={calibratedAbility}
          onBegin={handleBeginCalibratedAssessment}
          isLoading={isStarting}
          error={errorMsg}
        />
      )}

      {phase === "question" && currentQuestion && (
        <QuestionScreen
          key={currentQuestion.id}
          question={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={totalCount}
          serverFeedback={serverFeedback}
          isSubmitting={isSubmitting}
          onSubmitAnswer={handleSubmitAnswer}
          onProceedNext={handleProceedNext}
        />
      )}

      {phase === "complete" && completedSummary && (
        <CompleteScreen
          summary={completedSummary}
          onRestart={handleRestart}
        />
      )}
    </DashboardLayout>
  );
}
