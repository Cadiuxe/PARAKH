"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Clock, HelpCircle, TrendingUp, Cpu } from "lucide-react";
import { MOCK_STUDENT } from "@/lib/mock-data";

export function ProficiencyCard() {
  return (
    <Card className="relative overflow-hidden border border-border/80 bg-card p-6 shadow-md flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Performance</span>
          <h3 className="text-lg font-bold text-foreground mt-0.5">Proficiency Score</h3>
        </div>
        <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-mono text-xs">
          Adaptive Assessment
        </Badge>
      </div>

      {/* Main Score & Radial Gauge Indicator */}
      <div className="my-6 flex items-center gap-6">
        {/* Radial gauge element */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/10 border-4 border-indigo-500/30">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-foreground tracking-tight">{MOCK_STUDENT.overallProficiency}%</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Estimated Ability:</span>
            <span className="font-bold text-indigo-400">{MOCK_STUDENT.estimatedAbilityLevel}</span>
          </div>
          <Progress value={MOCK_STUDENT.overallProficiency} className="h-2.5 bg-muted" />
          <p className="text-[11px] text-muted-foreground">
            Estimated proficiency score derived from adaptive drill history across core CS topics.
          </p>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-3 gap-3 border-t border-border/60 pt-4 text-center">
        <div className="rounded-lg bg-muted/40 p-2.5">
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] uppercase mb-1">
            <Award className="h-3 w-3 text-indigo-400" />
            <span>Tests</span>
          </div>
          <span className="text-base font-bold text-foreground">{MOCK_STUDENT.assessmentsCompleted}</span>
        </div>

        <div className="rounded-lg bg-muted/40 p-2.5">
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] uppercase mb-1">
            <HelpCircle className="h-3 w-3 text-emerald-400" />
            <span>Answered</span>
          </div>
          <span className="text-base font-bold text-foreground">{MOCK_STUDENT.totalQuestionsAnswered}</span>
        </div>

        <div className="rounded-lg bg-muted/40 p-2.5">
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] uppercase mb-1">
            <Clock className="h-3 w-3 text-amber-400" />
            <span>Avg Time</span>
          </div>
          <span className="text-base font-bold text-foreground">{MOCK_STUDENT.avgResponseTimeSec}s</span>
        </div>
      </div>
    </Card>
  );
}
