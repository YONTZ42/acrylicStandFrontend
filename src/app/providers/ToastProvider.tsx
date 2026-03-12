// src/app/providers/ToastProvider.tsx
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/shared/utils/cn";

type ToastKind = "success" | "info" | "error";

type ToastItem = {
  id: string;
  kind: ToastKind;
  title?: string;
  message: string;
  createdAt: number;
  durationMs: number;
};

type ToastApi = {
  show: (args: { kind?: ToastKind; message: string; title?: string; durationMs?: number }) => void;
  success: (message: string, opts?: { title?: string; durationMs?: number }) => void;
  info: (message: string, opts?: { title?: string; durationMs?: number }) => void;
  error: (message: string, opts?: { title?: string; durationMs?: number }) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastApi | null>(null);

function uid(): string {
  // crypto が無い環境でも動くようにフォールバック
  const r = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return String(r);
}

export function ToastProvider(props: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const show = useCallback(
    (args: { kind?: ToastKind; message: string; title?: string; durationMs?: number }) => {
      const item: ToastItem = {
        id: uid(),
        kind: args.kind ?? "info",
        title: args.title,
        message: args.message,
        createdAt: Date.now(),
        durationMs: args.durationMs ?? 2800,
      };

      setItems((prev) => [item, ...prev].slice(0, 3)); // 最大3件に制限（画面占有を避ける）

      // 自動dismiss
      window.setTimeout(() => dismiss(item.id), item.durationMs);
    },
    [dismiss]
  );

  const api: ToastApi = useMemo(
    () => ({
      show,
      success: (message, opts) => show({ kind: "success", message, ...opts }),
      info: (message, opts) => show({ kind: "info", message, ...opts }),
      error: (message, opts) => show({ kind: "error", message, ...opts }),
      dismiss,
      clear,
    }),
    [show, dismiss, clear]
  );

  return (
    <ToastContext.Provider value={api}>
      {props.children}

      {/* Toast viewport */}
      <div className="pointer-events-none fixed right-3 top-3 z-50 flex w-[min(360px,calc(100vw-24px))] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-xl border px-3 py-2 shadow-lg backdrop-blur",
              "bg-black/70 text-white",
              t.kind === "success" && "border-emerald-400/40",
              t.kind === "info" && "border-sky-400/40",
              t.kind === "error" && "border-rose-400/40"
            )}
            onClick={() => dismiss(t.id)}
            role="status"
          >
            {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
            <div className="text-sm opacity-90">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider />");
  return ctx;
}
