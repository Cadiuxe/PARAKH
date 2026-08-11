import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Sparkles, ArrowRight, Award } from "lucide-react";
import Link from "next/link";

export default function ResultsPlaceholderPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 text-center py-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-2">
          <LineChart className="h-8 w-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Comprehensive Results & Diagnostic Analytics
        </h1>

        <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
          Detailed post-assessment diagnostic reports including ability progression graphs, topic mastery radar, response time distribution, and Gemini AI performance explanations.
        </p>

        <Card className="p-8 border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-card shadow-xl max-w-2xl mx-auto space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Results System Scope</span>
            <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 text-xs">
              Phase 4 / Phase 6 Integration
            </Badge>
          </div>

          <ul className="space-y-3 text-xs text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1"></span>
              <span><strong>Trajectory Visualizer:</strong> Recharts line charts plotting item difficulty vs. estimated student ability.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1"></span>
              <span><strong>AI Performance Analysis:</strong> Gemini-generated synthesis highlighting strengths, misconceptions, and custom study plans.</span>
            </li>
          </ul>

          <div className="pt-4">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span>View Student Dashboard Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
