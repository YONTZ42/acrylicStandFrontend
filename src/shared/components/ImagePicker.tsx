// src/features/exhibits/components/ExhibitEditorModal/ImagePicker.tsx

import React, { useRef } from "react";
import { Upload, RefreshCcw, Trash2 } from "lucide-react";

type Props = {
  currentBlob: Blob | null;
  onSelect: (blob: Blob) => void;
  onClear?: () => void;
  label?: string;
};

export const ImagePicker: React.FC<Props> = ({ 
  currentBlob, 
  onSelect, 
  onClear, 
  label = "Upload Image" 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelect(file);
    }
    // 同じファイルを再選択できるようにリセット
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp, image/heic"
        onChange={handleFileChange}
      />

      {!currentBlob ? (
        <button
          onClick={handleClick}
          className="w-full aspect-video border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-white/40 transition-all group"
        >
          <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
            <Upload size={24} className="text-white/60 group-hover:text-white" />
          </div>
          <span className="text-sm font-medium text-white/60 group-hover:text-white">
            {label}
          </span>
        </button>
      ) : (
        <div className="relative w-full aspect-video bg-black/50 rounded-xl overflow-hidden group border border-white/10">
          <img
            src={URL.createObjectURL(currentBlob)}
            alt="Preview"
            className="w-full h-full object-contain"
          />
          
          {/* Actions Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <button
              onClick={handleClick}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Change Image"
            >
              <RefreshCcw size={20} />
            </button>
            
            {onClear && (
              <button
                onClick={onClear}
                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full transition-colors"
                title="Remove Image"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};