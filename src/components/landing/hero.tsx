"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, ShieldCheck, Zap, BarChart3, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { AdaptivePreview } from "./adaptive-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Top Pill / Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="outline" className="px-3.5 py-1.5 border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs sm:text-sm font-medium rounded-full mb-6 gap-2 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Next-Gen Computer Adaptive Testing (CAT)</span>
              <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
            </Badge>
          </motion.div>

          {/* Hero Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]"
          >
            Assess Smarter. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-indigo-500 bg-clip-text text-transparent">
              Learn Deeper.
            </span>
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed"
          >
            PARAKH delivers AI-powered computer adaptive assessments that dynamically calibrate question difficulty, topic selection, and response timing to match each student&apos;s true proficiency.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Button size="lg" asChild className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 text-base shadow-xl shadow-indigo-600/25 rounded-xl font-semibold">
              <Link href="/assessment" className="flex items-center justify-center gap-2">
                <span>Start Assessment</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto px-8 py-6 text-base rounded-xl font-medium border-border/80 hover:bg-accent/50">
              <Link href="#features">
                Explore Platform
              </Link>
            </Button>
          </motion.div>

          {/* Micro trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              <span>Real-Time Ability Trajectory</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
              <span>SIH Computer Adaptive Engine</span>
            </div>
          </motion.div>
        </div>

        {/* Interactive Adaptive Assessment UI Preview Section */}
        <motion.div
          id="preview"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 max-w-5xl mx-auto"
        >
          <AdaptivePreview />
        </motion.div>
      </div>
    </section>
  );
}
