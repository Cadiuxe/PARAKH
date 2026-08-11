import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Cpu, Play, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AssessmentPlaceholderPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 text-center py-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-2">
          <Cpu className="h-8 w-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Adaptive CAT Engine Interface
        </h1>

        <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
          This route will host the live adaptive evaluation interface featuring real-time question selection, difficulty calibration (Levels 1–5), timers, and immediate answer explanations.
        </p>

        <Card className="p-8 border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-card shadow-xl max-w-2xl mx-auto space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Adaptive Engine Specifications</span>
            <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 text-xs">
              Phase 3 / Phase 4 Integration
            </Badge>
          </div>

          <ul className="space-y-3 text-xs text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1"></span>
              <span><strong>Isolated CAT Algorithm:</strong> Heuristic function <code className="text-indigo-300 font-mono">selectNextQuestion(studentState, pool)</code> ready for future IRT upgrades.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1"></span>
              <span><strong>Exposure Control:</strong> Tracks <code className="text-indigo-300 font-mono">times_used</code> to avoid repeating questions to students.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1"></span>
              <span><strong>Gemini Backup:</strong> Triggers structured MCQ generation when approved question pool lacks coverage.</span>
            </li>
          </ul>

          <div className="pt-4 flex items-center justify-between">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span>Return to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
