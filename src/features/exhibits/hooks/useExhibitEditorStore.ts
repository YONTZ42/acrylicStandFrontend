// src/features/exhibits/stores/useExhibitEditorStore.ts
import { useState, useCallback } from "react";

export type LayerType = "foreground" | "background";

export type StyleConfig = {
  depth: number;
  foregroundEffect: "none" | "hologram" | "glitter" | "emission";
  backgroundEffect: "none" | "hologram" | "glitter" | "emission";
};

export type EditorState = {
  // --- Data Assets ---
  // 編集のベースとなる元画像（必要に応じて両方のレイヤーで使い回すため保持）
  originalBlob: Blob | null; 
  originalUrl: string | null;

  foregroundBlob: Blob | null;
  foregroundUrl: string | null;

  backgroundBlob: Blob | null;
  backgroundUrl: string | null;

  // --- Meta Data ---
  styleConfig: StyleConfig;
  title: string;
  description: string;

  // --- UI State ---
  isSaving: boolean;
  editingLayer: LayerType | null; // null: Main Modal, string: Sub Modal open
};

export const useExhibitEditorStore = (initialState?: Partial<EditorState>) => {
  const [state, setState] = useState<EditorState>({
    originalBlob: null,
    originalUrl: null,
    foregroundBlob: null,
    foregroundUrl: null,
    backgroundBlob: null,
    backgroundUrl: null,
    styleConfig: {
      depth: 5.0,
      foregroundEffect: "none",
      backgroundEffect: "none",
    },
    title: "",
    description: "",
    isSaving: false,
    editingLayer: null,
    ...initialState,
  });

  // Actions
  const updateState = useCallback((updates: Partial<EditorState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setLayerBlob = useCallback((layer: LayerType, blob: Blob | null) => {
    setState((prev) => ({
      ...prev,
      [`${layer}Blob`]: blob,
      // Blobが更新されたらURLは一旦クリア（S3アップロード前のため）
      [`${layer}Url`]: null,
    }));
  }, []);

  const setLayerUrl = useCallback((layer: LayerType, url: string | null) => {
    setState((prev) => ({
      ...prev,
      [`${layer}Url`]: url,
    }));
  }, []);

  const updateStyleConfig = useCallback((updates: Partial<StyleConfig>) => {
    setState((prev) => ({
      ...prev,
      styleConfig: { ...prev.styleConfig, ...updates },
    }));
  }, []);

  const openLayerEditor = useCallback((layer: LayerType) => {
    setState((prev) => ({ ...prev, editingLayer: layer }));
  }, []);

  const closeLayerEditor = useCallback(() => {
    setState((prev) => ({ ...prev, editingLayer: null }));
  }, []);

  return {
    ...state,
    updateState,
    setLayerBlob,
    setLayerUrl,
    updateStyleConfig,
    openLayerEditor,
    closeLayerEditor,
  };
};

// Storeを全体で共有するためのContext定義（必要に応じて）
import { createContext, useContext } from 'react';
export const EditorStoreContext = createContext<ReturnType<typeof useExhibitEditorStore> | null>(null);
export const useEditorContext = () => {
    const context = useContext(EditorStoreContext);
    if (!context) throw new Error("useEditorContext must be used within EditorStoreContext.Provider");
    return context;
};