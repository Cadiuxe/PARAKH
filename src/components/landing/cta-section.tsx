"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-background p-8 sm:p-12 lg:p-16 text-center overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Subtle Glow Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-6">
              <BrainCircuit className="h-6 w-6" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              Ready to Experience Truly Adaptive Testing?
            </h2>

            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl">
              Explore the PARAKH student dashboard, test the visual adaptive engine trajectory, and inspect real-time proficiency breakdown.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button size="lg" asChild className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 text-base shadow-xl shadow-indigo-600/30 rounded-xl font-semibold">
                <Link href="/dashboard" className="flex items-center justify-center gap-2">
                  <span>Launch Student Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto px-8 py-6 text-base rounded-xl font-medium border-border/80 hover:bg-accent/50">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
