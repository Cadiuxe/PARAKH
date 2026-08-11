"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Sparkles, Target, Zap } from "lucide-react";
import { MOCK_STUDENT } from "@/lib/mock-data";

export function WelcomeSection() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-background to-background p-6 sm:p-8 shadow-xl">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-2.5 py-0.5 font-medium">
              Student Overview
            </Badge>
            <span className="text-xs text-muted-foreground">• Roll No: {MOCK_STUDENT.rollNumber}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {MOCK_STUDENT.name}
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Your current estimated ability is rated at <span className="text-indigo-400 font-semibold">{MOCK_STUDENT.estimatedAbilityLevel}</span> with an overall proficiency of <span className="text-emerald-400 font-bold">{MOCK_STUDENT.overallProficiency}%</span>. The adaptive CAT engine has identified DBMS as your primary focus area.
          </p>
        </div>

        {/* Start Assessment CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button size="lg" asChild className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 px-6 py-5 rounded-xl">
            <Link href="/assessment" className="flex items-center justify-center gap-2">
              <Play className="h-4 w-4 fill-current" />
              <span>Start Assessment</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
