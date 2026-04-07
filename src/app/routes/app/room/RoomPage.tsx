// src/app/routes/app/room/RoomPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronDown, Share } from "lucide-react";

import { useGalleriesList, useGalleryDetail } from "@/features/galleries/hooks";
import { useUpsertExhibit, useDeleteExhibit } from "@/features/exhibits/hooks";
import { GalleryDetailPreview3D } from "@/features/exhibits/components/playcanvas/GalleryDetailPreview3D";
import { useToast } from "@/app/providers/ToastProvider";

import { RoomBottomNav } from "./components/RoomBottomNav";
import { RoomDrawer } from "./components/RoomDrawer";
import { GallerySwitcherModal } from "./components/GallerySwitcherModal";
import { GallerySettingsModal } from "@/features/galleries/components/GallerySettingsModal";
import { ShopDrawer } from "./components/ShopDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { ExhibitPreviewModal } from "./components/ExhibitPreviewModal";

import { useSelectedGallery } from "@/features/galleries/hooks/useSelectedGallery";

export function RoomPage() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const[isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const { selectedGalleryId, setSelectedGalleryId } = useSelectedGallery();

  const[switcherOpen, setSwitcherOpen] = useState(false);
  const [settingsGalleryId, setSettingsGalleryId] = useState<string | null>(null);

  const[isShopOpen, setIsShopOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const[checkoutAmount, setCheckoutAmount] = useState(0);
  
  const [previewExhibit, setPreviewExhibit] = useState<any | null>(null);

  const galleriesQuery = useGalleriesList();
  const detailQuery = useGalleryDetail(selectedGalleryId);
  const upsert = useUpsertExhibit(selectedGalleryId || "");
  const remove = useDeleteExhibit(selectedGalleryId || "");

  useEffect(() => {
    if (!selectedGalleryId && galleriesQuery.data && galleriesQuery.data.length > 0) {
      setSelectedGalleryId(galleriesQuery.data[0].id);
    }
  },[galleriesQuery.data, selectedGalleryId]);

  const galleryTitle = useMemo(() => {
    const t = (detailQuery.data as any)?.title;
    return (t && String(t).trim().length > 0 ? String(t) : "Untitled Exhibition");
  }, [detailQuery.data]);

  const altarExhibits = detailQuery.normalizedExhibits ?? new Array(12).fill(null);
  
  // 変数名を「toybox」から「collection」に変更
  const collectionExhibits = useMemo(() => {
    const rawData = detailQuery.data as any;
    const allExhibits = (rawData?.exhibits || []) as any[];
    return allExhibits.filter((ex) => ex && ex.slot_index >= 12);
  }, [detailQuery.data]);

  const allAvailableExhibits = useMemo(() => {
    const altarValid = altarExhibits.filter(e => e);
    return[...altarValid, ...collectionExhibits];
  },[altarExhibits, collectionExhibits]);

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
      toast.error("配置の変更に失敗しました");
    } finally {
      setIsMoving(false);
    }
  };

  const handleMoveToAltar = async (exhibit: any) => {
    const emptySlotIndex = altarExhibits.findIndex(ex => ex === null);
    if (emptySlotIndex === -1) {
      toast.error("展示スペースに空きがありません");
      return;
    }
    await moveExhibit(exhibit, emptySlotIndex);
  };

  const handleMoveToCollection = async (exhibit: any) => {
    const existingIndices = collectionExhibits.map(ex => ex.slot_index);
    let newSlotIndex = 12;
    while (existingIndices.includes(newSlotIndex)) newSlotIndex++;
    await moveExhibit(exhibit, newSlotIndex);
  };

  const handleDelete = async (exhibit: any) => {
    if (!selectedGalleryId) return;
    if (confirm("この作品を完全に削除しますか？")) {
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

  if (galleriesQuery.isLoading) {
    return (
      <div className="h-screen bg-[#050506] flex flex-col items-center justify-center text-white/50">
        <Loader2 className="animate-spin mb-4" size={28} strokeWidth={1.5} />
        <span className="font-light tracking-widest text-xs uppercase">Loading Exhibition...</span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-[#050506] overflow-hidden font-sans select-none">
      <div className="absolute inset-0 z-0">
        <GalleryDetailPreview3D slots={altarExhibits} isPaused={false} />
      </div>

      {/* トップヘッダー：よりエレガントなガラスUIへ */}
      <div className="absolute top-4 sm:top-6 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => setSwitcherOpen(true)}
          className="pointer-events-auto bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 shadow-glass flex items-center gap-3 hover:bg-white/20 transition-all group active:scale-95"
        >
          <h1 className="text-white font-serif tracking-widest text-sm drop-shadow-sm truncate max-w-[150px] sm:max-w-[200px]">
            {galleryTitle}
          </h1>
          <ChevronDown size={14} strokeWidth={1.5} className="text-white/70 group-hover:translate-y-0.5 transition-transform" />
        </button>

        <button 
          onClick={() => setSettingsGalleryId(selectedGalleryId)}
          className="pointer-events-auto bg-white/10 backdrop-blur-xl border border-white/20 text-white p-3.5 rounded-full shadow-glass hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Share size={18} strokeWidth={1.5} />
        </button>
      </div>

      <RoomBottomNav 
        collectionCount={collectionExhibits.length} 
        onOpenDrawer={() => setIsDrawerOpen(true)} 
        onOpenShop={() => setIsShopOpen(true)}
      />

      <RoomDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        altarExhibits={altarExhibits}
        collectionExhibits={collectionExhibits}
        isMoving={isMoving}
        onMoveToAltar={handleMoveToAltar}
        onMoveToCollection={handleMoveToCollection}
        onDelete={handleDelete}
        onNavigateToStudio={() => navigate('/app/studio')}
        onPreview={(ex) => setPreviewExhibit(ex)}
      />

      <ShopDrawer 
        isOpen={isShopOpen} 
        onClose={() => setIsShopOpen(false)} 
        exhibits={allAvailableExhibits}
        onProceedToCheckout={(_, total) => {
          setCheckoutAmount(total);
          setIsShopOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal 
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        totalAmount={checkoutAmount}
      />

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
          navigate(`/app/studio?slot=${ex.slot_index}`, { state: { exhibit: ex } });
        }}
      />
    </div>
  );
}