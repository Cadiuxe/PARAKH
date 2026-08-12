"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit, ArrowRight } from "lucide-react";
import { AdaptiveLogicDialog } from "@/components/landing/adaptive-logic-dialog";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-foreground">PARAKH</span>
            <span className="text-[10px] text-muted-foreground -mt-1 tracking-wider uppercase">Adaptive CAT Engine</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="transition-colors hover:text-foreground">
            Platform Capabilities
          </Link>
          
          {/* Functional Adaptive Logic Dialog trigger without blue dot */}
          <AdaptiveLogicDialog
            trigger={
              <button type="button" className="transition-colors hover:text-foreground cursor-pointer font-medium text-muted-foreground">
                Adaptive Logic
              </button>
            }
          />

          <Link href="#preview" className="transition-colors hover:text-foreground">
            Live Preview
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-foreground">
            Student Dashboard
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
            <Link href="/login">Sign In</Link>
          </Button>
          
          <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25">
            <Link href="/dashboard" className="flex items-center gap-1.5">
              <span>Start Assessment</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
