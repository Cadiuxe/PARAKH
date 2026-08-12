"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function CTASection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 sm:p-12 lg:p-16 text-center overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-indigo-400 border border-zinc-700/60 mb-6 shadow-md">
                <BrainCircuit className="h-6 w-6" />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight">
                Ready to Experience Truly Adaptive Testing?
              </h2>

              <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-xl font-normal leading-relaxed">
                Explore the PARAKH student dashboard, test the visual adaptive engine trajectory, and inspect real-time proficiency breakdown.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    asChild
                    className="group w-full sm:w-auto bg-indigo-600/90 hover:bg-indigo-500 text-white border border-indigo-400/30 px-8 py-6 text-base shadow-lg shadow-indigo-950/50 rounded-xl font-semibold backdrop-blur-md transition-all"
                  >
                    <Link href="/dashboard" className="flex items-center justify-center gap-2">
                      <span>Launch Student Dashboard</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>

                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full sm:w-auto px-8 py-6 text-base rounded-xl font-medium bg-zinc-800/40 hover:bg-zinc-800/70 text-zinc-300 border-zinc-700/50 backdrop-blur-md transition-colors"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
