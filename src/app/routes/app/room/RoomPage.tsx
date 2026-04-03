// src/app/routes/app/room/RoomPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronDown, Share } from "lucide-react";

import { useGalleriesList, useGalleryDetail } from "@/features/galleries/hooks";
import { useUpsertExhibit, useDeleteExhibit } from "@/features/exhibits/hooks";
import { GalleryDetailPreview3D } from "@/features/exhibits/components/playcanvas/GalleryDetailPreview3D";
import { useToast } from "@/app/providers/ToastProvider";

// Components
import { RoomBottomNav } from "./components/RoomBottomNav";
import { RoomDrawer } from "./components/RoomDrawer";
import { GallerySwitcherModal } from "./components/GallerySwitcherModal";
import { GallerySettingsModal } from "@/features/galleries/components/GallerySettingsModal";
import { ShopDrawer } from "./components/ShopDrawer";       // ★追加
import { CheckoutModal } from "./components/CheckoutModal"; // ★追加
import { ExhibitPreviewModal } from "./components/ExhibitPreviewModal"; // ★追加

export function RoomPage() {
  const navigate = useNavigate();
  const toast = useToast();
  
  // States
  const[selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const[isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Modal States
  const[switcherOpen, setSwitcherOpen] = useState(false);
  const [settingsGalleryId, setSettingsGalleryId] = useState<string | null>(null);

  // Shop States (★追加)
  const[isShopOpen, setIsShopOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  
  // Preview State (★追加)
  const [previewExhibit, setPreviewExhibit] = useState<any | null>(null);

  // Queries
  const galleriesQuery = useGalleriesList();
  const detailQuery = useGalleryDetail(selectedGalleryId);
  const upsert = useUpsertExhibit(selectedGalleryId || "");
  const remove = useDeleteExhibit(selectedGalleryId || "");

  useEffect(() => {
    if (!selectedGalleryId && galleriesQuery.data && galleriesQuery.data.length > 0) {
      setSelectedGalleryId(galleriesQuery.data[0].id);
    }
  }, [galleriesQuery.data, selectedGalleryId]);

  const galleryTitle = useMemo(() => {
    const t = (detailQuery.data as any)?.title;
    return (t && String(t).trim().length > 0 ? String(t) : "My 祭壇 💖");
  }, [detailQuery.data]);

  const altarExhibits = detailQuery.normalizedExhibits ?? new Array(12).fill(null);
  const toyboxExhibits = useMemo(() => {
    const rawData = detailQuery.data as any;
    const allExhibits = (rawData?.exhibits || []) as any[];
    return allExhibits.filter((ex) => ex && ex.slot_index >= 12);
  }, [detailQuery.data]);

  // 全ての有効なExhibitを一つにまとめる（ショップ用）
  const allAvailableExhibits = useMemo(() => {
    const altarValid = altarExhibits.filter(e => e);
    return[...altarValid, ...toyboxExhibits];
  }, [altarExhibits, toyboxExhibits]);

  // ==========================================
  // 移動ロジック
  // ==========================================
  const moveExhibit = async (exhibit: any, newSlotIndex: number) => {
    if (!selectedGalleryId) return;
    setIsMoving(true);
    try {
      const body = {
        slotIndex: newSlotIndex,
        title: exhibit.title || "",
        description: exhibit.description || "",
        imageOriginalUrl: exhibit.imageOriginalUrl || "",
        imageForegroundUrl: exhibit.imageForegroundUrl || "",
        imageBackgroundUrl: exhibit.imageBackgroundUrl || "",
        styleConfig: exhibit.styleConfig || { depth: 5, foregroundEffect: "none", backgroundEffect: "none" }
      };
      
      await upsert.mutateAsync({ slotIndex: newSlotIndex, body });
      await remove.mutateAsync({ slotIndex: exhibit.slot_index });
    } catch (e) {
      toast.error("移動に失敗しました");
    } finally {
      setIsMoving(false);
    }
  };

  const handleMoveToAltar = async (exhibit: any) => {
    const emptySlotIndex = altarExhibits.findIndex(ex => ex === null);
    if (emptySlotIndex === -1) {
      toast.error("祭壇がいっぱいです！");
      return;
    }
    await moveExhibit(exhibit, emptySlotIndex);
  };

  const handleMoveToToybox = async (exhibit: any) => {
    const existingIndices = toyboxExhibits.map(ex => ex.slot_index);
    let newSlotIndex = 12;
    while (existingIndices.includes(newSlotIndex)) newSlotIndex++;
    await moveExhibit(exhibit, newSlotIndex);
  };

  const handleDelete = async (exhibit: any) => {
    if (!selectedGalleryId) return;
    if (confirm("このアクスタを完全に削除しますか？")) {
      setIsMoving(true);
      try {
        await remove.mutateAsync({ slotIndex: exhibit.slot_index });
        toast.success("削除しました");
      } catch (e) {
        toast.error("削除に失敗しました");
      } finally {
        setIsMoving(false);
      }
    }
  };

  // ==========================================
  // Render
  // ==========================================
  if (galleriesQuery.isLoading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-brand-primary">
        <Loader2 className="animate-spin mb-2" size={32} />
        <span className="font-bold text-sm tracking-widest">Loading Room...</span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-[#050506] overflow-hidden font-sans select-none">
      <div className="absolute inset-0 z-0">
        <GalleryDetailPreview3D slots={altarExhibits} isPaused={false} />
      </div>

      <div className="absolute top-4 sm:top-6 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => setSwitcherOpen(true)}
          className="pointer-events-auto bg-brand-surface/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/50 shadow-glass flex items-center gap-2 hover:bg-white transition-colors group active:scale-95"
        >
          <h1 className="text-brand-text font-extrabold tracking-tight text-sm drop-shadow-sm truncate max-w-[150px] sm:max-w-[200px]">
            {galleryTitle}
          </h1>
          <ChevronDown size={16} strokeWidth={3} className="text-brand-primary group-hover:translate-y-0.5 transition-transform" />
        </button>

        <button 
          onClick={() => setSettingsGalleryId(selectedGalleryId)}
          className="pointer-events-auto bg-gradient-to-tr from-brand-primary to-brand-accent text-white p-3 rounded-full shadow-[0_0_15px_rgba(167,139,250,0.5)] hover:scale-105 active:scale-95 transition-transform"
        >
          <Share size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* ボトムナビ: ★ onOpenShop を追加 */}
      <RoomBottomNav 
        toyboxCount={toyboxExhibits.length} 
        onOpenDrawer={() => setIsDrawerOpen(true)} 
        onOpenShop={() => setIsShopOpen(true)}
      />

      <RoomDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        altarExhibits={altarExhibits}
        toyboxExhibits={toyboxExhibits}
        isMoving={isMoving}
        onMoveToAltar={handleMoveToAltar}
        onMoveToToybox={handleMoveToToybox}
        onDelete={handleDelete}
        onNavigateToStudio={() => navigate('/app/studio')}
        onPreview={(ex) => setPreviewExhibit(ex)} // ★追加
        />


      {/* ショップ用ドロワー ★追加 */}
      <ShopDrawer 
        isOpen={isShopOpen} 
        onClose={() => setIsShopOpen(false)} 
        exhibits={allAvailableExhibits}
        onProceedToCheckout={(cartItems, total) => {
          setCheckoutAmount(total);
          setIsShopOpen(false); // ドロワーを閉じて
          setIsCheckoutOpen(true); // 決済モーダルを開く
        }}
      />

      {/* 決済・住所入力モーダル ★追加 */}
      <CheckoutModal 
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        totalAmount={checkoutAmount}
      />


    {/* 5. モーダル群 */}
      <GallerySwitcherModal
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        galleries={galleriesQuery.data ||[]}
        selectedId={selectedGalleryId}
        onSelect={(id) => setSelectedGalleryId(id)}
        onOpenSettings={(id) => {
          setSwitcherOpen(false);
          setSettingsGalleryId(id);
        }}
      />

      <GallerySettingsModal
        open={!!settingsGalleryId}
        onClose={() => setSettingsGalleryId(null)}
        galleryId={settingsGalleryId}
      />
    <ExhibitPreviewModal
        key={previewExhibit?.id || previewExhibit?.slot_index || "preview"}
        exhibit={previewExhibit}
        onClose={() => setPreviewExhibit(null)}
        onEdit={(ex) => {
          setPreviewExhibit(null);
          // 対象の slot_index (またはid) を付与して Studio に遷移
          navigate(`/app/studio?slot=${ex.slotIndex}`, { state: { exhibit: ex } });
        }}
      />
  
    </div>
  );
}
