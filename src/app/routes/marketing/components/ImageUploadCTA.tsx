// src/app/routes/marketing/components/ImageUploadCTA.tsx
import { useCallback } from "react";
import { cn } from "@/shared/utils/cn";

interface ImageUploadCTAProps {
  previewUrl: string | null;
  isLoading: boolean;
  onImageSelect: (file: File) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export function ImageUploadCTA({ previewUrl, isLoading, onImageSelect, onClear, onSubmit }: ImageUploadCTAProps) {
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageSelect(e.target.files[0]);
    }
  }, [onImageSelect]);

  return (
    <div className="w-full max-w-md mx-auto bg-brand-surface/80 backdrop-blur-xl border border-brand-border rounded-3xl p-6 shadow-2xl shadow-brand-primary/10 relative overflow-hidden">
      
      {/* プレビュー表示状態 */}
      {previewUrl ? (
        <div className="space-y-6 animate-fade-in">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-bg-soft border border-brand-border flex items-center justify-center">
            {/* アクスタっぽさを出すためのハイライトエフェクト */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/60 to-transparent z-10 pointer-events-none" />
            <img 
              src={previewUrl} 
              alt="Oshi Preview" 
              className="object-contain w-full h-full drop-shadow-2xl z-0 p-4"
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onSubmit}
              disabled={isLoading}
              className={cn(
                "w-full py-4 rounded-full font-bold text-white transition-all duration-300",
                "bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-90 shadow-lg shadow-brand-accent/30",
                isLoading && "opacity-50 cursor-not-allowed animate-pulse"
              )}
            >
              {isLoading ? "祭壇を準備中..." : "この画像でアクスタを飾る ✨"}
            </button>
            <button
              onClick={onClear}
              disabled={isLoading}
              className="w-full py-3 text-sm font-medium text-brand-text-soft hover:text-brand-text transition-colors"
            >
              別の画像を選ぶ
            </button>
          </div>
        </div>
      ) : (
        /* アップロード待ち状態 */
        <label className="flex flex-col items-center justify-center h-64 w-full border-2 border-dashed border-brand-primary/40 rounded-2xl bg-brand-primary-soft/40 hover:bg-brand-primary-soft/80 transition-all duration-300 cursor-pointer group hover:scale-[1.02]">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-surface shadow-md flex items-center justify-center text-brand-primary group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-brand-text mb-1">推しの画像をえらぶ</p>
              <p className="text-xs text-brand-text-soft font-medium tracking-wide">タップ または ドラッグ＆ドロップ</p>
            </div>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/png, image/jpeg, image/webp" 
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}