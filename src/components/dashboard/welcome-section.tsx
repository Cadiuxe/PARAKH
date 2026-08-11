"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { MOCK_STUDENT } from "@/lib/mock-data";
import {
  getStoredAssessments,
  getLatestAssessment,
  getAbilityLevelLabel,
  CompletedAssessment,
} from "@/lib/assessment-storage";

export function WelcomeSection() {
  const [assessments, setAssessments] = useState<CompletedAssessment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setAssessments(getStoredAssessments());
    setIsLoaded(true);
  }, []);

  const hasData = assessments.length > 0;
  const latest = getLatestAssessment();

  const avgProficiency = hasData
    ? Math.round(assessments.reduce((s, a) => s + a.percentageScore, 0) / assessments.length)
    : 0;

  const currentAbilityLabel = latest
    ? getAbilityLevelLabel(latest.abilityFinal)
    : "Not Assessed";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/50 via-background to-background p-6 sm:p-8 shadow-lg">
      <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-indigo-600/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <Badge
            variant="outline"
            className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-2.5 py-0.5"
          >
            {hasData ? `${assessments.length} Session${assessments.length > 1 ? "s" : ""} Recorded` : "Ready to Start"}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome, {MOCK_STUDENT.name}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {hasData ? (
              <>
                Your current ability is{" "}
                <span className="text-indigo-400 font-semibold">
                  {currentAbilityLabel} ({latest?.abilityFinal} pts)
                </span>{" "}
                with an average proficiency of{" "}
                <span className="text-emerald-400 font-bold">
                  {avgProficiency}%
                </span>
                . {latest?.topic} was your most recent session.
              </>
            ) : (
              "Complete your first adaptive assessment to establish your initial ability profile and start tracking your topic proficiency."
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            size="lg"
            asChild
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 px-6 rounded-xl gap-2"
          >
            <Link href="/assessment">
              <Play className="h-4 w-4 fill-current" />
              Start Assessment
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
