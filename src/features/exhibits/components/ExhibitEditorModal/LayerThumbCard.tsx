// src/features/exhibits/components/ExhibitEditorModal/LayerThumbCard.tsx
import React, { useMemo, useEffect } from "react";
import type { LayerType } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { Image as ImageIcon, Plus, Edit2 } from "lucide-react";

type Props = {
  title: string;
  type: LayerType;
  blob: Blob | null;
  url: string | null;
  onClick: () => void;
};

export const LayerThumbCard: React.FC<Props> = ({ title, type, blob, url, onClick }) => {
  // BlobのURL生成とクリーンアップ
  const previewUrl = useMemo(() => {
    if (blob) return URL.createObjectURL(blob);
    if (url) return url;
    return null;
  }, [blob, url]);

  useEffect(() => {
    return () => {
      if (blob && previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [blob, previewUrl]);

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-[120px]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
        {previewUrl && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">Set</span>}
      </div>
      
      <button
        type="button"
        onClick={onClick}
        className="relative w-full aspect-square rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all flex flex-col items-center justify-center overflow-hidden group"
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={title} className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
               <Edit2 size={24} className="text-white drop-shadow-md" />
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-white/5 rounded-full mb-2 group-hover:bg-white/10 transition-colors">
              <Plus size={24} className="text-white/40 group-hover:text-white" />
            </div>
            <span className="text-xs text-white/40 font-medium group-hover:text-white">Add Layer</span>
          </>
        )}
      </button>
    </div>
  );
};