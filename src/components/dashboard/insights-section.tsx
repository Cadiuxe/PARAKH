"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Sparkles, Lightbulb, ArrowRight } from "lucide-react";
import { MOCK_STRENGTHS, MOCK_AREAS_TO_IMPROVE } from "@/lib/mock-data";

export function InsightsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Strengths Card */}
      <Card className="lg:col-span-6 p-6 border border-border/80 bg-card shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Demonstrated Strengths</h3>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
              Top Skills
            </Badge>
          </div>

          <div className="space-y-3">
            {MOCK_STRENGTHS.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-400 block mb-0.5">{item.topic}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Areas to Improve Card */}
      <Card className="lg:col-span-6 p-6 border border-border/80 bg-card shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Areas to Improve</h3>
            </div>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
              Focus Topics
            </Badge>
          </div>

          <div className="space-y-3">
            {MOCK_AREAS_TO_IMPROVE.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-amber-500/[0.04] border border-amber-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 block mb-0.5">{item.topic}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">{item.detail}</p>
                <div className="text-[11px] text-amber-300/80 font-medium flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 shrink-0 text-amber-400" />
                  <span>Action: {item.recommendedAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* AI Recommendation Banner */}
      <div className="lg:col-span-12 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-indigo-900/20 to-background p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>AI Assessment Synthesis & Recommendation</span>
              <Badge variant="outline" className="text-[9px] bg-indigo-500/10 border-indigo-500/30 text-indigo-300">
                Gemini AI Preview
              </Badge>
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-3xl">
              &ldquo;Based on your last 3 test sessions, your DSA foundation is strong at Level 4 difficulty. We recommend taking a 10-question targeted drill on DBMS Functional Dependencies and BCNF normalization before your next overall adaptive evaluation.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
