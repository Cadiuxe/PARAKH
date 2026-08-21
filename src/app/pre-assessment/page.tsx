"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  BrainCircuit,
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  Trophy,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Layers,
  BookOpen,
  Check,
  ChevronRight,
  AlertTriangle,
  Code2,
  Cpu,
  Database,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { AssessmentQuestion } from "@/lib/mock-data";
import {
  getDiagnosticQuestionSet,
  evaluatePreAssessment,
  savePreAssessmentSession,
  PreAssessmentResult,
  DomainMastery,
  TOPIC_CONFIG,
} from "@/lib/pre-assessment-engine";

type Stage = "setup" | "test" | "report";

interface AnswerRecord {
  question: AssessmentQuestion;
  selectedIndex: number;
  timeTakenSec: number;
}

const SUBJECT_OPTIONS = [
  { id: "Mixed", name: "All Subjects (Mixed)", code: "MIXED", icon: SlidersHorizontal, description: "Broad CS diagnostic across DSA, OS, DBMS, and CN", color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10" },
  { id: "DSA", name: "Data Structures & Algorithms", code: "DSA", icon: Code2, description: "Arrays, Trees, Graphs, Sorting, DP, Heap & Complexity", color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10" },
  { id: "OS", name: "Operating Systems", code: "OS", icon: Cpu, description: "Processes, Threads, Scheduling, Memory, Deadlocks & Files", color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10" },
  { id: "DBMS", name: "Database Management Systems", code: "DBMS", icon: Database, description: "SQL, Relational Algebra, Normalization, 2PL & MVCC", color: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
  { id: "CN", name: "Computer Networks", code: "CN", icon: Globe, description: "OSI Layers, TCP/IP, Routing, IP Subnetting & TLS", color: "border-pink-500/30 text-pink-400 bg-pink-500/10" },
];

export default function PreAssessmentPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [subject, setSubject] = useState<string>("Mixed");
  const [questionCount, setQuestionCount] = useState<number>(8);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [result, setResult] = useState<PreAssessmentResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestion = questions[currentIndex];

  // Start pre-assessment
  const handleStart = (selectedSubject: string, count: number) => {
    setSubject(selectedSubject);
    setQuestionCount(count);
    const qSet = getDiagnosticQuestionSet(count, selectedSubject);
    setQuestions(qSet);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setAnswers([]);
    setTimeRemaining(90);
    setStage("test");
  };

  // Next question / submit diagnostic
  const handleNextQuestion = useCallback(() => {
    if (!currentQuestion) return;

    const chosen = selectedIndex ?? -1;
    const timeTaken = 90 - timeRemaining;
    const newRecord: AnswerRecord = {
      question: currentQuestion,
      selectedIndex: chosen,
      timeTakenSec: Math.max(1, timeTaken),
    };

    const updatedAnswers = [...answers, newRecord];
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedIndex(null);
      setTimeRemaining(90);
    } else {
      // Diagnostic complete - evaluate knowledge
      if (timerRef.current) clearInterval(timerRef.current);
      const evalResult = evaluatePreAssessment(updatedAnswers, subject);
      setResult(evalResult);
      savePreAssessmentSession(evalResult, updatedAnswers, subject);
      setStage("report");
    }
  }, [answers, currentIndex, currentQuestion, questions.length, selectedIndex, subject, timeRemaining]);

  // Timer countdown
  useEffect(() => {
    if (stage !== "test") return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 90;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, handleNextQuestion]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ─── STAGE 1: SETUP & SUBJECT SELECTION ───────────────────────── */}
        {stage === "setup" && (
          <div className="space-y-8 py-4">
            {/* Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <Target className="h-7 w-7" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Pre-Assessment Knowledge Diagnostic
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Benchmark your baseline knowledge in individual CS subjects or take a combined multi-subject diagnostic before entering adaptive learning.
              </p>
            </div>

            {/* Subject Selector */}
            <Card className="p-6 sm:p-8 border border-border/80 bg-card shadow-lg space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">1. Choose Subject Focus</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Select a specific subject for targeted pre-assessment diagnostic or test all subjects combined.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SUBJECT_OPTIONS.map((sub) => {
                    const Icon = sub.icon;
                    const isSelected = subject === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSubject(sub.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-600/15 text-foreground ring-1 ring-indigo-500/50 shadow-md"
                            : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg border ${sub.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-sm text-foreground">{sub.name}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-indigo-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                          {sub.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Diagnostic Length Selector */}
              <div className="pt-4 border-t border-border space-y-3">
                <h2 className="text-lg font-bold text-foreground mb-1">2. Select Diagnostic Length</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { count: 5, label: "5 Items", desc: "Quick Diagnostic (~5 mins)" },
                    { count: 8, label: "8 Items", desc: "Standard Diagnostic (~8 mins)" },
                    { count: 10, label: "10 Items", desc: "In-Depth Diagnostic (~10 mins)" },
                    { count: 12, label: "12 Items", desc: "Full Comprehensive (~15 mins)" },
                  ].map((opt) => (
                    <div
                      key={opt.count}
                      onClick={() => setQuestionCount(opt.count)}
                      className={`cursor-pointer rounded-xl border p-3.5 text-center transition-all ${
                        questionCount === opt.count
                          ? "border-indigo-500 bg-indigo-600/15 text-indigo-300 ring-1 ring-indigo-500/50 font-bold"
                          : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <div className="text-sm font-extrabold text-foreground">{opt.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start CTA */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="text-xs text-muted-foreground font-medium">
                  Selected: <span className="text-indigo-400 font-semibold">{SUBJECT_OPTIONS.find((s) => s.id === subject)?.name}</span> • {questionCount} Diagnostic Questions
                </div>

                <Button
                  size="lg"
                  onClick={() => handleStart(subject, questionCount)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-8 shadow-lg shadow-indigo-600/25 gap-2"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Start {subject === "Mixed" ? "All Subjects" : subject} Pre-Assessment
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ─── STAGE 2: DIAGNOSTIC TEST EXECUTION ─────────────────────────── */}
        {stage === "test" && currentQuestion && (
          <div className="space-y-6 max-w-3xl mx-auto py-2">
            {/* Top Navigation & Status */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 px-3 py-1 font-semibold">
                  Pre-Assessment ({subject})
                </Badge>
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  {currentQuestion.topic} • {currentQuestion.subtopic}
                </Badge>
              </div>

              <div className="flex items-center gap-2 font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                <Clock className="h-4 w-4" />
                <span>{timeRemaining}s</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete</span>
              </div>
              <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
            </div>

            {/* Question Card */}
            <Card className="p-6 sm:p-8 border border-border bg-card shadow-md space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Question {currentIndex + 1} • Difficulty Level {currentQuestion.difficultyLevel}/5
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                  {currentQuestion.questionText}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`flex items-start gap-3.5 rounded-xl border p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-600/15 text-foreground ring-1 ring-indigo-500/50"
                          : "border-border/70 bg-muted/20 hover:bg-muted/50 hover:border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "border border-muted-foreground/30 bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm font-medium leading-relaxed pt-0.5">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextQuestion}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip Question
                </Button>

                <Button
                  size="default"
                  onClick={handleNextQuestion}
                  disabled={selectedIndex === null}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-6 gap-2"
                >
                  {currentIndex + 1 === questions.length ? "Finish Diagnostic" : "Next Question"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ─── STAGE 3: KNOWLEDGE DIAGNOSTIC REPORT ───────────────────────── */}
        {stage === "report" && result && (
          <div className="space-y-8 py-2">
            {/* Top Banner */}
            <Card className="relative overflow-hidden border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-background to-background p-6 sm:p-8 shadow-xl">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                    Diagnostic Completed • {result.subjectName}
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    {result.subject === "Mixed" ? "All-Subject" : result.subjectName} Knowledge Diagnostic Report
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    Your baseline assessment for {result.subjectName} has been evaluated and registered to your adaptive learning profile.
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 bg-muted/40 p-4 rounded-2xl border border-border">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-extrabold text-xl shadow-lg shadow-indigo-600/30">
                    {result.initialAbility}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Diagnosed Ability
                    </div>
                    <div className="text-lg font-bold text-indigo-400">
                      {result.abilityLevel}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Accuracy: {result.overallScore}% ({result.correctCount}/{result.totalQuestions})
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Knowledge Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Bar Chart */}
              <Card className="lg:col-span-7 p-6 border border-border bg-card shadow-md flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {result.subject === "Mixed" ? "Domain Knowledge Breakdown" : `${result.subject} Subtopic Breakdown`}
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Accuracy percentage achieved per {result.subject === "Mixed" ? "subject domain" : "subtopic area"}.
                  </p>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.domainBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="code" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload as DomainMastery;
                              return (
                                <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-xs space-y-1">
                                  <div className="font-bold text-foreground">{d.name}</div>
                                  <div className="text-indigo-400 font-semibold">Mastery: {d.percentage}%</div>
                                  <div className="text-muted-foreground">Correct: {d.correct} / {d.total}</div>
                                  <div className="text-muted-foreground">Status: {d.status}</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                          {result.domainBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>

              {/* Mastery Breakdown Cards */}
              <div className="lg:col-span-5 grid grid-cols-1 gap-3">
                {result.domainBreakdown.map((dom) => (
                  <Card key={dom.code} className="p-4 border border-border/80 bg-card shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{dom.name}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border">
                          {dom.code}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dom.correct} of {dom.total} items correct
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-foreground">{dom.percentage}%</div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-2 py-0.5 ${
                          dom.percentage >= 75
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : dom.percentage >= 50
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {dom.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Strengths & Areas to Improve */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="p-6 border border-emerald-500/20 bg-card shadow-md space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Knowledge Strengths</span>
                </div>
                <div className="space-y-3">
                  {result.strengths.length > 0 ? (
                    result.strengths.map((st, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                        <div className="font-semibold text-sm text-foreground">{st.topic}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{st.detail}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No high-proficiency areas identified yet. Practice foundational concepts.
                    </p>
                  )}
                </div>
              </Card>

              {/* Weaknesses */}
              <Card className="p-6 border border-amber-500/20 bg-card shadow-md space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Priority Improvement Areas</span>
                </div>
                <div className="space-y-3">
                  {result.areasToImprove.length > 0 ? (
                    result.areasToImprove.map((ai, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 space-y-1">
                        <div className="font-semibold text-sm text-foreground">{ai.topic}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{ai.detail}</div>
                        {ai.recommendedAction && (
                          <div className="text-xs text-amber-400/90 font-medium pt-1">
                            💡 {ai.recommendedAction}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Great performance across all evaluated topics!
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <Card className="p-6 border border-border bg-card shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-foreground">Ready for Adaptive Testing?</h3>
                <p className="text-xs text-muted-foreground">
                  Your baseline ability for {result.subjectName} ({result.initialAbility} pts) has been saved. Start an adaptive CAT session.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setStage("setup")}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Take Another Subject Pre-Assessment
                </Button>

                <Button
                  asChild
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 gap-2"
                >
                  <Link href="/assessment">
                    <Play className="h-4 w-4 fill-current" />
                    Launch Adaptive CAT
                  </Link>
                </Button>
              </div>
            </Card>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
