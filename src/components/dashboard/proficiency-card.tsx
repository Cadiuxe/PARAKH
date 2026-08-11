"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getStoredAssessments,
  getLatestAssessment,
  getAbilityLevelLabel,
  CompletedAssessment,
} from "@/lib/assessment-storage";

export function ProficiencyCard() {
  const [assessments, setAssessments] = useState<CompletedAssessment[]>([]);

  useEffect(() => {
    setAssessments(getStoredAssessments());
  }, []);

  const hasData = assessments.length > 0;
  const latest = getLatestAssessment();

  const totalSessions = assessments.length;
  const totalQuestions = assessments.reduce((s, a) => s + a.questionCount, 0);
  const avgProficiency = hasData
    ? Math.round(assessments.reduce((s, a) => s + a.percentageScore, 0) / assessments.length)
    : 0;

  const currentAbilityLabel = latest
    ? getAbilityLevelLabel(latest.abilityFinal)
    : "Not Assessed";

  return (
    <Card className="relative overflow-hidden border border-border/80 bg-card p-6 shadow-md flex flex-col gap-4">
      <div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Overall Performance
        </span>
        <h3 className="text-lg font-bold text-foreground mt-0.5">Proficiency</h3>
      </div>

      {/* Score gauge */}
      <div className="flex items-center gap-5">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-indigo-500/30 bg-indigo-500/8">
          <span className="text-2xl font-extrabold text-foreground">
            {hasData ? `${avgProficiency}%` : "—"}
          </span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Estimated Ability</span>
            <span className="font-semibold text-indigo-400">
              {hasData ? `${currentAbilityLabel} (${latest?.abilityFinal})` : "Not Assessed"}
            </span>
          </div>
          <Progress value={avgProficiency} className="h-2 bg-muted" />
          <p className="text-[11px] text-muted-foreground">
            {hasData
              ? `Derived from ${totalSessions} completed session${totalSessions > 1 ? "s" : ""}.`
              : "Complete your first assessment to calculate your proficiency."}
          </p>
        </div>
      </div>

      {/* Compact stats */}
      <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-center text-xs">
        <div className="rounded-lg bg-muted/40 p-2.5">
          <p className="text-muted-foreground mb-0.5">Sessions</p>
          <p className="text-base font-bold text-foreground">{totalSessions}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2.5">
          <p className="text-muted-foreground mb-0.5">Questions</p>
          <p className="text-base font-bold text-foreground">{totalQuestions}</p>
        </div>
      </div>
    </Card>
  );
}
