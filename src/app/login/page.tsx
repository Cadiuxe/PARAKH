import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, ArrowLeft, Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-foreground relative">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-2">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">PARAKH Authentication</h1>
          <p className="text-xs text-muted-foreground">
            Sign in to access your computer adaptive testing portal.
          </p>
        </div>

        <Card className="p-6 border border-border/80 bg-card shadow-xl space-y-4">
          <Badge variant="outline" className="w-full justify-center py-1 bg-indigo-500/10 border-indigo-500/30 text-indigo-400 text-xs">
            Supabase Auth • Phase 1 Preview Mode
          </Badge>

          <div className="rounded-lg bg-muted/40 p-4 text-center space-y-2 text-xs text-muted-foreground border border-border/60">
            <Lock className="h-5 w-5 mx-auto text-indigo-400" />
            <p className="font-semibold text-foreground">Authentication Ready for Supabase Integration</p>
            <p>Full auth flows (Email, Google OAuth, Student Roles) will be connected in Phase 2.</p>
          </div>

          <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
            <Link href="/dashboard">Continue to Demo Student Dashboard</Link>
          </Button>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Landing Page</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
