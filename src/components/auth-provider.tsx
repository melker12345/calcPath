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
  signInWithGoogle: () => Promise<void>;
  sendEmailOtp: (email: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyOtp: (params: { email?: string; phone?: string; token: string }) => Promise<void>;
  setMembership: (params: { plan: PlanTier; proUntil: string | null }) => Promise<void>;
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
  "8e3871de-9cb4-4292-be10-cf45f84e96b4", // memleoberg@gmail.com
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

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
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

  const sendPhoneOtp = async (phone: string) => {
    const trimmed = phone.trim();
    if (!trimmed) return;
    await supabase.auth.signInWithOtp({
      phone: trimmed,
      options: {
        channel: "sms",
      },
    });
  };

  const verifyOtp = async (params: { email?: string; phone?: string; token: string }) => {
    const token = params.token.trim();
    if (!token) return;
    if (params.email) {
      await supabase.auth.verifyOtp({
        email: params.email.trim().toLowerCase(),
        token,
        type: "email",
      });
      return;
    }
    if (params.phone) {
      await supabase.auth.verifyOtp({
        phone: params.phone.trim(),
        token,
        type: "sms",
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const setMembership = async (params: { plan: PlanTier; proUntil: string | null }) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ plan: params.plan, pro_until: params.proUntil })
      .eq("id", user.id);
    if (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to update membership:", error.message);
      return;
    }
    setUser((prev) =>
      prev ? { ...prev, plan: params.plan, proUntil: params.proUntil } : prev,
    );
  };

  const value = useMemo(
    () => ({
      user,
      isPro,
      signInWithGoogle,
      sendEmailOtp,
      sendPhoneOtp,
      verifyOtp,
      setMembership,
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
