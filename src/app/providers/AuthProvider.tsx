// src/features/auth/AuthProvider.tsx
import React, { createContext, useContext, useMemo } from "react";
import { useAuth, type AuthState } from "./useAuth";

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider(props: { children: React.ReactNode }) {
  const auth = useAuth();
  const value = useMemo(() => (
    {...auth}
  ),[
    auth.user,
    auth.guestId,
    auth.status,
    auth.isReady,
    auth.ensureGuestId,
    auth.login,
    auth.logout
  ]);
  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within <AuthProvider />");
  return ctx;
}