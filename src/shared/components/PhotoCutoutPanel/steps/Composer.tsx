// src/shared/components/PhotoCutoutPanel/steps/Composer.tsx

import React, { useMemo } from "react";
import { useExhibitEditorStore, type StyleConfig } from "@/shared/hooks/useExhibitEditorStore";

type Props = {
  foregroundBlob: Blob;
  backgroundBlob: Blob | null;
  styleConfig: StyleConfig;
  onUpdateStyle: (config: Partial<StyleConfig>) => void;
  onSave: () => void;
  onBack: () => void;
};

export const Composer: React.FC<Props> = ({ 
  foregroundBlob, backgroundBlob, styleConfig, onUpdateStyle, onSave, onBack 
}) => {
  const fgUrl = useMemo(() => URL.createObjectURL(foregroundBlob), [foregroundBlob]);
  const bgUrl = useMemo(() => backgroundBlob ? URL.createObjectURL(backgroundBlob) : null, [backgroundBlob]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1a1a1a]">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white">Back</button>
        <h3 className="font-bold">Style & Effect</h3>
        <button onClick={onSave} className="px-4 py-2 bg-white text-black font-bold rounded-full text-sm hover:bg-gray-200">
            Save
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Preview Area */}
        <div className="flex-1 bg-[#111] flex items-center justify-center p-8 overflow-hidden relative">
           {/* Simple Parallax Preview (CSS 3D) */}
           <div 
             className="relative w-64 h-80 rounded-lg shadow-2xl transition-transform duration-100"
             style={{
                transformStyle: 'preserve-3d',
                transform: 'perspective(1000px) rotateY(0deg)', // TODO: Add mouse interaction for rotation
             }}
           >
              {/* Background Layer */}
              {bgUrl ? (
                  <img 
                    src={bgUrl} 
                    className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-80"
                    style={{ transform: 'translateZ(-20px)' }} 
                  />
              ) : (
                  <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
              )}
              
              {/* Foreground Layer */}
              <img 
                src={fgUrl} 
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
                style={{ transform: 'translateZ(20px)' }}
              />
              
              {/* Hologram Overlay Effect (CSS) */}
              {styleConfig.foregroundEffect === 'hologram' && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50 pointer-events-none mix-blend-overlay rounded-lg" />
              )}
           </div>
        </div>

        {/* Right: Settings Panel */}
        <div className="w-80 bg-[#1a1a1a] border-l border-white/10 p-4 space-y-6 overflow-y-auto">
            
            {/* Depth Slider */}
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">Thickness (Depth): {styleConfig.depth}mm</label>
                <input 
                    type="range" min="1" max="20" step="0.5"
                    value={styleConfig.depth}
                    onChange={(e) => onUpdateStyle({ depth: parseFloat(e.target.value) })}
                    className="w-full accent-white"
                />
            </div>

            {/* Effect Selectors */}
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">Foreground Effect</label>
                <select 
                    value={styleConfig.foregroundEffect}
                    onChange={(e) => onUpdateStyle({ foregroundEffect: e.target.value as any })}
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:outline-none"
                >
                    <option value="none">None</option>
                    <option value="hologram">Hologram</option>
                    <option value="glitter">Glitter</option>
                    <option value="emission">Emission</option>
                </select>
            </div>

            {/* More sliders based on effect... */}
            {styleConfig.foregroundEffect === 'hologram' && (
                <div>
                     <label className="block text-xs font-bold text-gray-400 mb-2">Hologram Intensity</label>
                    <input 
                        type="range" min="0" max="1" step="0.1"
                        value={styleConfig.hologramIntensity}
                        onChange={(e) => onUpdateStyle({ hologramIntensity: parseFloat(e.target.value) })}
                        className="w-full accent-white"
                    />
                </div>
            )}

        </div>
      </div>
    </div>
  );
};