"use client";

import React, { ReactElement } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Zap, BrainCircuit } from "lucide-react";

export function AdaptiveLogicDialog({ trigger }: { trigger: ReactElement }) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md border-border/80 bg-card p-6 shadow-2xl text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <BrainCircuit className="h-5 w-5" />
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px]">
              Adaptive CAT Engine
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            How Adaptive Testing Works
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
            PARAKH adapts each question to your demonstrated ability.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-300 block mb-0.5">Correct answer</span>
              <span className="text-muted-foreground leading-relaxed">
                The next question can become more challenging.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <XCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300 block mb-0.5">Incorrect answer</span>
              <span className="text-muted-foreground leading-relaxed">
                The next question can become easier.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
            <Zap className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-300 block mb-0.5">Response time</span>
              <span className="text-muted-foreground leading-relaxed">
                Response speed provides an additional signal about performance.
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground italic text-center pt-2 border-t border-border/40">
            The system continuously uses your responses to select an appropriate next question.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
