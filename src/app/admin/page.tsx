"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Edit3,
  X,
  Save,
} from "lucide-react";
import { MOCK_ADMIN_QUESTIONS, AdminQuestionItem } from "@/lib/mock-data";
import { toast } from "sonner";

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  item,
  onClose,
  onSave,
}: {
  item: AdminQuestionItem;
  onClose: () => void;
  onSave: (updated: AdminQuestionItem) => void;
}) {
  const [questionText, setQuestionText] = useState(item.questionText);
  const [options, setOptions] = useState<string[]>([...item.options]);
  const [correctIndex, setCorrectIndex] = useState(item.correctOptionIndex);

  const handleOptionChange = (idx: number, value: string) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleSave = () => {
    onSave({ ...item, questionText, options, correctOptionIndex: correctIndex });
    toast.success("Question updated successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Edit Question</h2>
            <p className="text-xs text-muted-foreground">
              {item.topic} · {item.subtopic} · Level {item.difficultyLevel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Question text */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Question Text
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={3}
            className="w-full bg-muted/40 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">
            Answer Options{" "}
            <span className="text-muted-foreground font-normal">
              (select correct answer)
            </span>
          </label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <button
                onClick={() => setCorrectIndex(idx)}
                className={`mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  correctIndex === idx
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-border/70 hover:border-emerald-500/50"
                }`}
                aria-label={`Mark option ${String.fromCharCode(65 + idx)} as correct`}
              >
                {correctIndex === idx && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white block" />
                )}
              </button>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono shrink-0">
                  {String.fromCharCode(65 + idx)})
                </span>
                <input
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 bg-muted/40 border border-border/80 rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

type QuestionStatus = "pending" | "approved" | "rejected";

function QuestionCard({
  item,
  onApprove,
  onReject,
  onEdit,
}: {
  item: AdminQuestionItem;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
}) {
  const isPending = item.status === "pending";
  const isApproved = item.status === "approved";
  const isRejected = item.status === "rejected";

  const cardBorder = isApproved
    ? "border-emerald-500/40"
    : isRejected
    ? "border-red-500/20 opacity-60"
    : "border-amber-500/30";

  return (
    <Card className={`p-5 border bg-card shadow-md transition-all ${cardBorder}`}>
      {/* Card header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {isPending && (
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
              AI GENERATED · PENDING REVIEW
            </Badge>
          )}
          {isApproved && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
              <CheckCircle2 className="h-3 w-3" />
              APPROVED
            </Badge>
          )}
          {isRejected && (
            <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px] gap-1">
              <XCircle className="h-3 w-3" />
              REJECTED
            </Badge>
          )}
          <span className="text-xs text-muted-foreground font-mono">{item.id}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Topic: <strong className="text-foreground">{item.topic}</strong>
          </span>
          <span>·</span>
          <span>
            Difficulty:{" "}
            <strong className="text-foreground">
              Level {item.difficultyLevel} ({item.difficulty})
            </strong>
          </span>
        </div>
      </div>

      {/* Question text */}
      <p className="text-sm font-medium text-foreground mb-4 leading-relaxed">
        {item.questionText}
      </p>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4">
        {item.options.map((opt, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-lg border ${
              idx === item.correctOptionIndex
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-medium"
                : "border-border/60 bg-muted/30 text-muted-foreground"
            }`}
          >
            <span className="font-mono mr-1.5">{String.fromCharCode(65 + idx)})</span>
            {opt}
            {idx === item.correctOptionIndex && (
              <span className="ml-1 text-emerald-400">✓</span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <span className="text-xs text-muted-foreground">{item.sourceLabel}</span>
        {isPending && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="text-xs gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onReject}
              className="text-xs gap-1"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={onApprove}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  const [questions, setQuestions] = useState<AdminQuestionItem[]>(
    MOCK_ADMIN_QUESTIONS
  );
  const [editingItem, setEditingItem] = useState<AdminQuestionItem | null>(null);

  useEffect(() => {
    if (!loading && profile && profile.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, profile, router]);

  if (loading || !profile || profile.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  const updateStatus = (id: string, status: QuestionStatus) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
  };

  const handleApprove = (id: string) => {
    updateStatus(id, "approved");
    toast.success("Question approved and added to the assessment pool.");
  };

  const handleReject = (id: string) => {
    updateStatus(id, "rejected");
    toast.error("Question rejected and removed from the review queue.");
  };

  const handleSaveEdit = (updated: AdminQuestionItem) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q))
    );
  };

  const pending = questions.filter((q) => q.status === "pending").length;
  const approved = questions.filter((q) => q.status === "approved").length;
  const rejected = questions.filter((q) => q.status === "rejected").length;

  return (
    <DashboardLayout>
      {/* Edit modal */}
      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
        />
      )}

      <div className="space-y-6">
        {/* Page header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs"
            >
              Administrator Control Center
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            AI Question Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review AI-generated MCQs before approving them into the assessment pool.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10">
            <span className="text-amber-400 font-bold">{pending}</span>
            <span className="text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <span className="text-emerald-400 font-bold">{approved}</span>
            <span className="text-muted-foreground">Approved</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10">
            <span className="text-red-400 font-bold">{rejected}</span>
            <span className="text-muted-foreground">Rejected</span>
          </div>
        </div>

        {/* Question cards */}
        <div className="space-y-4">
          {questions.map((item) => (
            <QuestionCard
              key={item.id}
              item={item}
              onApprove={() => handleApprove(item.id)}
              onReject={() => handleReject(item.id)}
              onEdit={() => setEditingItem(item)}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
