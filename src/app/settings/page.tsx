"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sliders, User, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateProfile } from "@/lib/db/profiles";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [adaptiveStrategy, setAdaptiveStrategy] = useState("heuristic");
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Profile editable fields
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [institution, setInstitution] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setRollNumber(profile.roll_number || "");
      setInstitution(profile.institution || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateProfile(user.id, {
        full_name: fullName.trim(),
        roll_number: rollNumber.trim() || null,
        institution: institution.trim() || null,
      });

      if (updated) {
        await refreshProfile();
        toast.success("Profile and settings updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      toast.error("Error saving profile settings");
    } finally {
      setSaving(false);
    }
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
            Customize assessment preferences, adaptive engine parameters, and student profile details.
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
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <User className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-foreground">Student Profile Details</h3>
                <p className="text-xs text-muted-foreground">Authenticated user account settings.</p>
              </div>
            </div>
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-xs capitalize">
              Role: {profile?.role || "Student"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-muted-foreground block font-semibold">Full Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Student Full Name"
                className="bg-muted/40 border-border/80 focus-visible:ring-indigo-500 h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-muted-foreground block font-semibold">Student / Roll Number</label>
              <Input
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 2024-CS-084"
                className="bg-muted/40 border-border/80 focus-visible:ring-indigo-500 h-9 text-xs"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-muted-foreground block font-semibold">Institution / College</label>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Department of Computer Science"
                className="bg-muted/40 border-border/80 focus-visible:ring-indigo-500 h-9 text-xs"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-muted-foreground block font-semibold">Account Email (read-only)</label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-muted/20 border-border/40 text-muted-foreground h-9 text-xs cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? "Saving…" : "Save Preferences"}</span>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
