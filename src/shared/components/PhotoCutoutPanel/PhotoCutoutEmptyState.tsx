"use client";

import React from "react";
import { Upload } from "lucide-react";

type Props = {
  onPickFile: (file: File) => void;
};

export const PhotoCutoutEmptyState: React.FC<Props> = ({ onPickFile }) => {
  return (
    <label className="flex flex-col items-center gap-4 cursor-pointer p-12 border-2 border-dashed border-gray-700 rounded-2xl hover:border-gray-500 transition-colors">
      <Upload size={48} className="text-gray-500" />
      <span className="text-gray-400 font-bold">Upload Photo</span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPickFile(file);
        }}
      />
    </label>
  );
};