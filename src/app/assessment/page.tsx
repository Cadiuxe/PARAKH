"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { MOCK_ASSESSMENT_QUESTIONS, AssessmentQuestion } from "@/lib/mock-data";

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = "setup" | "question" | "explanation" | "complete";

interface SessionResult {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TOPICS = ["Mixed", "DSA", "DBMS", "OS", "CN"] as const;
const QUESTION_COUNTS = [5, 10, 15] as const;
const TIMER_DURATION = 90; // seconds

// Difficulty colour helper
function difficultyColor(level: number) {
  if (level <= 2) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  if (level === 3) return "bg-amber-500/10 border-amber-500/30 text-amber-400";
  return "bg-red-500/10 border-red-500/30 text-red-400";
}

// ─── Sub-screens ─────────────────────────────────────────────────────────────

function SetupScreen({
  onStart,
}: {
  onStart: (topic: string, count: number) => void;
}) {
  const [topic, setTopic] = useState<string>("Mixed");
  const [count, setCount] = useState<number>(5);

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto">
          <BrainCircuit className="h-7 w-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Start Adaptive Assessment
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The engine selects questions dynamically based on your responses and
          adjusts difficulty in real time.
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

        {/* Info row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            90 sec / question
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
  onAnswer,
}: {
  question: AssessmentQuestion;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);

  // Reset state when question changes
  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
    setTimeLeft(TIMER_DURATION);
  }, [question.id]);

  // Timer
  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      // Auto-submit with no selection (counts as wrong)
      setSubmitted(true);
      setTimeout(() => onAnswer(-1), 1200);
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted, onAnswer]);

  const progress = ((questionIndex) / totalQuestions) * 100;
  const timerPct = (timeLeft / TIMER_DURATION) * 100;
  const isCorrect = selected === question.correctOptionIndex;

  const handleSubmit = () => {
    if (selected === null || submitted) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    onAnswer(selected ?? -1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Question <span className="font-semibold text-foreground">{questionIndex + 1}</span>{" "}
            of {totalQuestions}
          </span>
          <span
            className={`flex items-center gap-1 font-mono font-semibold ${
              timeLeft <= 15 ? "text-red-400" : "text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
            {String(timeLeft % 60).padStart(2, "0")}
          </span>
        </div>
        <Progress value={progress} className="h-1.5 bg-muted" />
        {/* Timer bar */}
        <div className="w-full h-0.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timerPct > 40 ? "bg-indigo-500" : timerPct > 15 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <Card className="p-6 border border-border/80 bg-card shadow-md space-y-5">
        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
            {question.topic}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-border/60 text-muted-foreground">
            {question.subtopic}
          </Badge>
          <Badge
            variant="outline"
            className={`text-[10px] ${difficultyColor(question.difficultyLevel)}`}
          >
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
            let optionClass =
              "w-full text-left p-4 rounded-xl border text-sm font-medium transition-all cursor-pointer ";

            if (!submitted) {
              optionClass +=
                selected === idx
                  ? "border-indigo-500 bg-indigo-500/10 text-foreground"
                  : "border-border/60 bg-muted/20 text-muted-foreground hover:border-indigo-500/50 hover:text-foreground hover:bg-muted/40";
            } else {
              if (idx === question.correctOptionIndex) {
                optionClass += "border-emerald-500 bg-emerald-500/10 text-emerald-300";
              } else if (idx === selected && !isCorrect) {
                optionClass += "border-red-500 bg-red-500/10 text-red-300";
              } else {
                optionClass += "border-border/40 bg-muted/10 text-muted-foreground/50";
              }
            }

            return (
              <button
                key={idx}
                className={optionClass}
                onClick={() => !submitted && setSelected(idx)}
                disabled={submitted}
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-md border border-current text-xs font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{option}</span>
                  {submitted && idx === question.correctOptionIndex && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                  {submitted && idx === selected && !isCorrect && (
                    <XCircle className="ml-auto h-4 w-4 text-red-400 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation (post-submit) */}
        {submitted && (
          <div className={`rounded-xl p-4 border space-y-1.5 ${
            isCorrect
              ? "bg-emerald-500/[0.06] border-emerald-500/30"
              : "bg-amber-500/[0.06] border-amber-500/30"
          }`}>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Lightbulb className={`h-3.5 w-3.5 ${isCorrect ? "text-emerald-400" : "text-amber-400"}`} />
              <span className={isCorrect ? "text-emerald-400" : "text-amber-400"}>
                {isCorrect ? "Correct!" : "Incorrect — here's why:"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {selected === null && !submitted ? "Select an answer to continue" : ""}
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
  questions,
  onRestart,
}: {
  results: SessionResult[];
  questions: AssessmentQuestion[];
  onRestart: () => void;
}) {
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const pct = Math.round((correct / total) * 100);

  const grade =
    pct >= 85
      ? { label: "Excellent", color: "text-emerald-400" }
      : pct >= 65
      ? { label: "Good", color: "text-indigo-400" }
      : pct >= 45
      ? { label: "Fair", color: "text-amber-400" }
      : { label: "Needs Work", color: "text-red-400" };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 text-center">
      <div className="space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Assessment Complete
        </h1>
        <p className="text-sm text-muted-foreground">
          You answered <strong className="text-foreground">{correct}</strong> of{" "}
          <strong className="text-foreground">{total}</strong> questions correctly.
        </p>
      </div>

      <Card className="p-8 border border-border/80 bg-card shadow-md">
        {/* Score */}
        <div className="mb-6">
          <span className={`text-6xl font-black ${grade.color}`}>{pct}%</span>
          <p className={`text-lg font-bold mt-1 ${grade.color}`}>{grade.label}</p>
        </div>

        {/* Per-question summary */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {results.map((r, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-bold ${
                r.correct
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : r.selectedIndex === -1
                  ? "bg-muted/30 border-border/40 text-muted-foreground"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
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

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onRestart}
            className="flex-1 gap-2 border-border/70"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Button asChild className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
            <Link href="/results">
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
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);

  const handleStart = (topic: string, count: number) => {
    // Filter questions by topic (if not mixed) then slice to count
    const pool =
      topic === "Mixed"
        ? [...MOCK_ASSESSMENT_QUESTIONS]
        : MOCK_ASSESSMENT_QUESTIONS.filter((q) =>
            q.topic.toLowerCase().includes(topic.toLowerCase())
          );

    // If filtered pool is smaller than count, pad with others
    const filtered =
      pool.length >= count ? pool.slice(0, count) : MOCK_ASSESSMENT_QUESTIONS.slice(0, count);

    setQuestions(filtered);
    setCurrentIndex(0);
    setResults([]);
    setPhase("question");
  };

  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      const q = questions[currentIndex];
      const correct = selectedIndex === q.correctOptionIndex;
      const newResults = [
        ...results,
        { questionId: q.id, selectedIndex, correct },
      ];
      setResults(newResults);

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        setPhase("complete");
      }
    },
    [questions, currentIndex, results]
  );

  const handleRestart = () => {
    setPhase("setup");
    setQuestions([]);
    setCurrentIndex(0);
    setResults([]);
  };

  return (
    <DashboardLayout>
      {phase === "setup" && <SetupScreen onStart={handleStart} />}
      {phase === "question" && questions.length > 0 && (
        <QuestionScreen
          key={questions[currentIndex].id}
          question={questions[currentIndex]}
          questionIndex={currentIndex}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
        />
      )}
      {phase === "complete" && (
        <CompleteScreen
          results={results}
          questions={questions}
          onRestart={handleRestart}
        />
      )}
    </DashboardLayout>
  );
}
