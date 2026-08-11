import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/60 py-12 text-sm text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-white">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <span className="font-bold text-foreground tracking-tight">PARAKH Platform</span>
          <span className="text-xs text-muted-foreground">• SIH Prototype</span>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Student Dashboard
          </Link>
          <Link href="/assessment" className="hover:text-foreground transition-colors">
            Adaptive Assessment
          </Link>
          <Link href="/results" className="hover:text-foreground transition-colors">
            Analytics & Results
          </Link>
          <Link href="/admin" className="hover:text-foreground transition-colors">
            Admin Review Queue
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} PARAKH. Computer Adaptive Testing Engine.
        </p>
      </div>
    </footer>
  );
}
