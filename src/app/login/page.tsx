"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BrainCircuit, ArrowLeft, Eye, EyeOff, Loader2, UserPlus, LogIn } from "lucide-react";
import { getSupabaseClient } from "@/lib/db/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [institution, setInstitution] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid login credentials.");
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected authentication error occurred.");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email || !password) {
      setError("Please enter your email and a password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            roll_number: rollNumber.trim() || null,
            institution: institution.trim() || null,
          },
        },
      });

      if (authError) {
        setError(authError.message || "Failed to create account.");
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
      } else {
        setMessage("Account created! Please check your email to confirm your account, or sign in if confirmation is disabled.");
        setMode("signin");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during sign up.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-foreground relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-6 relative z-10">
        {/* Brand mark */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === "signin" ? "Sign in to PARAKH" : "Create PARAKH Account"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === "signin"
                ? "Access your adaptive testing portal"
                : "Register for computer adaptive assessment"}
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 rounded-xl bg-muted/40 p-1 border border-border/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setMessage("");
            }}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "signin"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setMessage("");
            }}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "signup"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Register</span>
          </button>
        </div>

        <Card className="p-6 border border-border/80 bg-card shadow-xl space-y-5">
          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">

            {/* Full Name (Sign Up only) */}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Alex Chen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-muted/40 border-border/80 focus-visible:ring-indigo-500 h-10 text-sm"
                  disabled={loading}
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email address <span className="text-red-400">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="student@university.edu"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/40 border-border/80 focus-visible:ring-indigo-500 h-10 text-sm"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/40 border-border/80 focus-visible:ring-indigo-500 h-10 text-sm pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Optional profile fields (Sign Up only) */}
            {mode === "signup" && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="rollNumber" className="text-xs font-semibold text-foreground">
                    Roll / Student ID <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Input
                    id="rollNumber"
                    type="text"
                    placeholder="e.g. 2024-CS-084"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="bg-muted/40 border-border/80 focus-visible:ring-indigo-500 h-10 text-sm"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="institution" className="text-xs font-semibold text-foreground">
                    Institution / College <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Input
                    id="institution"
                    type="text"
                    placeholder="e.g. Department of Computer Science"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="bg-muted/40 border-border/80 focus-visible:ring-indigo-500 h-10 text-sm"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Messages */}
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-10 font-semibold shadow-md shadow-indigo-600/20"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "signin" ? "Signing in…" : "Creating account…"}
                </span>
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Card>

        {/* Back to home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
