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
} from "lucide-react";
import {
  selectNextQuestion,
  updateAbility,
  questionScore,
  INITIAL_ABILITY,
  TIMER_SECONDS,
  BASE_CORRECT_SCORE,
  SPEED_BONUS_MAX,
} from "@/lib/adaptive-engine";
import { AssessmentQuestion } from "@/lib/mock-data";
import {
  saveCompletedAssessment,
  CompletedAssessment,
} from "@/lib/assessment-storage";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "setup" | "question" | "complete";

interface SessionResult {
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

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({ onStart }: { onStart: (topic: string, count: number) => void }) {
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
          Questions adapt to your ability in real time. Each correct answer increases
          difficulty; incorrect answers recalibrate it.
        </p>
      </div>

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
            Scoring
          </div>
          <p>Correct answer: <span className="text-foreground font-medium">100 base points</span></p>
          <p>Speed bonus: up to <span className="text-indigo-400 font-medium">+{SPEED_BONUS_MAX} pts</span> for answering quickly</p>
          <p>Incorrect / timed out: <span className="text-muted-foreground">0 points</span></p>
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
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-11 text-sm shadow-lg shadow-indigo-600/20 gap-2"
        >
          <Play className="h-4 w-4 fill-current" />
          Begin Assessment
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
  currentAbility,
  onAnswer,
}: {
  question: AssessmentQuestion;
  questionIndex: number;
  totalQuestions: number;
  currentAbility: number;
  onAnswer: (selectedIndex: number, timeRemaining: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timeAtSubmit, setTimeAtSubmit] = useState(0);

  // Reset on question change
  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
    setTimeLeft(TIMER_SECONDS);
    setTimeAtSubmit(0);
  }, [question.id]);

  // Countdown timer — runs every second when not submitted
  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      // Timer expired: auto-submit as timed out
      setTimeAtSubmit(0);
      setSubmitted(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, submitted]);

  const isCorrect = selected !== null && selected === question.correctOptionIndex;
  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const progress = (questionIndex / totalQuestions) * 100;

  // Compute score to show after submission
  const scored = submitted
    ? questionScore(isCorrect, timeAtSubmit, TIMER_SECONDS)
    : null;

  const handleSubmit = () => {
    if (selected === null || submitted) return;
    setTimeAtSubmit(timeLeft);
    setSubmitted(true);
  };

  const handleNext = () => {
    const finalTimeRemaining = submitted ? timeAtSubmit : 0;
    onAnswer(selected ?? -1, finalTimeRemaining);
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
            if (!submitted) {
              cls +=
                selected === idx
                  ? "border-indigo-500 bg-indigo-500/10 text-foreground cursor-pointer"
                  : "border-border/60 bg-muted/20 text-muted-foreground hover:border-indigo-500/50 hover:text-foreground hover:bg-muted/40 cursor-pointer";
            } else {
              if (idx === question.correctOptionIndex) {
                cls += "border-emerald-500 bg-emerald-500/10 text-emerald-300";
              } else if (idx === selected && !isCorrect) {
                cls += "border-red-500 bg-red-500/10 text-red-300";
              } else {
                cls += "border-border/30 bg-muted/10 text-muted-foreground/50 cursor-default";
              }
            }

            return (
              <button
                key={idx}
                className={cls}
                onClick={() => !submitted && setSelected(idx)}
                disabled={submitted}
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md border border-current text-xs font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{option}</span>
                  {submitted && idx === question.correctOptionIndex && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {submitted && idx === selected && !isCorrect && (
                    <XCircle className="ml-auto h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Post-submission: score + explanation */}
        {submitted && (
          <div className="space-y-3">
            {/* Score row */}
            {scored && (
              <div
                className={`flex items-center justify-between rounded-lg px-4 py-2.5 border text-xs font-semibold ${
                  isCorrect
                    ? "bg-emerald-500/[0.06] border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/[0.06] border-red-500/30 text-red-400"
                }`}
              >
                {isCorrect ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Correct!
                    </span>
                    <span className="flex items-center gap-2 text-foreground">
                      <span className="text-muted-foreground">{scored.base} base</span>
                      {scored.bonus > 0 && (
                        <span className="text-indigo-400 flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          +{scored.bonus} speed
                        </span>
                      )}
                      <span className="font-bold">=&nbsp;{scored.total} pts</span>
                    </span>
                  </>
                ) : selected === -1 || selected === null ? (
                  <span>Time expired — no points awarded</span>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5" />
                      Incorrect — 0 points
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Explanation */}
            <div
              className={`rounded-xl p-4 border space-y-1.5 ${
                isCorrect
                  ? "bg-emerald-500/[0.04] border-emerald-500/20"
                  : "bg-amber-500/[0.04] border-amber-500/20"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Lightbulb
                  className={`h-3.5 w-3.5 ${isCorrect ? "text-emerald-400" : "text-amber-400"}`}
                />
                <span className={isCorrect ? "text-emerald-400" : "text-amber-400"}>
                  {isCorrect ? "Correct!" : "Incorrect — here's why:"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {!submitted && selected === null ? "Select an answer to continue" : ""}
          </span>
          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={selected === null}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 disabled:opacity-40"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
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
  results,
  totalCount,
  abilityStart,
  abilityFinal,
  assessmentId,
  onRestart,
}: {
  results: SessionResult[];
  totalCount: number;
  abilityStart: number;
  abilityFinal: number;
  assessmentId?: string;
  onRestart: () => void;
}) {
  const correct = results.filter((r) => r.correct).length;
  const totalScore = results.reduce((s, r) => s + r.score, 0);
  const totalBonus = results.reduce((s, r) => s + r.bonus, 0);
  const maxPossible = totalCount * (BASE_CORRECT_SCORE + SPEED_BONUS_MAX);
  const pct = Math.round((correct / totalCount) * 100);
  const abilityDelta = abilityFinal - abilityStart;

  const grade =
    pct >= 85
      ? { label: "Excellent", color: "text-emerald-400" }
      : pct >= 65
      ? { label: "Good", color: "text-indigo-400" }
      : pct >= 45
      ? { label: "Fair", color: "text-amber-400" }
      : { label: "Needs Work", color: "text-red-400" };

  // Grid columns for question dots: max 5 per row
  const gridCols =
    totalCount <= 5
      ? "grid-cols-5"
      : totalCount <= 10
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
          <strong className="text-foreground">{correct}</strong> of{" "}
          <strong className="text-foreground">{totalCount}</strong> questions correctly.
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
            <p className="text-lg font-extrabold text-emerald-400">{correct}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5">
            <p className="text-muted-foreground">Incorrect</p>
            <p className="text-lg font-extrabold text-red-400">{totalCount - correct}</p>
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
            {results.map((r, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center py-2 rounded-lg border text-xs font-bold ${
                  r.correct
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : r.selectedIndex === -1
                    ? "bg-muted/30 border-border/40 text-muted-foreground"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
                title={
                  r.correct
                    ? `Q${idx + 1}: Correct (+${r.score}pts)`
                    : r.selectedIndex === -1
                    ? `Q${idx + 1}: Timed out`
                    : `Q${idx + 1}: Incorrect`
                }
              >
                <span>Q{idx + 1}</span>
                {r.correct ? (
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
            {results.map((r, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border/50 bg-muted/10 p-3 text-xs space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-foreground leading-snug">
                    Q{idx + 1}. {r.question.questionText}
                  </span>
                  {r.correct ? (
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
                      className={r.correct ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}
                    >
                      {r.question.options[r.selectedIndex]}
                    </span>
                    {!r.correct && (
                      <>
                        {" "}· Correct:{" "}
                        <span className="text-emerald-400 font-medium">
                          {r.question.options[r.question.correctOptionIndex]}
                        </span>
                      </>
                    )}
                  </p>
                )}
                <p className="text-muted-foreground/70 leading-relaxed">
                  {r.question.explanation}
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
            <Link href={assessmentId ? `/results?id=${assessmentId}` : "/results"}>
              View Analytics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(5);
  const [selectedTopic, setSelectedTopic] = useState("Mixed");
  const [results, setResults] = useState<SessionResult[]>([]);
  const [ability, setAbility] = useState(INITIAL_ABILITY);
  const [abilityStart, setAbilityStart] = useState(INITIAL_ABILITY);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string>("");
  const usedIdsRef = useRef<Set<string>>(new Set());

  const handleStart = (topic: string, count: number) => {
    usedIdsRef.current = new Set();
    const first = selectNextQuestion(INITIAL_ABILITY, usedIdsRef.current, topic);
    if (!first) return; // should not happen with 20 questions

    setSelectedTopic(topic);
    setTotalCount(count);
    setAbility(INITIAL_ABILITY);
    setAbilityStart(INITIAL_ABILITY);
    setResults([]);
    setQuestionIndex(0);
    setCurrentQuestion(first);
    setCurrentAssessmentId("");
    usedIdsRef.current.add(first.id);
    setPhase("question");
  };

  const finishAssessment = useCallback(
    (finalResults: SessionResult[], finalAbility: number) => {
      const asmtId = `asmt_${Date.now()}`;
      setCurrentAssessmentId(asmtId);

      const correctCount = finalResults.filter((r) => r.correct).length;
      const completed: CompletedAssessment = {
        id: asmtId,
        completedAt: new Date().toISOString(),
        formattedDate: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        topic: selectedTopic,
        questionCount: totalCount,
        correctCount,
        percentageScore: Math.round((correctCount / totalCount) * 100),
        totalScore: finalResults.reduce((s, r) => s + r.score, 0),
        totalBonus: finalResults.reduce((s, r) => s + r.bonus, 0),
        abilityStart,
        abilityFinal: finalAbility,
        abilityDelta: finalAbility - abilityStart,
        results: finalResults,
      };

      saveCompletedAssessment(completed);
      setPhase("complete");
    },
    [selectedTopic, totalCount, abilityStart]
  );

  const handleAnswer = useCallback(
    (selectedIndex: number, timeRemaining: number) => {
      if (!currentQuestion) return;

      const correct = selectedIndex !== -1 && selectedIndex === currentQuestion.correctOptionIndex;
      const { base, bonus, total } = questionScore(correct, timeRemaining, TIMER_SECONDS);
      const abilityBefore = ability;
      const abilityAfter = updateAbility(ability, correct, currentQuestion.difficultyLevel);

      const result: SessionResult = {
        questionId: currentQuestion.id,
        question: currentQuestion,
        selectedIndex,
        correct,
        abilityBefore,
        abilityAfter,
        timeRemaining,
        base,
        bonus,
        score: total,
      };

      const newResults = [...results, result];
      setResults(newResults);
      setAbility(abilityAfter);

      const nextIndex = questionIndex + 1;

      if (nextIndex < totalCount) {
        // Select next question adaptively
        const next = selectNextQuestion(abilityAfter, usedIdsRef.current, selectedTopic);
        if (next) {
          usedIdsRef.current.add(next.id);
          setCurrentQuestion(next);
          setQuestionIndex(nextIndex);
        } else {
          // Pool exhausted early — end assessment
          finishAssessment(newResults, abilityAfter);
        }
      } else {
        finishAssessment(newResults, abilityAfter);
      }
    },
    [currentQuestion, ability, results, questionIndex, totalCount, selectedTopic, finishAssessment]
  );

  const handleRestart = () => {
    usedIdsRef.current = new Set();
    setPhase("setup");
    setCurrentQuestion(null);
    setQuestionIndex(0);
    setResults([]);
    setAbility(INITIAL_ABILITY);
    setAbilityStart(INITIAL_ABILITY);
    setCurrentAssessmentId("");
  };

  return (
    <DashboardLayout>
      {phase === "setup" && <SetupScreen onStart={handleStart} />}
      {phase === "question" && currentQuestion && (
        <QuestionScreen
          key={currentQuestion.id}
          question={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={totalCount}
          currentAbility={ability}
          onAnswer={handleAnswer}
        />
      )}
      {phase === "complete" && (
        <CompleteScreen
          results={results}
          totalCount={totalCount}
          abilityStart={abilityStart}
          abilityFinal={ability}
          assessmentId={currentAssessmentId}
          onRestart={handleRestart}
        />
      )}
    </DashboardLayout>
  );
}
