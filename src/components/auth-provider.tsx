"use client";

import { createContext, useContext } from "react";

export type UserProfile = {
  id: string;
  email: string | null;
  phone: string | null;
  createdAt: string | null;
};

type AuthContextValue = {
  user: UserProfile | null;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  sendEmailOtp: (email: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const noAuthValue: AuthContextValue = {
  user: null,
  signUp: async () => ({}),
  signInWithPassword: async () => ({}),
  sendEmailOtp: async () => {},
  sendPasswordReset: async () => ({}),
  refreshProfile: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext<AuthContextValue>(noAuthValue);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthContext.Provider value={noAuthValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  // No throw: returns no-op value for compatibility after auth removal.
  // useOptionalAuth likewise always returns the empty value (never undefined).
  const context = useContext(AuthContext);
  return context ?? noAuthValue;
};

export const useOptionalAuth = () => {
  const context = useContext(AuthContext);
  return context ?? noAuthValue;
};
