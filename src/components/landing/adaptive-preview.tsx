"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Sparkles, TrendingUp, Cpu, Gauge } from "lucide-react";
import { MOCK_ABILITY_TRAJECTORY } from "@/lib/mock-data";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

export function AdaptivePreview() {
  return (
    <Card className="relative overflow-hidden border border-border/80 bg-card/60 backdrop-blur-xl shadow-2xl p-5 sm:p-6 text-foreground">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active CAT Engine Session</span>
            <h4 className="text-sm font-bold text-foreground">Adaptive Question Selection Matrix</h4>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 text-xs gap-1 py-1">
            <Cpu className="h-3 w-3" />
            <span>Target Ability: ~78%</span>
          </Badge>
        </div>
      </div>

      {/* Main Grid: Active Question Mock + Live Trajectory Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Simulated Question Card */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono">Question 04 / 15</span>
            <div className="flex items-center gap-1.5">
              <span>Difficulty:</span>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono text-[10px]">
                Level 4 • Hard
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-xs sm:text-sm font-medium leading-relaxed">
            In a DBMS supporting ACID properties, which locking protocol guarantees serializability while preventing cascading rollbacks under strict execution rules?
          </div>

          {/* Options */}
          <div className="space-y-2 mt-1">
            {[
              { letter: "A", text: "2-Phase Locking (2PL)", correct: false },
              { letter: "B", text: "Strict 2-Phase Locking (Strict 2PL)", correct: true },
              { letter: "C", text: "Basic Timestamp Ordering", correct: false },
              { letter: "D", text: "Optimistic Concurrency Control", correct: false },
            ].map((opt, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-md border p-2.5 text-xs transition-colors ${
                  opt.correct
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-medium"
                    : "border-border/50 bg-background/50 text-muted-foreground hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                      opt.correct ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {opt.letter}
                  </span>
                  <span>{opt.text}</span>
                </div>
                {opt.correct && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              </div>
            ))}
          </div>

          {/* Heuristic Feedback bar */}
          <div className="mt-2 flex items-center justify-between rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 text-[11px] text-indigo-300">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Correct (+12 Ability Score) • Next Question Difficulty: <strong>Level 5 (Hard)</strong></span>
            </div>
            <span className="font-mono text-[10px]">Response Time: 28s</span>
          </div>
        </div>

        {/* Right Column: Live Trajectory Graph */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-border/50 bg-background/40 p-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold text-foreground">Ability Trajectory (θ)</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Dynamic CAT Model</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_ABILITY_TRAJECTORY} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="questionNumber" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis domain={[40, 100]} stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <ReferenceLine y={70} stroke="#6366f1" strokeDasharray="3 3" label={{ value: 'Hard Threshold', fill: '#818cf8', fontSize: 9 }} />
                  <Line
                    type="monotone"
                    dataKey="ability"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: "#6366f1", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini Stats Summary below graph */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/40 text-[11px]">
            <div className="rounded bg-muted/40 p-2 text-center">
              <span className="text-muted-foreground block text-[10px]">Topic Selection Bias</span>
              <span className="font-semibold text-indigo-400">DBMS (High Priority)</span>
            </div>
            <div className="rounded bg-muted/40 p-2 text-center">
              <span className="text-muted-foreground block text-[10px]">Exposure Risk</span>
              <span className="font-semibold text-emerald-400">Low (Unused Q)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
