"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, FileText } from "lucide-react";
import {
  getStoredAssessments,
  CompletedAssessment,
} from "@/lib/assessment-storage";
import Link from "next/link";

export function RecentAssessments() {
  const [assessments, setAssessments] = useState<CompletedAssessment[]>([]);

  useEffect(() => {
    setAssessments(getStoredAssessments());
  }, []);

  const hasData = assessments.length > 0;

  return (
    <Card className="p-6 border border-border/80 bg-card shadow-md flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assessment History</span>
          <h3 className="text-lg font-bold text-foreground">Recent Adaptive Sessions</h3>
        </div>
        {hasData && (
          <Button variant="ghost" size="sm" asChild className="text-xs text-indigo-400 hover:text-indigo-300">
            <Link href="/results" className="flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>

      {/* Content */}
      {!hasData ? (
        <div className="py-8 text-center space-y-3 rounded-xl border border-dashed border-border/60 bg-muted/10 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/40 text-muted-foreground mx-auto">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">No Completed Assessments</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your completed adaptive sessions will appear here with detailed score and ability tracking.
            </p>
          </div>
          <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
            <Link href="/assessment">Start Assessment</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href={`/results?id=${item.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors block"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5 sm:mt-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{item.topic} Assessment</h4>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/60 text-muted-foreground">
                      {item.topic}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{item.formattedDate}</span>
                    <span>•</span>
                    <span>{item.questionCount} Questions</span>
                  </div>
                </div>
              </div>

              {/* Score & Status */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                <div className="text-left sm:text-right">
                  <span className="text-sm font-extrabold text-foreground">{item.percentageScore}%</span>
                  <span className="block text-[10px] text-muted-foreground">Ability Est: {item.abilityFinal}</span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] gap-1 py-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Completed</span>
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
