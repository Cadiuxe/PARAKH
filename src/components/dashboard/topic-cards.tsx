"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, BookOpen } from "lucide-react";
import { MOCK_TOPICS, TopicPerformance } from "@/lib/mock-data";

export function TopicCards() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject Breakdown</span>
          <h3 className="text-lg font-bold text-foreground">Topic Mastery & Weaknesses</h3>
        </div>
        <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
          4 Subjects Tracked
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_TOPICS.map((topic: TopicPerformance) => {
          const isWeak = topic.proficiency < 65;
          const isStrong = topic.proficiency >= 80;

          return (
            <Card
              key={topic.id}
              className={`relative p-5 border transition-all duration-200 hover:border-indigo-500/40 ${
                isWeak
                  ? "bg-amber-500/[0.02] border-amber-500/30"
                  : "bg-card border-border/80"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: topic.color }}
                  >
                    {topic.code}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-foreground leading-tight">{topic.name}</h4>
                    <span className="text-[11px] text-muted-foreground">{topic.totalQuestions} questions completed</span>
                  </div>
                </div>
              </div>

              {/* Score Number */}
              <div className="my-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-foreground tracking-tight">{topic.proficiency}%</span>
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
                  {isStrong ? "Strong" : isWeak ? "Needs Focus" : "Proficient"}
                </Badge>
              </div>

              {/* Progress Bar */}
              <Progress
                value={topic.proficiency}
                className="h-2 bg-muted"
              />

              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                <span>Accuracy: <strong className="text-foreground">{topic.accuracy}%</strong></span>
                <div className="flex items-center gap-1 font-medium">
                  {topic.trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                  {topic.trend === "down" && <TrendingDown className="h-3 w-3 text-amber-400" />}
                  {topic.trend === "neutral" && <Minus className="h-3 w-3 text-muted-foreground" />}
                  <span className={topic.trend === "up" ? "text-emerald-400" : topic.trend === "down" ? "text-amber-400" : ""}>
                    {topic.trend === "up" ? "+4%" : topic.trend === "down" ? "-2%" : "Stable"}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
