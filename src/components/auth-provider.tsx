"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";

export type PlanTier = "free" | "pro";

export type UserProfile = {
  email: string;
  plan: PlanTier;
  createdAt: string;
};

type AuthContextValue = {
  user: UserProfile | null;
  signIn: (email: string) => void;
  signOut: () => void;
  upgradeToPro: () => void;
  downgradeToFree: () => void;
};

const AUTH_KEY = "calc_auth_v1";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() =>
    readStorage<UserProfile | null>(AUTH_KEY, null),
  );

  const persist = (nextUser: UserProfile | null) => {
    setUser(nextUser);
    writeStorage(AUTH_KEY, nextUser);
  };

  const signIn = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    const nextUser: UserProfile = {
      email: trimmed,
      plan: "free",
      createdAt: new Date().toISOString(),
    };
    persist(nextUser);
  };

  const signOut = () => {
    persist(null);
  };

  const upgradeToPro = () => {
    if (!user) return;
    persist({ ...user, plan: "pro" });
  };

  const downgradeToFree = () => {
    if (!user) return;
    persist({ ...user, plan: "free" });
  };

  const value = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      upgradeToPro,
      downgradeToFree,
    }),
    [user],
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
