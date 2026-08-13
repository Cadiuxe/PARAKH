"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./db/client";
import { getProfile } from "./db/profiles";
import type { ProfileRow } from "./db/types";

const PROTECTED_ROUTES = ["/dashboard", "/assessment", "/results", "/settings", "/admin"];

interface AuthContextType {
  user: User | null;
  profile: ProfileRow | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  const loadProfile = useCallback(async (userId: string) => {
    let p = await getProfile(userId);
    // Retry up to 2 times if profile was just created by database trigger
    if (!p) {
      await new Promise((r) => setTimeout(r, 400));
      p = await getProfile(userId);
    }
    if (!p) {
      await new Promise((r) => setTimeout(r, 600));
      p = await getProfile(userId);
    }
    return p;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const p = await loadProfile(user.id);
      setProfile(p);
    }
  }, [user, loadProfile]);

  // 1. Auth state listener (pure synchronous updates to prevent deadlock/race conditions)
  useEffect(() => {
    const supabase = getSupabaseClient();

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Synchronous auth state listener — never await async DB queries directly inside this callback
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Profile loader effect — runs safely outside auth state callback whenever user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let isMounted = true;

    loadProfile(user.id).then((p) => {
      if (isMounted) {
        setProfile(p);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user?.id, loadProfile]);

  // 3. Client-side Route protection & redirects
  useEffect(() => {
    if (loading) return;

    const isProtected = PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isProtected && !user) {
      router.replace("/login");
    } else if (pathname === "/login" && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, pathname, router]);

  const signOut = async () => {
    setLoading(true);
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
    router.replace("/login");
  };

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Prevent flash of protected page content while auth state is loading
  if (loading && isProtected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Authenticating…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
