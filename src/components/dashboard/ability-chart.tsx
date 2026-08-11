"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import {
  getStoredAssessments,
  getLatestAssessment,
  CompletedAssessment,
} from "@/lib/assessment-storage";

export function AbilityChart() {
  const [assessments, setAssessments] = useState<CompletedAssessment[]>([]);

  useEffect(() => {
    setAssessments(getStoredAssessments());
  }, []);

  const hasData = assessments.length > 0;
  const latest = getLatestAssessment();

  // Build chart points from real data
  let chartData: { label: string; ability: number; topic?: string }[] = [];
  let chartSubtitle = "Real ability progression derived from completed sessions.";

  if (hasData) {
    if (assessments.length === 1 && latest) {
      // 1 assessment completed: show question-by-question progression of that session
      chartSubtitle = `Question-by-question ability trajectory for latest ${latest.topic} session.`;
      chartData = latest.results.map((r, idx) => ({
        label: `Q${idx + 1}`,
        ability: r.abilityAfter,
        topic: r.question.topic,
      }));
    } else {
      // Multiple assessments completed: show session-by-session final ability progression (oldest to newest)
      chartSubtitle = `Ability progression across your last ${assessments.length} completed sessions.`;
      const sorted = [...assessments].reverse(); // reverse so oldest is first
      chartData = sorted.map((a, idx) => ({
        label: `S${idx + 1} (${a.topic})`,
        ability: a.abilityFinal,
        topic: a.topic,
      }));
    }
  }

  return (
    <Card className="p-6 border border-border/80 bg-card shadow-md flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ability Trajectory</span>
          <h3 className="text-lg font-bold text-foreground mt-0.5">Ability Score Over Time</h3>
        </div>

        {hasData && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 border border-border/60 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              <span>Estimated Ability</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart vs Empty State */}
      {!hasData ? (
        <div className="h-64 sm:h-72 w-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-center">
          <p className="text-sm font-semibold text-foreground">No Trajectory Data Yet</p>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            Complete your first adaptive assessment to establish your ability trajectory curve.
          </p>
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
              <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis domain={[20, 100]} stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f4f4f5",
                }}
                formatter={(val: any) => [`${val} pts`, "Ability"]}
              />
              <ReferenceLine
                y={68}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: "Advanced Threshold (68)", fill: "#fbbf24", fontSize: 10, position: "insideTopRight" }}
              />
              <Line
                type="monotone"
                dataKey="ability"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#18181b" }}
                activeDot={{ r: 7, fill: "#818cf8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
        <span>{chartSubtitle}</span>
      </div>
    </Card>
  );
}
