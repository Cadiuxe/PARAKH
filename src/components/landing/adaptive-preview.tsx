"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdaptiveLogicDialog } from "./adaptive-logic-dialog";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

// --- Demo question sequence showing adaptation ---
const DEMO_STEPS = [
  {
    questionNum: 1,
    difficulty: "Level 2",
    difficultyLabel: "Easy",
    difficultyColor: "text-emerald-400",
    difficultyBg: "bg-emerald-500/10 border-emerald-500/30",
    question: "Which data structure uses LIFO (Last In, First Out) ordering?",
    options: [
      { letter: "A", text: "Queue" },
      { letter: "B", text: "Stack", correct: true },
      { letter: "C", text: "Heap" },
      { letter: "D", text: "Linked List" },
    ],
    correctIndex: 1,
    outcome: "correct" as const,
    abilityBefore: 50,
    abilityAfter: 62,
    nextDifficulty: "Level 3 (Medium)",
    explanation: "Correct answer selected. Ability rises — difficulty escalates.",
  },
  {
    questionNum: 2,
    difficulty: "Level 3",
    difficultyLabel: "Medium",
    difficultyColor: "text-amber-400",
    difficultyBg: "bg-amber-500/10 border-amber-500/30",
    question: "What is the time complexity of binary search on a sorted array of n elements?",
    options: [
      { letter: "A", text: "O(n)" },
      { letter: "B", text: "O(n log n)" },
      { letter: "C", text: "O(log n)", correct: true },
      { letter: "D", text: "O(1)" },
    ],
    correctIndex: 2,
    outcome: "correct" as const,
    abilityBefore: 62,
    abilityAfter: 74,
    nextDifficulty: "Level 4 (Hard)",
    explanation: "Correct again. Ability continues to rise — engine targets harder items.",
  },
  {
    questionNum: 3,
    difficulty: "Level 4",
    difficultyLabel: "Hard",
    difficultyColor: "text-red-400",
    difficultyBg: "bg-red-500/10 border-red-500/30",
    question: "In DBMS, which isolation level prevents dirty reads but allows non-repeatable reads?",
    options: [
      { letter: "A", text: "Read Uncommitted" },
      { letter: "B", text: "Read Committed", correct: true },
      { letter: "C", text: "Repeatable Read" },
      { letter: "D", text: "Serializable" },
    ],
    correctIndex: 1,
    outcome: "incorrect" as const,
    selectedIndex: 2,
    abilityBefore: 74,
    abilityAfter: 68,
    nextDifficulty: "Level 3 (Medium)",
    explanation: "Incorrect. Ability recalibrates — engine steps back to find true level.",
  },
];

// Build a growing trajectory for the chart
const buildTrajectory = (upTo: number, stage: "before" | "answered") => {
  const points: { q: number; ability: number }[] = [{ q: 0, ability: 50 }];
  for (let i = 0; i < DEMO_STEPS.length; i++) {
    const step = DEMO_STEPS[i];
    if (i < upTo) {
      points.push({ q: i + 1, ability: step.abilityAfter });
    } else if (i === upTo && stage === "answered") {
      points.push({ q: i + 1, ability: step.abilityAfter });
    }
  }
  return points;
};

type Phase = "question" | "selecting" | "answered" | "transitioning";

