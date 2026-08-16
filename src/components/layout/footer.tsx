"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MulyanLogo } from "@/components/ui/mulyan-logo";

export function Footer() {
  const { profile } = useAuth();

  return (
    <footer className="border-t border-border/40 bg-background/60 py-12 text-sm text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <MulyanLogo size="sm" taglineText="POWERED BY PARAKH" />
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
          {profile?.role === "admin" && (
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Admin Review Queue
            </Link>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} MULYAN. Powered by PARAKH Computer Adaptive Testing Engine.
        </p>
      </div>
    </footer>
  );
}
