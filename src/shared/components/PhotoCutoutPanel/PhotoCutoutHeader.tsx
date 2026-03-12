import React from "react";
import { X, Check, Scissors, Eraser, Undo2, Redo2, Loader2, ScanFace, Layers } from "lucide-react";
import type { ToolMode } from "@/shared/hooks/useKonvaDraw";

const MODES: { id: ToolMode; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
  { id: "cut", icon: Scissors, label: "Manual" },
  { id: "erase", icon: Eraser, label: "Erase" },
];

type Props = {
  isLoading: boolean;
  onClose: () => void;
  onSave: () => void;
  canSave: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  mode: ToolMode;
  onChangeMode: (mode: ToolMode) => void;
  onRunAutoCutout: () => void;
  canRunAutoCutout: boolean;
  onApplyCut: () => void;
  canApplyCut: boolean;
  showApplyCut: boolean;
  
  // Mask functionality
  onDetectMasks: () => void;
  canDetectMasks: boolean;
  onMaskCutout: () => void;
  canMaskCutout: boolean;
  maskCount: number;
};

export const PhotoCutoutHeader: React.FC<Props> = (props) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#1a1a1a] z-50">
      {/* Left: Close */}
      <button
        onClick={props.onClose}
        className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
        disabled={props.isLoading}
        type="button"
      >
        <X size={24} />
      </button>

      {/* Center: Tools */}
      <div className="flex gap-2 sm:gap-4 items-center overflow-x-auto no-scrollbar">
        
        {/* Undo/Redo */}
        <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/5">
          <button
            onClick={props.onUndo}
            disabled={!props.canUndo || props.isLoading}
            className="p-1.5 text-white/70 hover:text-white disabled:opacity-30 hover:bg-white/5 rounded"
            type="button"
          >
            <Undo2 size={18} />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={props.onRedo}
            disabled={!props.canRedo || props.isLoading}
            className="p-1.5 text-white/70 hover:text-white disabled:opacity-30 hover:bg-white/5 rounded"
            type="button"
          >
            <Redo2 size={18} />
          </button>
        </div>

        {/* AI Tools */}
        <div className="flex items-center gap-2">
          {/* Legacy Auto */}
          <button
            type="button"
            onClick={props.onRunAutoCutout}
            disabled={!props.canRunAutoCutout || props.isLoading}
            className="h-9 px-3 text-xs font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            {props.isLoading ? <Loader2 className="animate-spin" size={14} /> : <ScanFace size={16} />}
            Auto
          </button>

          {/* New Multi Detect */}
          <button
            type="button"
            onClick={props.onDetectMasks}
            disabled={!props.canDetectMasks || props.isLoading}
            className={`h-9 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center gap-2 whitespace-nowrap ${
               props.maskCount > 0 
                ? "bg-yellow-400/10 border-yellow-400/50 text-yellow-400" 
                : "border-white/10 bg-white/5 hover:bg-white/10 text-white"
            } disabled:opacity-40`}
          >
            <Layers size={16} />
            Detect {props.maskCount > 0 && `(${props.maskCount})`}
          </button>

          {/* Execute Mask Cutout */}
          {props.canMaskCutout && (
             <button
             type="button"
             onClick={props.onMaskCutout}
             disabled={props.isLoading}
             className="h-9 px-3 text-xs font-bold text-green-400 border border-green-400/30 bg-green-400/10 hover:bg-green-400/20 rounded-lg transition-colors disabled:opacity-30 flex items-center gap-2 whitespace-nowrap animate-in fade-in zoom-in duration-200"
           >
             <Scissors size={14} />
             Cutout Selection
           </button>
          )}
        </div>

        {/* Manual Tools */}
        <div className="flex bg-black/20 rounded-lg p-1 border border-white/5">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = props.mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => props.onChangeMode(m.id)}
                disabled={props.isLoading}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  active
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                } disabled:opacity-40`}
              >
                <Icon size={14} />
                {m.label}
              </button>
            );
          })}
        </div>

        {props.showApplyCut && (
          <button
            type="button"
            onClick={props.onApplyCut}
            disabled={!props.canApplyCut || props.isLoading}
            className="h-9 px-3 text-xs font-bold text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 hover:bg-yellow-400/20 rounded-lg transition-colors disabled:opacity-30 whitespace-nowrap"
          >
            Apply Cut
          </button>
        )}
      </div>

      {/* Right: Save */}
      <button
        onClick={props.onSave}
        disabled={!props.canSave || props.isLoading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        type="button"
      >
        Done
        <Check size={16} />
      </button>
    </div>
  );
};