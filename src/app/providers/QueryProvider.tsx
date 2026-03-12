// src/app/providers/QueryProvider.tsx
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // UX: 画面復帰で毎回リフェッチするとチラつくのでOFF（必要なら個別に上書き）
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 10_000,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function QueryProvider(props: { children: React.ReactNode }) {
  // StrictMode の二重実行でも QueryClient が増殖しないよう state 初期化で固定
  const [client] = useState<QueryClient>(() => createQueryClient());

  return <QueryClientProvider client={client}>{props.children}</QueryClientProvider>;
}
