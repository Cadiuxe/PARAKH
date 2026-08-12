"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap, BarChart3, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { AdaptivePreview } from "./adaptive-preview";
import { DotGridBackground } from "./dot-grid-background";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setCursorPos({ x, y });
  }, [shouldReduceMotion]);

  const handleMouseLeave = useCallback(() => {
    setCursorPos({ x: 0, y: 0 });
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden pt-8 pb-20 md:pt-14 md:pb-28"
    >
      {/* Interactive Dot-Grid Hero Background */}
      <DotGridBackground />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Top Pill / Badge */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Badge
              variant="outline"
              onClick={() => handleScrollTo("preview")}
              className="px-3.5 py-1.5 border-zinc-800 bg-zinc-900/60 text-zinc-300 text-xs sm:text-sm font-medium rounded-full mb-6 gap-2 backdrop-blur-md hover:border-zinc-700 hover:bg-zinc-800/60 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Next-Gen Computer Adaptive Testing (CAT)</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            </Badge>
          </motion.div>

          {/* Hero Main Headline with Interactive Depth */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="space-y-1"
          >
            <motion.h1
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      x: cursorPos.x * 8,
                      y: cursorPos.y * 5,
                    }
              }
              transition={{ type: "spring", stiffness: 150, damping: 20, mass: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-100 leading-[1.12]"
            >
              Assess Smarter.
            </motion.h1>

            <motion.h1
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      x: cursorPos.x * -6,
                      y: cursorPos.y * -4,
                    }
              }
              transition={{ type: "spring", stiffness: 150, damping: 20, mass: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12]"
            >
              <span className="bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Learn Deeper.
              </span>
            </motion.h1>
          </motion.div>

          {/* Supporting Copy */}
          <motion.p
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.16 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl font-normal leading-relaxed"
          >
            PARAKH delivers AI-powered computer adaptive assessments that dynamically calibrate question difficulty, topic selection, and response timing to match each student&apos;s true proficiency.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.24 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            {/* Primary CTA */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                asChild
                className="group w-full sm:w-auto bg-indigo-600/90 hover:bg-indigo-500 text-white border border-indigo-400/30 px-8 py-6 text-base shadow-lg shadow-indigo-950/50 backdrop-blur-md rounded-xl font-semibold transition-all"
              >
                <Link href="/assessment" className="flex items-center justify-center gap-2">
                  <span>Start Assessment</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>

            {/* Secondary CTA */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleScrollTo("features")}
              className="w-full sm:w-auto px-8 py-6 text-base rounded-xl font-medium bg-zinc-900/50 hover:bg-zinc-800/70 text-zinc-300 border-zinc-800 backdrop-blur-md transition-colors cursor-pointer"
            >
              Explore Platform
            </Button>
          </motion.div>

          {/* Micro trust indicators */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.32 }}
            className="mt-8 flex items-center justify-center gap-6 text-xs text-zinc-400"
          >
            <div className="flex items-center gap-1.5 transition-colors hover:text-zinc-200">
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              <span>Real-Time Ability Trajectory</span>
            </div>
            <div className="flex items-center gap-1.5 transition-colors hover:text-zinc-200">
              <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
              <span>SIH Computer Adaptive Engine</span>
            </div>
          </motion.div>
        </div>

        {/* Interactive Adaptive Assessment UI Preview Section */}
        <motion.div
          id="preview"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-14 max-w-5xl mx-auto"
        >
          <AdaptivePreview />
        </motion.div>
      </div>
    </section>
  );
}
