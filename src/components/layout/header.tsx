"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

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
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-foreground">PARAKH</span>
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-[10px] px-1.5 py-0">
                PROTOTYPE
              </Badge>
            </div>
            <span className="text-[10px] text-muted-foreground -mt-1 tracking-wider uppercase">Adaptive CAT Engine</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="transition-colors hover:text-foreground">
            Platform Capabilities
          </Link>
          <Link href="#adaptive-engine" className="transition-colors hover:text-foreground flex items-center gap-1">
            <span>Adaptive Logic</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
          </Link>
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
