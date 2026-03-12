import { useCallback, useState } from "react";

export const useImageEditorState = () => {
  const [history, setHistory] = useState<Blob[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const currentBlob = currentIndex >= 0 ? history[currentIndex] : null;

  const pushState = useCallback(
    (blob: Blob) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        return [...newHistory, blob];
      });
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, history.length]);

  const init = useCallback((blob: Blob) => {
    setHistory([blob]);
    setCurrentIndex(0);
  }, []);

  const reset = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    currentBlob,
    pushState,
    undo,
    redo,
    init,
    reset,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
};