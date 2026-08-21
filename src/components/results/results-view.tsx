"use client";

/**
 * PARAKH — Results View Client Component
 * Phase 5.5: Database-backed Student Results
 *
 * Renders the full Results page UI using server-fetched, ownership-verified
 * session data. All result values come from the database via getSessionResult().
 * No localStorage or mock data is used.
 *
 * The component handles:
 * - Valid completed assessment display
 * - No sessions (new student) empty state
 * - Invalid/nonexistent session ID
 * - Session belonging to another student
 * - Incomplete/in-progress session
 * - Client-side session switching (re-fetching from server)
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  Target,
  Play,
  BarChart3,
  BrainCircuit,
  Zap,
  Lightbulb,
} from "lucide-react";
import type { SessionResult, SessionResultData } from "@/lib/actions/results";
import { getSessionResult } from "@/lib/actions/results";

const TOPIC_FILTERS = ["All", "DSA", "DBMS", "OS", "CN"] as const;
type TopicFilter = (typeof TOPIC_FILTERS)[number];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/80 bg-card px-3 py-2 shadow-xl text-xs space-y-1">
      <p className="font-semibold text-foreground">Q{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error / Empty States
// ---------------------------------------------------------------------------

function EmptyState({
  title,
  message,
  showCTA = true,
}: {
  title: string;
  message: string;
  showCTA?: boolean;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="text-center space-y-2">
        <Badge
          variant="outline"
          className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-0.5"
        >
          Analytics &amp; Results
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{message}</p>
      </div>

      <Card className="p-8 border border-border/80 bg-card shadow-lg text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mx-auto">
          <BrainCircuit className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">
            {showCTA ? "Ready to test your knowledge?" : "Access Denied"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {showCTA
              ? "Choose between 5, 10, or 15 question adaptive tests across DSA, DBMS, OS, and CN."
              : "You can only view results for your own completed assessments."}
          </p>
        </div>

        {showCTA && (
          <Button
            asChild
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 gap-2 px-6"
          >
            <Link href="/assessment">
              <Play className="h-4 w-4 fill-current" />
              Start Assessment Now
            </Link>
          </Button>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main results view
// ---------------------------------------------------------------------------

function ResultsDataView({
  data,
  onSessionSelect,
  isPending,
}: {
  data: SessionResultData;
  onSessionSelect: (id: string) => void;
  isPending: boolean;
}) {
  const [activeFilter, setActiveFilter] = useState<TopicFilter>("All");

  const filteredHistory =
    activeFilter === "All"
      ? data.sessionHistory
      : data.sessionHistory.filter((s) =>
          s.topic.toLowerCase().includes(activeFilter.toLowerCase())
        );

  return (
    <div className={`space-y-7 transition-opacity ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs"
            >
              Assessment Result Details
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              ID: {data.sessionId.slice(-8)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {data.topic} Adaptive Session
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Completed on {data.formattedDate}
          </p>
        </div>
        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shrink-0"
        >
          <Link href="/assessment">
            <Play className="h-4 w-4 fill-current" />
            New Assessment
          </Link>
        </Button>
      </div>

      {/* 4-stat summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-border/80 bg-card shadow-sm flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-lg font-extrabold text-foreground">{data.percentageScore}%</p>
          </div>
        </Card>

        <Card className="p-4 border border-border/80 bg-card shadow-sm flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Accuracy</p>
            <p className="text-lg font-extrabold text-emerald-400">
              {data.correctCount} / {data.questionCount} Correct
            </p>
          </div>
        </Card>

        <Card className="p-4 border border-border/80 bg-card shadow-sm flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Speed Bonus</p>
            <p className="text-lg font-extrabold text-indigo-400">+{data.totalBonus} pts</p>
          </div>
        </Card>

        <Card className="p-4 border border-border/80 bg-card shadow-sm flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ability Estimate</p>
            <p className="text-lg font-extrabold text-foreground">
              {data.abilityFinal}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({data.abilityDelta >= 0 ? `+${data.abilityDelta}` : data.abilityDelta})
              </span>
            </p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Ability Chart + Topic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ability Trajectory Chart */}
        <Card className="lg:col-span-8 p-6 border border-border/80 bg-card shadow-md">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              <h3 className="text-base font-bold text-foreground">Ability Trajectory</h3>
            </div>
            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/60">
              {data.questionCount} Step Progression
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Real ability score adjustments after each question in this session.
          </p>

          <div className="flex items-center gap-4 mb-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block" />
              Estimated Ability
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 border-t-2 border-dashed border-amber-500 inline-block" />
              Item Difficulty
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.chartPoints} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="questionNumber"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[20, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="ability"
                name="Ability Score"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="difficulty"
                name="Item Difficulty"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Session-scoped Topic Proficiency */}
        <Card className="lg:col-span-4 p-6 border border-border/80 bg-card shadow-md">
          <h3 className="text-base font-bold text-foreground mb-4">Topic Proficiency</h3>
          <div className="space-y-4">
            {data.topicSummaries.map((topic) => (
              <div key={topic.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: topic.color }}
                    >
                      {topic.code[0]}
                    </span>
                    <span className="font-medium text-foreground">{topic.name}</span>
                  </div>
                  {topic.assessed ? (
                    <span
                      className={`font-bold ${
                        topic.status === "Strong"
                          ? "text-emerald-400"
                          : topic.status === "Needs Work"
                          ? "text-amber-400"
                          : "text-indigo-400"
                      }`}
                    >
                      {topic.proficiency}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">Not Assessed</span>
                  )}
                </div>

                {topic.assessed ? (
                  <>
                    <Progress value={topic.proficiency} className="h-1.5 bg-muted" />
                    <p className="text-[10px] text-muted-foreground">
                      {topic.status} · {topic.totalQuestions} items ({topic.accuracy}% accuracy)
                    </p>
                  </>
                ) : (
                  <div className="h-1.5 w-full rounded-full bg-muted/40" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Item Response Breakdown — full question review with answers & explanations */}
      <Card className="p-6 border border-border/80 bg-card shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Item Response Breakdown</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review answers, explanations, and speed bonuses for this session.
            </p>
          </div>
          <Badge variant="outline" className="text-xs border-border/60">
            {data.correctCount} / {data.questionCount} Correct
          </Badge>
        </div>

        <div className="space-y-3">
          {data.questions.map((q) => (
            <div
              key={q.questionId}
              className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400">
                      {q.topicCode}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] border-border/60 text-muted-foreground">
                      Level {q.difficultyLevel} — {q.difficultyLabel}
                    </Badge>
                    {q.speedBonus > 0 && (
                      <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-[10px] gap-1 py-0">
                        <Zap className="h-3 w-3" />
                        +{q.speedBonus} Speed Bonus
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold text-foreground text-sm leading-snug">
                    Q{q.questionNumber}. {q.questionText}
                  </p>
                </div>
                {q.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-1" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-1" />
                )}
              </div>

              {/* Answer details */}
              <div className="pt-1 text-muted-foreground space-y-1">
                {q.selectedOptionIndex === -1 ? (
                  <p className="italic text-red-400/90">Timed out — no option selected.</p>
                ) : (
                  <p>
                    Your Answer:{" "}
                    <span
                      className={
                        q.isCorrect
                          ? "text-emerald-400 font-semibold"
                          : "text-red-400 font-semibold"
                      }
                    >
                      {q.options[q.selectedOptionIndex] ?? "—"}
                    </span>
                    {!q.isCorrect && q.correctOptionIndex >= 0 && (
                      <>
                        {" "}· Correct Answer:{" "}
                        <span className="text-emerald-400 font-semibold">
                          {q.options[q.correctOptionIndex] ?? "—"}
                        </span>
                      </>
                    )}
                  </p>
                )}
                {q.explanation && (
                  <div className="rounded-lg bg-muted/30 p-2.5 text-muted-foreground/80 mt-1 text-[11px] leading-relaxed flex items-start gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Session History List with topic filter */}
      <Card className="p-6 border border-border/80 bg-card shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-foreground">Session History</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Showing {filteredHistory.length} of {data.sessionHistory.length} total completed assessments.
            </p>
          </div>
          {/* Topic filter tabs */}
          <div className="flex flex-wrap gap-1.5">
            {TOPIC_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeFilter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No completed sessions match this topic filter.
            </p>
          ) : (
            filteredHistory.map((item) => {
              const isSelected = item.id === data.sessionId;
              return (
                <button
                  key={item.id}
                  onClick={() => !isSelected && onSessionSelect(item.id)}
                  disabled={isSelected}
                  className={`w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 rounded-lg border transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/10 text-foreground cursor-default"
                      : "border-border/60 bg-muted/10 hover:bg-muted/30 text-muted-foreground hover:text-foreground cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText
                      className={`h-4 w-4 shrink-0 ${
                        isSelected ? "text-indigo-400" : "text-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {item.topic} Adaptive Assessment
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {item.formattedDate} · {item.questionCount} questions · Score:{" "}
                        {item.percentageScore}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs font-semibold">Ability: {item.abilityFinal}</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] gap-1 py-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </Badge>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root export
// ---------------------------------------------------------------------------

export function ResultsView({ initialResult }: { initialResult: SessionResult }) {
  const [result, setResult] = useState<SessionResult>(initialResult);
  const [isPending, startTransition] = useTransition();

  function handleSessionSelect(sessionId: string) {
    startTransition(async () => {
      const next = await getSessionResult(sessionId);
      setResult(next);
    });
  }

  // Error / empty states
  if (!result.ok) {
    switch (result.error) {
      case "no_sessions":
        return (
          <EmptyState
            title="No Assessment Data Found"
            message={result.message}
            showCTA={true}
          />
        );
      case "unauthenticated":
        return (
          <EmptyState
            title="Sign In Required"
            message={result.message}
            showCTA={false}
          />
        );
      case "not_yours":
        return (
          <EmptyState
            title="Access Denied"
            message={result.message}
            showCTA={false}
          />
        );
      case "not_completed":
        return (
          <EmptyState
            title="Assessment Not Completed"
            message={result.message}
            showCTA={true}
          />
        );
      case "not_found":
      default:
        return (
          <EmptyState
            title="Session Not Found"
            message={result.message}
            showCTA={true}
          />
        );
    }
  }

  return (
    <ResultsDataView
      data={result}
      onSessionSelect={handleSessionSelect}
      isPending={isPending}
    />
  );
}
