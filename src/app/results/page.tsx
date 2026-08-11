"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
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
  FileText,
  TrendingUp,
  Target,
  Play,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import {
  MOCK_RECENT_ASSESSMENTS,
  MOCK_TOPICS,
  MOCK_ABILITY_TRAJECTORY,
  MOCK_STUDENT,
} from "@/lib/mock-data";

// Topic filter tabs
const TOPIC_FILTERS = ["All", "DSA", "DBMS", "OS", "CN"] as const;
type TopicFilter = (typeof TOPIC_FILTERS)[number];

// Custom tooltip for Recharts
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

export default function ResultsPage() {
  const [activeFilter, setActiveFilter] = useState<TopicFilter>("All");

  const filteredAssessments =
    activeFilter === "All"
      ? MOCK_RECENT_ASSESSMENTS
      : MOCK_RECENT_ASSESSMENTS.filter((a) =>
          a.subject.toLowerCase().includes(activeFilter.toLowerCase()) ||
          a.title.toLowerCase().includes(activeFilter.toLowerCase())
        );

  // Summary stats
  const totalQuestions = MOCK_STUDENT.totalQuestionsAnswered;
  const avgScore = Math.round(
    MOCK_RECENT_ASSESSMENTS.reduce((s, a) => s + a.score, 0) /
      MOCK_RECENT_ASSESSMENTS.length
  );

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Analytics &amp; Results
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Ability trajectory, topic breakdown, and session history.
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

        {/* Summary stats — 3 compact cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Sessions",
              value: MOCK_STUDENT.assessmentsCompleted,
              icon: FileText,
              color: "text-indigo-400",
              bg: "bg-indigo-500/10",
            },
            {
              label: "Questions",
              value: totalQuestions,
              icon: Target,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Avg Score",
              value: `${avgScore}%`,
              icon: TrendingUp,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="p-4 border border-border/80 bg-card shadow-sm flex items-center gap-3"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} shrink-0`}
                >
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-extrabold text-foreground">{stat.value}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Ability Trajectory Chart + Topic Proficiency side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-8 p-6 border border-border/80 bg-card shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              <h3 className="text-base font-bold text-foreground">
                Ability Trajectory
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              Estimated ability vs. question difficulty across your last adaptive session.
            </p>
            <div className="flex items-center gap-4 mb-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />
                Ability Score
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-0.5 w-5 border-t-2 border-dashed border-amber-500 inline-block" />
                Question Difficulty
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={MOCK_ABILITY_TRAJECTORY}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis
                  dataKey="questionNumber"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[40, 100]}
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
                  name="Difficulty"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Topic Proficiency — compact list */}
          <Card className="lg:col-span-4 p-6 border border-border/80 bg-card shadow-md">
            <h3 className="text-base font-bold text-foreground mb-4">
              Topic Proficiency
            </h3>
            <div className="space-y-4">
              {MOCK_TOPICS.map((topic) => {
                const isStrong = topic.proficiency >= 80;
                const isWeak = topic.proficiency < 65;
                return (
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
                      <span
                        className={`font-bold ${
                          isStrong
                            ? "text-emerald-400"
                            : isWeak
                            ? "text-amber-400"
                            : "text-indigo-400"
                        }`}
                      >
                        {topic.proficiency}%
                      </span>
                    </div>
                    <Progress value={topic.proficiency} className="h-1.5 bg-muted" />
                    <p className="text-[10px] text-muted-foreground">
                      {isStrong ? "Strong" : isWeak ? "Needs Work" : "Developing"} · {topic.accuracy}% accuracy
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Session history */}
        <Card className="p-6 border border-border/80 bg-card shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-bold text-foreground">Session History</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Demo data — real sessions will appear here after connecting to the database.
              </p>
            </div>
            {/* Topic filter */}
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
            {filteredAssessments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No sessions match this filter.
              </p>
            ) : (
              filteredAssessments.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 rounded-lg border border-border/60 bg-muted/10 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground leading-tight">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {item.date} · {item.questionsCount} questions · {item.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-base font-extrabold text-foreground">{item.score}%</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] gap-1 py-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
