"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MOCK_TOPICS, TopicPerformance } from "@/lib/mock-data";

export function TopicCards() {
  return (
    <Card className="p-6 border border-border/80 bg-card shadow-md">
      <div className="mb-5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Subject Breakdown
        </span>
        <h3 className="text-lg font-bold text-foreground mt-0.5">
          Topic Proficiency
        </h3>
      </div>

      <div className="space-y-4">
        {MOCK_TOPICS.map((topic: TopicPerformance) => {
          const isWeak = topic.proficiency < 65;
          const isStrong = topic.proficiency >= 80;

          return (
            <div key={topic.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: topic.color }}
                  >
                    {topic.code[0]}
                  </span>
                  <span className="font-medium text-foreground">{topic.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-muted-foreground">
                    {topic.trend === "up" && (
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    )}
                    {topic.trend === "down" && (
                      <TrendingDown className="h-3 w-3 text-amber-400" />
                    )}
                    {topic.trend === "neutral" && (
                      <Minus className="h-3 w-3 text-muted-foreground" />
                    )}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 font-medium ${
                      isStrong
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : isWeak
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                    }`}
                  >
                    {topic.proficiency}%
                  </Badge>
                </div>
              </div>
              <Progress
                value={topic.proficiency}
                className="h-1.5 bg-muted"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
