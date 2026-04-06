// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "@/shared/styles/globals.css";

import { AppRouter } from "@/app/AppRouter";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ToastProvider } from "@/app/providers/ToastProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>

  </React.StrictMode>
);
