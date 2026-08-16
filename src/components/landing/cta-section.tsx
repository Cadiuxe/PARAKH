"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { MulyanLogoIcon } from "@/components/ui/mulyan-logo";

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
              <div className="mb-6 shadow-md">
                <MulyanLogoIcon size={44} className="h-11 w-11" />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight">
                Ready to Experience Truly Adaptive Testing?
              </h2>

              <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-xl font-normal leading-relaxed">
                Explore the MULYAN student dashboard, test the visual adaptive engine trajectory, and inspect real-time proficiency breakdown powered by the PARAKH CAT engine.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
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
                    <Link href="/dashboard" className="flex items-center justify-center gap-2">
                      <span>Launch Student Dashboard</span>
                      <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="group relative w-full sm:w-auto overflow-hidden rounded-full border border-zinc-700/60 bg-zinc-950/60 px-8 py-6 text-base font-semibold text-zinc-300 backdrop-blur-md transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-800/80 hover:text-zinc-100 shadow-sm hover:shadow-lg hover:shadow-black/50"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
