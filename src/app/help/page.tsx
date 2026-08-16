import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, BookOpen, Cpu, ShieldCheck, Sparkles, HelpCircle } from "lucide-react";

export default function HelpPage() {
  const faqItems = [
    {
      q: "What is Computer Adaptive Testing (CAT)?",
      a: "Computer Adaptive Testing dynamically adjusts question difficulty based on student responses. Correct answers lead to higher-difficulty items, while incorrect answers recalibrate to lower difficulty to accurately estimate student proficiency in fewer questions.",
    },
    {
      q: "How are topic weaknesses prioritized?",
      a: "The adaptive engine tracks accuracy per subject (e.g. DBMS vs DSA). Weak topics receive higher probability of selection in subsequent assessment sessions to accelerate targeted learning.",
    },
    {
      q: "What role does AI play in PARAKH?",
      a: "Generative AI is used to expand the question bank with structured MCQs when specific subtopic coverage is low. All AI-generated items enter an Admin Review Queue for human oversight before being added to live assessments.",
    },
    {
      q: "How is question exposure controlled?",
      a: "Every item tracks exposure frequency. When multiple suitable questions fit a target difficulty level, the engine prioritizes items with lower exposure to ensure balanced bank usage.",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs">
              Documentation & Support
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            MULYAN Platform Architecture & Help
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Understanding MULYAN adaptive assessment logic, ability scoring, and PARAKH engine workflows.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 border border-border/80 bg-card space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Adaptive Difficulty</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Questions adjust from Level 1 to Level 5 based on live ability score estimates.
            </p>
          </Card>

          <Card className="p-5 border border-border/80 bg-card space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Human Review</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI-generated questions require administrator approval before release.
            </p>
          </Card>

          <Card className="p-5 border border-border/80 bg-card space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Exposure Control</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Repeated question exposure is minimized across student sessions.
            </p>
          </Card>
        </div>

        {/* FAQs */}
        <Card className="p-6 border border-border/80 bg-card shadow-md space-y-4">
          <h3 className="text-base font-bold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-indigo-400" />
            <span>Frequently Asked Questions</span>
          </h3>

          <div className="space-y-4 pt-2">
            {faqItems.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <h4 className="font-semibold text-foreground">{item.q}</h4>
                <p className="text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
