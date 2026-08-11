import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Sparkles, CheckCircle2, XCircle, Edit3, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminPlaceholderPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
              Administrator Control Center
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            AI Question Review Queue & Bank Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review Gemini AI-generated MCQs before approving them into the primary CAT assessment pool.
          </p>
        </div>

        {/* Mock Queue Items Preview */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-5 border border-amber-500/30 bg-card shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                  AI GENERATED • PENDING REVIEW
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">ID: q-gen-1042</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span>Topic: <strong>DBMS</strong></span>
                <span>•</span>
                <span>Difficulty: <strong>Level 3 (Medium)</strong></span>
              </div>
            </div>

            <p className="text-sm font-medium text-foreground mb-4">
              Which normal form specifically addresses transitive functional dependencies of non-prime attributes on candidate keys?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4">
              <div className="p-2 rounded border border-border/60 bg-muted/30">A) First Normal Form (1NF)</div>
              <div className="p-2 rounded border border-border/60 bg-muted/30">B) Second Normal Form (2NF)</div>
              <div className="p-2 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-medium">
                C) Third Normal Form (3NF) ✓ (Correct)
              </div>
              <div className="p-2 rounded border border-border/60 bg-muted/30">D) Boyce-Codd Normal Form (BCNF)</div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <span className="text-xs text-muted-foreground">Source: Gemini API Model 1.5 Pro</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs gap-1">
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>
                <Button size="sm" variant="destructive" className="text-xs gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Approve Question</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="pt-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard" className="flex items-center gap-2 text-xs">
              <span>Return to Student Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
