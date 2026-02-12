"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export type PlanTier = "free" | "pro";

export type UserProfile = {
  id: string;
  email: string | null;
  phone: string | null;
  plan: PlanTier;
  proUntil: string | null;
  createdAt: string | null;
};

type AuthContextValue = {
  user: UserProfile | null;
  isPro: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  sendEmailOtp: (email: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type DbProfileRow = {
  id: string;
  email: string | null;
  phone: string | null;
  plan: PlanTier | null;
  pro_until: string | null;
  created_at: string | null;
};

function toUserProfile(user: User, dbProfile: DbProfileRow | null): UserProfile {
  return {
    id: user.id,
    email: user.email ?? dbProfile?.email ?? null,
    phone: user.phone ?? dbProfile?.phone ?? null,
    plan: dbProfile?.plan ?? "free",
    proUntil: dbProfile?.pro_until ?? null,
    createdAt: dbProfile?.created_at ?? null,
  };
}

// Users with permanent full access (bypass plan checks)
const ADMIN_IDS = new Set([
  "f156c714-ded6-45e7-8643-4a78424f4a51", // melkeroberg03@gmail.com
]);

function isProActive(profile: UserProfile | null): boolean {
  if (!profile) return false;
  if (ADMIN_IDS.has(profile.id)) return true;
  if (profile.plan !== "pro") return false;
  if (!profile.proUntil) return true;
  return new Date(profile.proUntil).getTime() > Date.now();
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const isPro = useMemo(() => isProActive(user), [user]);

  useEffect(() => {
    let isMounted = true;

    const load = async (session: Session | null) => {
      const authUser = session?.user ?? null;
      if (!authUser) {
        if (isMounted) setUser(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,phone,plan,pro_until,created_at")
        .eq("id", authUser.id)
        .maybeSingle();

      if (error) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load profile:", error.message);
      }

      // Best-effort upsert so new users get a row.
      await supabase.from("profiles").upsert(
        {
          id: authUser.id,
          email: authUser.email ?? data?.email ?? null,
          phone: authUser.phone ?? data?.phone ?? null,
          plan: data?.plan ?? "free",
          pro_until: data?.pro_until ?? null,
        },
        { onConflict: "id" },
      );

      if (isMounted) setUser(toUserProfile(authUser, (data ?? null) as DbProfileRow | null));
    };

    supabase.auth.getSession().then(({ data }) => load(data.session ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          return;
        }
        load(session);
      },
    );

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string): Promise<{ error?: string }> => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) return { error: "Email and password are required." };
    if (password.length < 6) return { error: "Password must be at least 6 characters." };
    const { error } = await supabase.auth.signUp({
      email: trimmed,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signInWithPassword = async (email: string, password: string): Promise<{ error?: string }> => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) return { error: "Email and password are required." };
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    });
    if (error) return { error: error.message };
    return {};
  };

  const sendEmailOtp = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const sendPasswordReset = async (email: string): Promise<{ error?: string }> => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return { error: "Email is required." };
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account`,
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  /**
   * Re-fetch the profile from Supabase. Useful after checkout to pick up
   * plan changes made by the webhook.
   */
  const refreshProfile = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const authUser = sessionData.session?.user ?? null;
    if (!authUser) return;

    const { data } = await supabase
      .from("profiles")
      .select("id,email,phone,plan,pro_until,created_at")
      .eq("id", authUser.id)
      .maybeSingle();

    if (data) {
      setUser(toUserProfile(authUser, data as DbProfileRow));
    }
  };

  const value = useMemo(
    () => ({
      user,
      isPro,
      signUp,
      signInWithPassword,
      sendEmailOtp,
      sendPasswordReset,
      refreshProfile,
      signOut,
    }),
    [user, isPro],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
