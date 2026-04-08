// src/app/routes/app/studio/components/StudioExhibitEditor.tsx
import React, { useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Upload, Scissors, Layers, Box, Check, Loader2, ImagePlus, PenTool } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useToast } from "@/app/providers/ToastProvider";

import { useSelectedGallery } from "@/features/galleries/hooks/useSelectedGallery";
import { useGalleryDetail } from "@/features/galleries/hooks/useGalleryDetail"; // ★ 追加
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import { useUpsertExhibit } from "@/features/exhibits/hooks/useUpsertExhibit";
import { useExhibitEditorStore, EditorStoreContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { ExhibitPreview3D } from "@/features/exhibits/components/ExhibitEditorModal/ExhibitPreview3D";

import { StudioTabCutout } from "./StudioTabCutout";
import { StudioTabBackplate } from "./StudioTabBackplate";
import { StudioTabMaterial } from "./StudioTabMaterial";

type TabKey = "STYLE" | "BACKPLATE" | "MATERIAL";

export function StudioExhibitEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slotIndex } = useParams<{ slotIndex?: string }>(); // ★ 追加
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialExhibit = location.state?.exhibit;
  const passedSlotIndex = slotIndex ? parseInt(slotIndex, 10) : null;

  const store = useExhibitEditorStore({
    title: initialExhibit?.title || "",
    description: initialExhibit?.description || "",
    foregroundUrl: initialExhibit?.imageForegroundUrl || null,
    backgroundUrl: initialExhibit?.imageBackgroundUrl || null,
    originalUrl: initialExhibit?.imageOriginalUrl || null,
    styleConfig: initialExhibit?.styleConfig || { depth: 5, foregroundEffect: "none", backgroundEffect: "none" },
  });

  const { uploadImageAndGetUrl } = useExhibitImageUpload();
  const { selectedGalleryId } = useSelectedGallery();
  const detailQuery = useGalleryDetail(selectedGalleryId); // ★ 追加
  const upsert = useUpsertExhibit(selectedGalleryId || "");

  const [activeTab, setActiveTab] = useState<TabKey>("STYLE");
  const [isProcessing, setIsProcessing] = useState(false);
  const[processMsg, setProcessMsg] = useState("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    store.updateState({ originalBlob: file, foregroundBlob: file });
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("Image uploaded. Ready to edit.");
  };

  const handleSave = async () => {
    if (!selectedGalleryId) {
      toast.error("Exhibition not selected.");
      return;
    }
    if (!store.foregroundBlob && !store.foregroundUrl) return;
    
    setIsProcessing(true);
    setProcessMsg("Saving artwork...");

    try {
      // ★ 保存対象のスロットを決定する
      let targetSlot = passedSlotIndex;
      
      // 新規作成(空)の場合は空いているスロットを探す
      if (targetSlot === null || isNaN(targetSlot)) {
        const normalizedExhibits = detailQuery.normalizedExhibits ?? new Array(12).fill(null);
        targetSlot = normalizedExhibits.findIndex(ex => ex === null);
        
        // 0〜11がすべて埋まっている場合
        if (targetSlot === -1) {
          toast.error("新しい棚を作ってください"); // 要件通りのエラーメッセージ
          setIsProcessing(false);
          return;
        }
      }

      let fgUrl = store.foregroundUrl;
      let bgUrl = store.backgroundUrl;
      let origUrl = store.originalUrl;

      if (store.foregroundBlob) fgUrl = await uploadImageAndGetUrl(store.foregroundBlob);
      if (store.backgroundBlob) bgUrl = await uploadImageAndGetUrl(store.backgroundBlob);
      if (store.originalBlob) origUrl = await uploadImageAndGetUrl(store.originalBlob);

      await upsert.mutateAsync({
        slotIndex: targetSlot,
        body: {
          slotIndex: targetSlot,
          title: store.title || "Untitled",
          description: store.description,
          imageOriginalUrl: origUrl || "",
          imageForegroundUrl: fgUrl || "",
          imageBackgroundUrl: bgUrl || "",
          styleConfig: store.styleConfig,
        }
      });

      toast.success("Saved successfully.");
      navigate("/app/room");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save.");
    } finally {
      setIsProcessing(false);
    }
  };

  const hasImage = !!(store.foregroundBlob || store.foregroundUrl);

  return (
    <EditorStoreContext.Provider value={store}>
      <div className="absolute inset-0 w-full h-full bg-brand-bg flex flex-col font-sans overflow-hidden min-h-0">
        
        {/* HEADER */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
          <div className="pointer-events-auto bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white shadow-sm flex items-center gap-2">
            <PenTool size={16} strokeWidth={1.5} className="text-brand-primary" />
            <span className="text-brand-text font-serif text-sm tracking-widest uppercase">
              {passedSlotIndex !== null ? `Edit Slot ${passedSlotIndex + 1}` : "Studio"}
            </span>
          </div>
          <button 
            onClick={() => navigate("/app/room")}
            className="pointer-events-auto text-[10px] font-light tracking-widest uppercase bg-white/60 hover:bg-white text-brand-text border border-white px-5 py-2.5 rounded-full backdrop-blur-md transition-colors shadow-sm"
          >
            Cancel
          </button>
        </div>

        {/* 3D PREVIEW (60%) */}
        <div className="flex-[5.5] sm:flex-[6] relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-brand-bg-soft to-[#E5E0D8] min-h-0">
          {hasImage ? (
            <ExhibitPreview3D />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-brand-border">
                <ImagePlus size={32} strokeWidth={1} className="text-brand-text-soft" />
              </div>
              <p className="text-brand-text-muted font-light text-xs tracking-widest uppercase">Please upload an image</p>
            </div>
          )}

          {/* LOADING OVERLAY */}
          {isProcessing && (
            <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center transition-all animate-in fade-in">
              <Loader2 className="animate-spin text-brand-primary mb-6" size={32} strokeWidth={1.5} />
              <div className="text-brand-text font-serif text-sm tracking-widest uppercase animate-pulse">
                {processMsg}
              </div>
            </div>
          )}
        </div>

        {/* DRAWER (40%) */}
        <div className="flex-[4.5] sm:flex-[4] bg-white border-t border-brand-border rounded-t-3xl shadow-elegant flex flex-col relative z-20 min-h-0">
          
          {!hasImage ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 min-h-0">
              <div>
                <h2 className="text-xl font-serif text-brand-text tracking-wide">Create Artwork</h2>
                <p className="text-[11px] font-light text-brand-text-muted mt-3 tracking-wider leading-relaxed">
                  Upload an image to start creating<br/>your sophisticated acrylic stand.
                </p>
              </div>
              <label className="w-full max-w-xs cursor-pointer group">
                <div className="w-full rounded-full border border-brand-primary text-brand-primary py-3.5 px-8 font-light text-xs tracking-widest uppercase hover:bg-brand-primary-soft transition-colors flex items-center justify-center gap-3">
                  <Upload size={16} strokeWidth={1.5} /> Select Image
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
              </label>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
              
              <div className="flex items-center gap-8 px-6 pt-6 pb-3 overflow-x-auto custom-scrollbar border-b border-brand-border shrink-0">
                {[
                  { id: "STYLE", icon: Scissors, label: "Cutout" },
                  { id: "BACKPLATE", icon: Layers, label: "Backplate" },
                  { id: "MATERIAL", icon: Box, label: "Material" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabKey)}
                    className={cn(
                      "flex items-center gap-2 pb-3 text-[11px] font-light tracking-widest uppercase transition-all border-b px-1 whitespace-nowrap",
                      activeTab === tab.id ? "text-brand-primary border-brand-primary" : "text-brand-text-muted border-transparent hover:text-brand-text"
                    )}
                  >
                    <tab.icon size={14} strokeWidth={1.5} /> {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-brand-bg/30 min-h-0">
                {activeTab === "STYLE" && <StudioTabCutout onStartProcess={(m) => { setProcessMsg(m); setIsProcessing(true); }} onEndProcess={() => setIsProcessing(false)} />}
                {activeTab === "BACKPLATE" && <StudioTabBackplate onStartProcess={(m) => { setProcessMsg(m); setIsProcessing(true); }} onEndProcess={() => setIsProcessing(false)} />}
                {activeTab === "MATERIAL" && <StudioTabMaterial />}
              </div>

              <div className="p-5 border-t border-brand-border bg-white pb-safe flex justify-between items-center shrink-0">
                <label className="flex items-center gap-3 cursor-pointer text-brand-text-muted hover:text-brand-text transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center border border-brand-border group-hover:border-brand-primary/50 transition-colors">
                    <Upload size={16} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-light tracking-widest uppercase hidden sm:block">Re-upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>

                <button 
                  onClick={handleSave}
                  className="bg-brand-secondary text-white px-8 py-3.5 rounded-full text-xs font-light tracking-widest uppercase shadow-md hover:bg-black active:scale-95 transition-all flex items-center gap-2"
                >
                  <Check size={16} strokeWidth={1.5} />
                  Complete
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </EditorStoreContext.Provider>
  );
}