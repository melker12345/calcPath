"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

/**
 * The only signed-in surface on the site is /admin/feedback. This provider
 * exposes the Supabase session (email + access token) and password sign-in.
 * Outside an AuthProvider, useAuth() returns a signed-out value rather than
 * throwing, so public pages never depend on it.
 */
export type AuthUser = { id: string; email: string | null };

type AuthContextValue = {
  /** undefined while the initial session is still being read. */
  user: AuthUser | null | undefined;
  accessToken: string | null;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const signedOut: AuthContextValue = {
  user: null,
  accessToken: null,
  signInWithPassword: async () => ({ error: "Not available here." }),
  signOut: async () => {},
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function fromSession(session: Session | null): { user: AuthUser | null; accessToken: string | null } {
  if (!session?.user) return { user: null, accessToken: null };
  return {
    user: { id: session.user.id, email: session.user.email ?? null },
    accessToken: session.access_token ?? null,
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // NEXT_PUBLIC_* vars are inlined at build time, so "configured or not" is
  // the same on the server and in the browser; without Supabase the state is
  // signed-out from the first render instead of "checking".
  const [state, setState] = useState<{ user: AuthUser | null | undefined; accessToken: string | null }>(() => ({
    user: getSupabase() ? undefined : null,
    accessToken: null,
  }));

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setState(fromSession(data.session ?? null));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(fromSession(session));
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      signInWithPassword: async (email, password) => {
        const supabase = getSupabase();
        if (!supabase) return { error: "Sign-in is not configured on this deployment." };
        const trimmed = email.trim().toLowerCase();
        if (!trimmed || !password) return { error: "Email and password are required." };
        const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password });
        return error ? { error: error.message } : {};
      },
      signOut: async () => {
        await getSupabase()?.auth.signOut();
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => useContext(AuthContext) ?? signedOut;