export function AdaptivePreview() {
  const shouldReduceMotion = useReducedMotion();

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [trajectory, setTrajectory] = useState(buildTrajectory(0, "before"));

  const step = DEMO_STEPS[stepIndex];

  useEffect(() => {
    if (shouldReduceMotion) return; // static display for reduced motion

    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;
    let t4: ReturnType<typeof setTimeout>;

    if (phase === "question") {
      // Auto-select after 1.4s (reduced cycle timing for demo)
      t1 = setTimeout(() => setPhase("selecting"), 1400);
    } else if (phase === "selecting") {
      // Show result after 0.5s
      t2 = setTimeout(() => {
        setPhase("answered");
        setTrajectory(buildTrajectory(stepIndex, "answered"));
      }, 500);
    } else if (phase === "answered") {
      // Move to next question after 1.6s
      t3 = setTimeout(() => setPhase("transitioning"), 1600);
    } else if (phase === "transitioning") {
      t4 = setTimeout(() => {
        const next = (stepIndex + 1) % DEMO_STEPS.length;
        setStepIndex(next);
        setTrajectory(buildTrajectory(next, "before"));
        setPhase("question");
      }, 250);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [phase, stepIndex, shouldReduceMotion]);

  const selectedIndex =
    phase === "selecting" || phase === "answered"
      ? step.outcome === "correct"
        ? step.correctIndex
        : (step as any).selectedIndex ?? step.correctIndex
      : null;

  const showResult = phase === "answered";
  const isCorrect = step.outcome === "correct";

  return (
    <Card className="relative overflow-hidden border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl shadow-2xl p-5 sm:p-6 text-zinc-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0"
            animate={shouldReduceMotion ? {} : { opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Adaptive Assessment Preview
            </span>
            <h4 className="text-sm font-bold text-zinc-100">
              How PARAKH adapts to you
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Independent Adaptive Logic button triggering dialog without altering live preview */}
          <AdaptiveLogicDialog
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs gap-1.5 border-zinc-700/60 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors shadow-sm cursor-pointer"
              >
                <BrainCircuit className="h-3.5 w-3.5 text-indigo-400" />
                <span>Adaptive Logic</span>
              </Button>
            }
          />

          <Badge
            variant="outline"
            className="bg-zinc-800/60 border-zinc-700/60 text-zinc-300 text-xs gap-1.5 py-1.5 hidden sm:inline-flex"
          >
            <Sparkles className="h-3 w-3 text-indigo-400" />
            Live Demo
          </Badge>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Question + Options */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-h-[280px]">
          {/* Question meta */}
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono">Question {step.questionNum} / {DEMO_STEPS.length}</span>
            <div className="flex items-center gap-1.5">
              <span>Difficulty:</span>
              <Badge className={`${step.difficultyBg} ${step.difficultyColor} font-mono text-[10px] border`}>
                {step.difficulty} · {step.difficultyLabel}
              </Badge>
            </div>
          </div>

          {/* Question text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`q-${stepIndex}`}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-4 text-xs sm:text-sm font-medium leading-relaxed"
            >
              {step.question}
            </motion.div>
          </AnimatePresence>

          {/* Options */}
          <div className="space-y-2">
            {step.options.map((opt, i) => {
              const isSelected = selectedIndex === i;
              const isActuallyCorrect = opt.correct;
              let optClass = "border-zinc-800/80 bg-zinc-950/40 text-zinc-400";
              let indicator = null;

              if (showResult && isActuallyCorrect) {
                optClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-medium";
                indicator = <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
              } else if (showResult && isSelected && !isActuallyCorrect) {
                optClass = "border-red-500/40 bg-red-500/10 text-red-300";
                indicator = <XCircle className="h-4 w-4 text-red-400 shrink-0" />;
              } else if (isSelected && !showResult) {
                optClass = "border-indigo-500/50 bg-indigo-500/10 text-indigo-300 font-medium";
              }

              return (
                <motion.div
                  key={i}
                  animate={
                    shouldReduceMotion ? {} :
                    isSelected && phase === "selecting"
                      ? { scale: [1, 1.012, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.2 }}
                  className={`flex items-center justify-between rounded-md border p-2.5 text-xs transition-all duration-200 ${optClass}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold shrink-0 ${
                        isSelected ? "bg-indigo-500 text-white" :
                        showResult && isActuallyCorrect ? "bg-emerald-500 text-white" :
                        "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {opt.letter}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                  {indicator}
                </motion.div>
              );
            })}
          </div>

          {/* Feedback bar */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[11px] ${
                  isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span>{step.explanation}</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400 font-mono">
                  <ArrowRight className="h-3 w-3" />
                  <span>{step.nextDifficulty}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Live Trajectory Graph */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-100">Ability Score</span>
              </div>
              {showResult && (
                <motion.span
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`text-xs font-bold ${isCorrect ? "text-emerald-400" : "text-amber-400"}`}
                >
                  {isCorrect ? `+${step.abilityAfter - step.abilityBefore}` : `${step.abilityAfter - step.abilityBefore}`}
                </motion.span>
              )}
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trajectory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="q" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis domain={[40, 100]} stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                    formatter={(v: any) => [`${v} pts`, "Ability"]}
                    labelFormatter={(l) => `Q${l}`}
                  />
                  <ReferenceLine
                    y={70}
                    stroke="#6366f1"
                    strokeDasharray="3 3"
                    label={{ value: "Hard Zone", fill: "#818cf8", fontSize: 9, position: "insideTopRight" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ability"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: "#6366f1", r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={!shouldReduceMotion}
                    animationDuration={400}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ability delta summary */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-800/80 text-[11px] mt-2">
            <div className="rounded bg-zinc-900/60 p-2 text-center border border-zinc-800/60">
              <span className="text-zinc-400 block text-[10px] mb-0.5">Current Ability</span>
              <motion.span
                key={`${stepIndex}-${phase}`}
                initial={shouldReduceMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-indigo-400"
              >
                {showResult ? step.abilityAfter : step.abilityBefore} pts
              </motion.span>
            </div>
            <div className="rounded bg-zinc-900/60 p-2 text-center border border-zinc-800/60">
              <span className="text-zinc-400 block text-[10px] mb-0.5">Next Difficulty</span>
              <span className={`font-semibold ${showResult ? step.difficultyColor : "text-zinc-400"}`}>
                {showResult ? step.nextDifficulty.split(" ")[0] + " " + step.nextDifficulty.split(" ")[1] : "Pending…"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
