"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  CheckCircle2,
  FileText,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  Play,
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
      <p className="font-semibold text-foreground">{label}</p>
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
  const avgAbility = Math.round(
    MOCK_RECENT_ASSESSMENTS.reduce((s, a) => s + a.abilityScore, 0) /
      MOCK_RECENT_ASSESSMENTS.length
  );

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs"
              >
                Analytics & Results
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Performance Overview
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Your ability trajectory, topic breakdown, and full assessment history.
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

        {/* Summary stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Assessments",
              value: MOCK_STUDENT.assessmentsCompleted,
              icon: FileText,
              color: "text-indigo-400",
              bg: "bg-indigo-500/10",
            },
            {
              label: "Questions Answered",
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
            {
              label: "Avg Ability",
              value: avgAbility,
              icon: Zap,
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
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
                  <Icon className={`h-4.5 w-4.5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-extrabold text-foreground">{stat.value}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Ability Trajectory Chart */}
        <Card className="p-6 border border-border/80 bg-card shadow-md">
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-0.5">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              <h3 className="text-base font-bold text-foreground">
                Ability Trajectory
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated ability vs. question difficulty across your last adaptive session.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
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
              <Legend
                wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
              />
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
                name="Question Difficulty"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Topic proficiency grid */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-3">
            Topic Proficiency
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_TOPICS.map((topic) => (
              <Card
                key={topic.id}
                className="p-4 border border-border/80 bg-card shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: topic.color + "30", color: topic.color }}
                  >
                    {topic.code}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      topic.trend === "up"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : topic.trend === "down"
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : "border-border/60 text-muted-foreground"
                    }`}
                  >
                    {topic.trend === "up"
                      ? "↑ Improving"
                      : topic.trend === "down"
                      ? "↓ Declining"
                      : "→ Stable"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    {topic.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {topic.totalQuestions} questions · {topic.accuracy}% accuracy
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Proficiency</span>
                    <span className="font-bold text-foreground">
                      {topic.proficiency}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${topic.proficiency}%`,
                        backgroundColor: topic.color,
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Session history */}
        <Card className="p-6 border border-border/80 bg-card shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h3 className="text-base font-bold text-foreground">Session History</h3>
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

          <div className="space-y-3">
            {filteredAssessments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No sessions match this filter.
              </p>
            ) : (
              filteredAssessments.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-foreground">
                          {item.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 border-border/60 text-muted-foreground"
                        >
                          {item.subject}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.questionsCount} Questions</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                    <div className="text-left sm:text-right">
                      <span className="text-sm font-extrabold text-foreground">
                        {item.score}%
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        Ability: {item.abilityScore}
                      </span>
                    </div>
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
