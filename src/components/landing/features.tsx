"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, LineChart, ShieldCheck, Target, Layers, ArrowUpRight } from "lucide-react";

export function Features() {
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
      color: "from-indigo-500/20 to-indigo-500/5",
      iconColor: "text-indigo-400",
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
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
      color: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-400",
      badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
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
      color: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-400",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    },
  ];

  return (
    <section id="features" className="py-20 border-t border-border/40 bg-muted/20 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="px-3 py-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Built for SIH Excellence
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Engineered for Precision & Learning Impact
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Card className="relative h-full flex flex-col justify-between border-border/80 bg-card p-6 sm:p-7 hover:border-indigo-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-indigo-500/5">
                  <div>
                    {/* Icon & Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} border border-border/60`}>
                        <Icon className={`h-6 w-6 ${item.iconColor}`} />
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-mono tracking-wider ${item.badgeColor}`}>
                        {item.tag}
                      </Badge>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                      <span>{item.title}</span>
                      <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      {item.description}
                    </p>
                  </div>

                  {/* Bullet Points */}
                  <div className="pt-4 border-t border-border/50 space-y-2 text-xs font-medium text-muted-foreground">
                    {item.points.map((pt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500/80"></div>
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
