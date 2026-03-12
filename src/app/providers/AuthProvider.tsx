// src/app/providers/AuthProvider.tsx
import React from "react";
import { AuthProvider as FeatureAuthProvider } from "@/features/auth/AuthProvider";

export function AuthProvider(props: { children: React.ReactNode }) {
  return <FeatureAuthProvider>{props.children}</FeatureAuthProvider>;
}