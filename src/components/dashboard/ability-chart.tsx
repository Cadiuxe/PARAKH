"use client";

import { Card } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { MOCK_ABILITY_TRAJECTORY } from "@/lib/mock-data";
import { TrendingUp } from "lucide-react";

export function AbilityChart() {
  return (
    <Card className="p-6 border border-border/80 bg-card shadow-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ability Trajectory</span>
          <h3 className="text-lg font-bold text-foreground mt-0.5">Ability Score Over Time</h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 border border-border/60 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            <span>Ability Score</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 border border-border/60 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <span>Difficulty Baseline</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MOCK_ABILITY_TRAJECTORY} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
            <XAxis dataKey="questionNumber" stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis domain={[40, 100]} stroke="#71717a" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#27272a",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#f4f4f5",
              }}
              formatter={(value: any, name: any) => [`${value} Ability Score`, "Estimated Theta"]}
              labelFormatter={(label) => `Question Step: ${label}`}
            />
            <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Hard Difficulty Threshold (70)', fill: '#fbbf24', fontSize: 10, position: 'insideTopRight' }} />
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

      <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
        <span>Ability rises after correct responses and recalibrates after incorrect ones. Shown for the most recent demo session.</span>
      </div>
    </Card>
  );
}
