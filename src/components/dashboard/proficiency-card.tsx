"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboard } from "@/lib/dashboard-context";

export function ProficiencyCard() {
  const { data } = useDashboard();

  const hasData = Boolean(data?.hasData);
  const totalSessions = data?.totalSessions || 0;
  const totalQuestions = data?.totalQuestions || 0;
  const avgProficiency = data?.avgProficiency || 0;
  const currentAbilityLabel = data?.currentAbilityLabel || "Not Assessed";
  const currentAbility = data?.currentAbility || 50;

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
              {hasData ? `${currentAbilityLabel} (${currentAbility})` : "Not Assessed"}
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
