// src/features/exhibits/components/ExhibitEditorModal/ExhibitPreview3D.tsx
import React, { useMemo } from "react";
import { useEditorContext } from "@/features/exhibits/hooks/useExhibitEditorStore";

export const ExhibitPreview3D: React.FC = () => {
  const store = useEditorContext();

  // BlobまたはURLから表示用ソースを取得
  const fgSrc = useMemo(() => store.foregroundBlob ? URL.createObjectURL(store.foregroundBlob) : store.foregroundUrl, [store.foregroundBlob, store.foregroundUrl]);
  const bgSrc = useMemo(() => store.backgroundBlob ? URL.createObjectURL(store.backgroundBlob) : store.backgroundUrl, [store.backgroundBlob, store.backgroundUrl]);

  // CSS 3D用の計算
  // depth (1〜20mm) をピクセルにマッピング (例: 1mm = 2px)
  const depthPx = store.styleConfig.depth * 2;

  // ホログラムエフェクト用のCSSクラス判定
  const getEffectClass = (effect: string) => {
    switch (effect) {
      case 'hologram': return "mix-blend-overlay opacity-80 bg-gradient-to-tr from-blue-500/30 via-pink-500/30 to-yellow-500/30";
      case 'glitter': return "mix-blend-color-dodge opacity-80 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMDA4wBQLzZAAAAABJRU5ErkJggg==')] bg-repeat"; // 簡易ノイズ
      case 'emission': return "drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]";
      default: return "";
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ perspective: "1000px" }}>
      {/* 簡易的なマウス追従インタラクション用のラッパー */}
      <div 
        className="relative w-48 h-64 sm:w-56 sm:h-72 transition-transform duration-300 ease-out hover:rotate-y-[-10deg] hover:rotate-x-[5deg]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* アクリルブロックの厚み表現（簡易） */}
        <div className="absolute inset-0 border border-white/10 bg-white/5 rounded-lg shadow-2xl backdrop-blur-sm" />

        {/* Background Layer */}
        <div 
           className="absolute inset-0 rounded-lg overflow-hidden flex items-center justify-center"
           style={{ transform: `translateZ(${-depthPx}px)` }}
        >
          {bgSrc ? (
            <img src={bgSrc} alt="Background" className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="w-full h-full border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 text-xs">No Background</div>
          )}
          {/* BG Effect */}
          {store.styleConfig.backgroundEffect !== 'none' && (
             <div className={`absolute inset-0 pointer-events-none ${getEffectClass(store.styleConfig.backgroundEffect)}`} />
          )}
        </div>

        {/* Foreground Layer */}
        <div 
           className="absolute inset-0 rounded-lg flex items-center justify-center"
           style={{ transform: `translateZ(${depthPx}px)` }}
        >
          {fgSrc ? (
            <img src={fgSrc} alt="Foreground" className="w-full h-full object-contain drop-shadow-2xl" />
          ) : (
            <div className="text-white/20 text-xs">No Foreground</div>
          )}
          {/* FG Effect */}
          {store.styleConfig.foregroundEffect !== 'none' && (
             <div className={`absolute inset-0 pointer-events-none rounded-lg ${getEffectClass(store.styleConfig.foregroundEffect)}`} />
          )}
        </div>
      </div>
    </div>
  );
};