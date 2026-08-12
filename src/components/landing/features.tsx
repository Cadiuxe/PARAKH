"use client";

import { motion, useReducedMotion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, LineChart, ArrowUpRight } from "lucide-react";

export function Features() {
  const shouldReduceMotion = useReducedMotion();

  const features = [
    {
      id: "adaptive-assessment",
      icon: Brain,
      tag: "CORE CAT ENGINE",
      title: "Adaptive Assessment",
      description:
        "Dynamically recalibrates question difficulty (Levels 1–5) and topic weighting after every response based on demonstrated proficiency, response time, and exposure history.",
      points: [
        "Item exposure minimization",
        "Weighted weak-topic selection",
        "Heuristic ability scoring (0–100)",
      ],
      color: "from-indigo-500/10 to-transparent",
      iconColor: "text-indigo-400",
      badgeColor: "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
    },
    {
      id: "ai-generation",
      icon: Sparkles,
      tag: "GENERATIVE AI",
      title: "AI Question Generation",
      description:
        "Leverages Gemini API to generate structured, high-quality MCQs on-demand when question bank coverage is sparse, paired with an Admin Review Queue for human oversight.",
      points: [
        "Structured JSON schema output",
        "Difficulty & subtopic targeting",
        "Human-in-the-loop review queue",
      ],
      color: "from-amber-500/10 to-transparent",
      iconColor: "text-amber-400",
      badgeColor: "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
    },
    {
      id: "personalized-insights",
      icon: LineChart,
      tag: "ANALYTICS & DIAGNOSTICS",
      title: "Personalized Insights",
      description:
        "Provides actionable diagnostic breakdowns of topic masteries, ability progression curves, and AI-generated conceptual recommendations to target learning gaps.",
      points: [
        "Interactive proficiency charts",
        "Granular subject accuracy",
        "Targeted study action items",
      ],
      color: "from-emerald-500/10 to-transparent",
      iconColor: "text-emerald-400",
      badgeColor: "bg-zinc-800/80 text-zinc-300 border-zinc-700/60",
    },
  ];

  return (
    <section id="features" className="py-20 border-t border-zinc-800/60 bg-zinc-950/60 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="px-3 py-1 border-zinc-800 bg-zinc-900/60 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Built for SIH Excellence
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Engineered for Precision & Learning Impact
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
            A comprehensive Computer Adaptive Testing architecture combining rule-based item selection, AI question generation, and rich diagnostic analytics.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.1 }}
              >
                <Card className="relative h-full flex flex-col justify-between border-zinc-800 bg-zinc-900/40 p-6 sm:p-7 hover:border-zinc-700 transition-all duration-300 group hover:shadow-xl backdrop-blur-md">
                  <div>
                    {/* Icon & Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} border border-zinc-800`}>
                        <Icon className={`h-6 w-6 ${item.iconColor}`} />
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-mono tracking-wider ${item.badgeColor}`}>
                        {item.tag}
                      </Badge>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-zinc-100 mb-3 group-hover:text-white transition-colors flex items-center justify-between">
                      <span>{item.title}</span>
                      <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                      {item.description}
                    </p>
                  </div>

                  {/* Bullet Points */}
                  <div className="pt-4 border-t border-zinc-800/60 space-y-2 text-xs font-medium text-zinc-400">
                    {item.points.map((pt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-600"></div>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
