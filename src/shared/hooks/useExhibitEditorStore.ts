// src/features/exhibits/stores/useExhibitEditorStore.ts

import { useState, useCallback } from "react";

export type LayerType = "original" | "foreground" | "background";

export type EditorState = {
  originalBlob: Blob | null;
  foregroundBlob: Blob | null;
  backgroundBlob: Blob | null;
  
  // サーバー同期用URL
  originalUrl: string | null;
  foregroundUrl: string | null;
  backgroundUrl: string | null;

  // メタデータ
  styleConfig: Record<string, any>;
  styleForeground: Record<string, any>;
  styleBackground: Record<string, any>;
  
  activeLayer: LayerType; // 現在編集中のレイヤー
};

export const useExhibitEditorStore = (initialState?: Partial<EditorState>) => {
  const [state, setState] = useState<EditorState>({
    originalBlob: null,
    foregroundBlob: null,
    backgroundBlob: null,
    originalUrl: null,
    foregroundUrl: null,
    backgroundUrl: null,
    styleConfig: { depth: 5 },
    styleForeground: {},
    styleBackground: {},
    activeLayer: "original", // 初期値はoriginalからスタート
    ...initialState
  });

  const setBlob = useCallback((layer: LayerType, blob: Blob | null) => {
    setState((prev) => {
      // 型安全な更新
      const updates: Partial<EditorState> = {};
      if (layer === "original") updates.originalBlob = blob;
      else if (layer === "foreground") updates.foregroundBlob = blob;
      else if (layer === "background") updates.backgroundBlob = blob;
      return { ...prev, ...updates };
    });
  }, []);

  const setUrl = useCallback((layer: LayerType, url: string | null) => {
    setState((prev) => {
      const updates: Partial<EditorState> = {};
      if (layer === "original") updates.originalUrl = url;
      else if (layer === "foreground") updates.foregroundUrl = url;
      else if (layer === "background") updates.backgroundUrl = url;
      return { ...prev, ...updates };
    });
  }, []);

  const setStyle = useCallback((target: "config" | "foreground" | "background", style: any) => {
    setState((prev) => {
      const updates: Partial<EditorState> = {};
      if (target === "config") {
        updates.styleConfig = { ...prev.styleConfig, ...style };
      } else if (target === "foreground") {
        updates.styleForeground = { ...prev.styleForeground, ...style };
      } else if (target === "background") {
        updates.styleBackground = { ...prev.styleBackground, ...style };
      }
      return { ...prev, ...updates };
    });
  }, []);

  const setActiveLayer = useCallback((layer: LayerType) => {
    setState((prev) => ({ ...prev, activeLayer: layer }));
  }, []);

  return {
    ...state,
    setBlob,
    setUrl,
    setStyle,
    setActiveLayer
  };
};