"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ArrowRight, ExternalLink, FileText } from "lucide-react";
import { MOCK_RECENT_ASSESSMENTS, RecentAssessment } from "@/lib/mock-data";
import Link from "next/link";

export function RecentAssessments() {
  return (
    <Card className="p-6 border border-border/80 bg-card shadow-md flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assessment History</span>
          <h3 className="text-lg font-bold text-foreground">Recent Adaptive Sessions</h3>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs text-indigo-400 hover:text-indigo-300">
          <Link href="/results" className="flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {MOCK_RECENT_ASSESSMENTS.map((item: RecentAssessment) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5 sm:mt-0">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/60 text-muted-foreground">
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

            {/* Score & Status */}
            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
              <div className="text-left sm:text-right">
                <span className="text-sm font-extrabold text-foreground">{item.score}%</span>
                <span className="block text-[10px] text-muted-foreground">Ability Est: {item.abilityScore}</span>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] gap-1 py-0.5">
                <CheckCircle2 className="h-3 w-3" />
                <span>Completed</span>
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
