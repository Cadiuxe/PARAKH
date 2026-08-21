"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";

export function InsightsSection() {
  const { data } = useDashboard();

  const hasData = Boolean(data?.hasData);
  const strengths = data?.strengths || [];
  const areasToImprove = data?.areasToImprove || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Strengths */}
      <Card className="p-6 border border-border/80 bg-card shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Strengths</h3>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
              {strengths.length} Identified
            </Badge>
          </div>

          {!hasData ? (
            <div className="py-6 text-center space-y-1">
              <p className="text-xs font-semibold text-foreground">No Strength Data Yet</p>
              <p className="text-xs text-muted-foreground">
                Complete an assessment to identify your top performing subject areas.
              </p>
            </div>
          ) : strengths.length === 0 ? (
            <div className="py-6 text-center space-y-1">
              <p className="text-xs text-muted-foreground">
                Continue completing assessments to establish high-accuracy topic strengths.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {strengths.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-400 block mb-0.5">{item.topic}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Areas to Improve */}
      <Card className="p-6 border border-border/80 bg-card shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Areas to Improve</h3>
            </div>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
              {areasToImprove.length} Focus Areas
            </Badge>
          </div>

          {!hasData ? (
            <div className="py-6 text-center space-y-1">
              <p className="text-xs font-semibold text-foreground">No Diagnostic Data Yet</p>
              <p className="text-xs text-muted-foreground">
                Diagnostic focus areas will appear here after enough assessment data is recorded.
              </p>
            </div>
          ) : areasToImprove.length === 0 ? (
            <div className="py-6 text-center space-y-1">
              <p className="text-xs text-emerald-400 font-semibold">Great Job!</p>
              <p className="text-xs text-muted-foreground">
                All assessed topics meet proficiency thresholds (&gt;= 65% accuracy).
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {areasToImprove.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-amber-500/[0.04] border border-amber-500/20">
                  <span className="text-xs font-bold text-amber-400 block mb-0.5">{item.topic}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">{item.detail}</p>
                  {item.recommendedAction && (
                    <div className="text-[11px] text-amber-300/80 font-medium flex items-center gap-1">
                      <Lightbulb className="h-3 w-3 shrink-0 text-amber-400" />
                      <span>{item.recommendedAction}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
