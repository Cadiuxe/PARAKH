"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Sliders, Bell, Moon, User, Save } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SettingsPage() {
  const [adaptiveStrategy, setAdaptiveStrategy] = useState("heuristic");
  const [autoAdvance, setAutoAdvance] = useState(true);

  const handleSave = () => {
    toast.success("Prototype settings saved successfully");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs">
              System Configuration
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Platform Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Customize assessment preferences, adaptive engine parameters, and display options.
          </p>
        </div>

        {/* Adaptive Engine Configuration Card */}
        <Card className="p-6 border border-border/80 bg-card shadow-md space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <Sliders className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-foreground">Adaptive Selection Preferences</h3>
              <p className="text-xs text-muted-foreground">Configure question selection heuristics for prototype drills.</p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1">Adaptive Strategy Model</label>
              <select
                value={adaptiveStrategy}
                onChange={(e) => setAdaptiveStrategy(e.target.value)}
                className="w-full sm:w-72 bg-muted/50 border border-border/80 rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-indigo-500"
              >
                <option value="heuristic">Rule-Based Heuristic (Default)</option>
                <option value="balanced">Balanced Topic Exposure</option>
                <option value="weakness">Weakness Priority Mode</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-border/40">
              <div>
                <span className="font-semibold text-foreground block">Auto-Advance Next Question</span>
                <span className="text-muted-foreground text-[11px]">Automatically load subsequent question after submitting response.</span>
              </div>
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </Card>

        {/* User Account Settings Card */}
        <Card className="p-6 border border-border/80 bg-card shadow-md space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <User className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-foreground">Student Profile Details</h3>
              <p className="text-xs text-muted-foreground">Mock user identity representation.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block mb-1">Student Name</span>
              <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30 font-medium">Arjun Sharma</div>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Roll Number</span>
              <div className="p-2.5 rounded-lg border border-border/60 bg-muted/30 font-medium">CS-2026-042</div>
            </div>
          </div>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end gap-3">
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
