import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Upload, Sparkles, Palette, Layers, Check, Loader2, ImagePlus, Wand2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useToast } from "@/app/providers/ToastProvider";
import { useSelectedGallery } from "@/features/galleries/hooks/useSelectedGallery";

// Framework
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import { useUpsertExhibit } from "@/features/exhibits/hooks/useUpsertExhibit";
import { useExhibitEditorStore, EditorStoreContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { ExhibitPreview3D } from "@/features/exhibits/components/ExhibitEditorModal/ExhibitPreview3D";

// Tabs
import { StudioTabCutout } from "./StudioTabCutout";
import { StudioTabBackplate } from "./StudioTabBackplate";
import { StudioTabMaterial } from "./StudioTabMaterial";

type TabKey = "STYLE" | "MATERIAL" | "BACKPLATE";

export function StudioExhibitEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);


  // 初期データの受け取り（RoomDrawerから遷移してきた場合など）
  const initialExhibit = location.state?.exhibit;
  const passedSlotIndex = new URLSearchParams(location.search).get("slot") 
                          ? parseInt(new URLSearchParams(location.search).get("slot")!) 
                          : null;

  // Store Initialization
  const store = useExhibitEditorStore({
    title: initialExhibit?.title || "",
    description: initialExhibit?.description || "",
    foregroundUrl: initialExhibit?.imageForegroundUrl || null,
    backgroundUrl: initialExhibit?.imageBackgroundUrl || null,
    originalUrl: initialExhibit?.imageOriginalUrl || null,
    styleConfig: initialExhibit?.styleConfig || { depth: 5, foregroundEffect: "none", backgroundEffect: "none" },
  });

  const { uploadImageAndGetUrl } = useExhibitImageUpload();
  // 編集中のGalleryID（仮として "me"）
  const { selectedGalleryId } = useSelectedGallery();
 const upsert = useUpsertExhibit(selectedGalleryId || "");

  const [activeTab, setActiveTab] = useState<TabKey>("STYLE");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMsg, setProcessMsg] = useState("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    store.updateState({ originalBlob: file, foregroundBlob: file }); // まずはそのまま配置
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("画像を読み込みました。下の「魔法で切り抜く」を試してみてね！");
  };

  const handleSave = async () => {
    if (!selectedGalleryId) {
      toast.error("保存先のギャラリーが選択されていません");
      return;
    }

    if (!store.foregroundBlob && !store.foregroundUrl) return;
    
    setIsProcessing(true);
    setProcessMsg("アクスタを錬成しています... 💖");

    try {
      let fgUrl = store.foregroundUrl;
      let bgUrl = store.backgroundUrl;
      let origUrl = store.originalUrl;

      if (store.foregroundBlob) fgUrl = await uploadImageAndGetUrl(store.foregroundBlob);
      if (store.backgroundBlob) bgUrl = await uploadImageAndGetUrl(store.backgroundBlob);
      if (store.originalBlob) origUrl = await uploadImageAndGetUrl(store.originalBlob);

      // おもちゃ箱 (slot_index 12以降) に保存。編集中なら元のslot
      const targetSlot = passedSlotIndex !== null ? passedSlotIndex : 12 + Math.floor(Math.random() * 80);

      await upsert.mutateAsync({
        slotIndex: targetSlot,
        body: {
          slotIndex: targetSlot,
          title: store.title || "My アクスタ",
          description: store.description,
          imageOriginalUrl: origUrl || "",
          imageForegroundUrl: fgUrl || "",
          imageBackgroundUrl: bgUrl || "",
          styleConfig: store.styleConfig,
        }
      });

      toast.success("完成！祭壇に戻ります");
      navigate("/app/room");
    } catch (err) {
      console.error(err);
      toast.error("保存に失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  const hasImage = !!(store.foregroundBlob || store.foregroundUrl);

  return (
    <EditorStoreContext.Provider value={store}>
      <div className="absolute inset-0 w-full h-full bg-[#050506] flex flex-col font-sans overflow-hidden">
        
        {/* HEADER */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
          <div className="pointer-events-auto bg-brand-surface/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-glass flex items-center gap-2">
            <Wand2 size={16} className="text-brand-primary" />
            <span className="text-brand-text font-extrabold text-sm tracking-wide">アクスタ錬成所</span>
          </div>
          <button 
            onClick={() => navigate("/app/room")}
            className="pointer-events-auto text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md transition-colors"
          >
            やめる
          </button>
        </div>

        {/* 3D PREVIEW (60%) */}
        <div className="flex-[5.5] sm:flex-[6] relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-bg-soft/20 via-black to-black">
          {hasImage ? (
            <ExhibitPreview3D />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center animate-pulse mb-4">
                <ImagePlus size={48} className="text-brand-text-soft opacity-50" />
              </div>
              <p className="text-brand-text-soft font-bold text-sm tracking-widest uppercase">画像をアップロードしてください</p>
            </div>
          )}

          {/* LOADING OVERLAY */}
          {isProcessing && (
            <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center transition-all animate-in fade-in">
              <Loader2 className="animate-spin text-brand-primary mb-4" size={48} strokeWidth={2} />
              <div className="text-white font-extrabold text-lg tracking-tight animate-pulse bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent text-center px-4">
                {processMsg}
              </div>
            </div>
          )}
        </div>

        {/* DRAWER (40%) */}
        <div className="flex-[4.5] sm:flex-[4] bg-brand-surface/95 backdrop-blur-3xl border-t border-brand-border rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col relative z-20">
          
          {!hasImage ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div>
                <h2 className="text-2xl font-black text-brand-text tracking-tight">推しを召喚しよう！</h2>
                <p className="text-xs font-bold text-brand-text-muted mt-2">1枚の画像から、AIの魔法で<br/>最高のアクスタを作ります。</p>
              </div>
              <label className="w-full max-w-xs cursor-pointer group">
                <div className="w-full rounded-full bg-gradient-to-tr from-brand-primary to-brand-mint py-4 px-8 text-white font-extrabold text-base shadow-lg shadow-brand-primary/30 group-hover:-translate-y-1 group-active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Upload size={20} strokeWidth={2.5} /> 画像を選ぶ
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
              </label>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* TABS */}
              <div className="flex items-center gap-6 px-6 pt-5 pb-2 overflow-x-auto custom-scrollbar border-b border-brand-border">
                {[
                  { id: "STYLE", icon: Sparkles, label: "切り抜き・魔法" },
                  { id: "BACKPLATE", icon: Layers, label: "背景プレート" },
                  { id: "MATERIAL", icon: Palette, label: "素材" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabKey)}
                    className={cn(
                      "flex items-center gap-1.5 pb-2 text-sm font-extrabold transition-all border-b-2 whitespace-nowrap",
                      activeTab === tab.id ? "text-brand-primary border-brand-primary" : "text-brand-text-muted border-transparent hover:text-brand-text"
                    )}
                  >
                    <tab.icon size={16} /> {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === "STYLE" && <StudioTabCutout onStartProcess={(m) => { setProcessMsg(m); setIsProcessing(true); }} onEndProcess={() => setIsProcessing(false)} />}
                {activeTab === "BACKPLATE" && <StudioTabBackplate onStartProcess={(m) => { setProcessMsg(m); setIsProcessing(true); }} onEndProcess={() => setIsProcessing(false)} />}
                {activeTab === "MATERIAL" && <StudioTabMaterial />}
              </div>

              {/* FOOTER */}
              <div className="p-4 border-t border-brand-border bg-brand-surface pb-safe flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <label className="flex items-center gap-1 cursor-pointer text-brand-text-muted hover:text-brand-text transition-colors">
                  <div className="w-10 h-10 rounded-full bg-brand-bg-soft flex items-center justify-center border border-brand-border">
                    <Upload size={16} />
                  </div>
                  <span className="text-[10px] font-bold px-2">選び直す</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>

                <button 
                  onClick={handleSave}
                  className="bg-brand-text text-white px-8 py-3.5 rounded-full text-sm font-extrabold shadow-lg shadow-black/10 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Check size={18} strokeWidth={3} />
                  完成して飾る！
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </EditorStoreContext.Provider>
  );
}