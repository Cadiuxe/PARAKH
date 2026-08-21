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
  submitQuestionAnswer,
  getActiveAssessmentSession,
  abandonAssessmentSession,
  QuestionFeedback,
  CompletedSessionSummary,
} from "@/lib/actions/assessment";
import type { QuestionSafeRow } from "@/lib/db/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "loading" | "setup" | "question" | "complete";

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
              Initializing Session…
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
  const [submittedTime, setSubmittedTime] = useState<number>(0);
  const autoSubmittedRef = useRef(false);

  // Reset state when question changes
  useEffect(() => {
    setSelected(null);
    setTimeLeft(TIMER_SECONDS);
    setSubmittedTime(0);
    autoSubmittedRef.current = false;
  }, [question.id]);

  // Countdown timer
  useEffect(() => {
    if (serverFeedback !== null) return;
    if (timeLeft <= 0) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        setSubmittedTime(0);
        onSubmitAnswer(-1, 0);
      }
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, serverFeedback, onSubmitAnswer]);

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const progress = ((questionIndex) / totalQuestions) * 100;
  const isSubmitted = serverFeedback !== null;

  const handleSubmit = () => {
    if (selected === null || isSubmitted || isSubmitting) return;
    setSubmittedTime(timeLeft);
    onSubmitAnswer(selected, timeLeft);
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
            style={{ width: `${timerPct}%`, transition: "width 1s linear" }}
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
              cls +=
                selected === idx
                  ? "border-indigo-500 bg-indigo-500/10 text-foreground cursor-pointer"
                  : "border-border/60 bg-muted/20 text-muted-foreground hover:border-indigo-500/50 hover:text-foreground hover:bg-muted/40 cursor-pointer";
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
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{option}</span>
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
                    {serverFeedback.speedBonus > 0 && (
                      <span className="text-indigo-400 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        +{serverFeedback.speedBonus} speed
                      </span>
                    )}
                    <span className="font-bold">=&nbsp;{serverFeedback.totalScore} pts</span>
                  </span>
                </>
              ) : selected === -1 || selected === null ? (
                <span>Time expired — 0 points awarded</span>
              ) : (
                <>
                  <span className="flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" />
                    Incorrect — 0 points
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

  // 2. Start Assessment
  const handleStart = async (topic: string, count: number) => {
    setIsStarting(true);
    setErrorMsg(null);

    try {
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
          setErrorMsg(res.error || "Failed to submit answer.");
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Failed to communicate with server.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentQuestion, sessionId, isSubmitting]
  );

  // 4. Advance to Next Question
  const handleProceedNext = useCallback(() => {
    if (completedSummary) {
      setPhase("complete");
      return;
    }

    if (nextQuestionBuffered) {
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
