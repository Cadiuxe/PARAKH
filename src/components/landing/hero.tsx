"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, BarChart3 } from "lucide-react";
import { motion, useReducedMotion, useSpring } from "motion/react";
import { AdaptivePreview } from "./adaptive-preview";
import { DotGridBackground } from "./dot-grid-background";
import { MulyanWordmark } from "@/components/ui/mulyan-wordmark";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const headlineRef = useRef<HTMLDivElement>(null);

  // Spring-smoothed rotation values
  const rotateY = useSpring(0, { stiffness: 180, damping: 22, mass: 0.5 });
  const rotateX = useSpring(0, { stiffness: 180, damping: 22, mass: 0.5 });

  const handleHeadlineMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || !headlineRef.current) return;
      const rect = headlineRef.current.getBoundingClientRect();
      // Normalized -0.5 to +0.5
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      // Very small amplitude — feels like physical depth, not dramatic tilt
      rotateY.set(nx * 6);
      rotateX.set(-ny * 3);
    },
    [shouldReduceMotion, rotateX, rotateY]
  );

  const handleHeadlineMouseLeave = useCallback(() => {
    rotateY.set(0);
    rotateX.set(0);
  }, [rotateX, rotateY]);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24"
    >
      {/* Interactive Dot-Grid Hero Background */}
      <DotGridBackground />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Hero Main Headline — MULYAN Dot-Matrix Vector Wordmark with subtle 3D depth tilt */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="w-full flex justify-center py-1"
          >
            {/* Perspective wrapper — parent for correct 3D depth */}
            <div className="[perspective:900px] w-full flex justify-center">
              <motion.div
                ref={headlineRef}
                onMouseMove={handleHeadlineMouseMove}
                onMouseLeave={handleHeadlineMouseLeave}
                style={shouldReduceMotion ? {} : { rotateY, rotateX }}
                className="cursor-default select-text flex justify-center items-center w-full"
              >
                <MulyanWordmark className="w-full max-w-[min(92vw,910px)] md:max-w-[min(90vw,1030px)] lg:max-w-[1100px] h-auto" />
              </motion.div>
            </div>
          </motion.div>

          {/* Supporting Copy — exactly one typography step smaller, constrained to 38rem */}
          <motion.p
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.16 }}
            className="mt-5 text-sm sm:text-base md:text-lg text-zinc-400 max-w-[38rem] mx-auto font-normal leading-[1.6]"
          >
            MULYAN delivers AI-powered computer adaptive assessments that dynamically calibrate question difficulty, topic selection, and response timing to match each student&apos;s true proficiency.
          </motion.p>

          {/* CTAs — Twin components sharing same pill, border, physics, and glass language */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.24 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            {/* Primary CTA — Stronger fill/contrast (lg size) */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                asChild
                className="group relative w-full sm:w-auto overflow-hidden rounded-full border border-blue-500/50 bg-zinc-950/60 px-8 py-6 text-base font-semibold text-zinc-100 backdrop-blur-md transition-all duration-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-lg hover:shadow-blue-950/50"
              >
                <Link href="/assessment" className="flex items-center justify-center gap-2">
                  <span>Start Assessment</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>

            {/* Secondary CTA — Quieter resting state, same family, active hover (lg size) */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleScrollTo("features")}
                className="group relative w-full sm:w-auto overflow-hidden rounded-full border border-zinc-700/60 bg-zinc-950/60 px-8 py-6 text-base font-semibold text-zinc-300 backdrop-blur-md transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-800/80 hover:text-zinc-100 shadow-sm hover:shadow-lg hover:shadow-black/50 cursor-pointer"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>Explore Platform</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1 text-zinc-400 group-hover:text-zinc-200" />
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Micro feature / trust strip — 16px icons, consistent baseline, 32px gap */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.32 }}
            className="mt-8 flex items-center justify-center gap-8 text-xs font-medium text-zinc-400"
          >
            <div className="flex items-center gap-2 transition-colors hover:text-zinc-200">
              <Zap className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Real-Time Ability Trajectory</span>
            </div>
            <div className="flex items-center gap-2 transition-colors hover:text-zinc-200">
              <BarChart3 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Powered by PARAKH Engine</span>
            </div>
          </motion.div>
        </div>

        {/* Interactive Adaptive Assessment UI Preview Section */}
        <motion.div
          id="preview"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-12 md:mt-16 max-w-5xl mx-auto"
        >
          <AdaptivePreview />
        </motion.div>
      </div>
    </section>
  );
}
