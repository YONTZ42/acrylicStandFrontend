// src/app/routes/app/room/RoomPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronDown, Share } from "lucide-react";

import { useGalleriesList, useGalleryDetail } from "@/features/galleries/hooks";
import { GalleryDetailPreview3D } from "@/features/exhibits/components/playcanvas/GalleryDetailPreview3D";

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
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { selectedGalleryId, setSelectedGalleryId } = useSelectedGallery();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [settingsGalleryId, setSettingsGalleryId] = useState<string | null>(null);

  const [isShopOpen, setIsShopOpen] = useState(false);
  const[isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  
  const [previewExhibit, setPreviewExhibit] = useState<any | null>(null);

  const galleriesQuery = useGalleriesList();
  const detailQuery = useGalleryDetail(selectedGalleryId);

  useEffect(() => {
    if (!selectedGalleryId && galleriesQuery.data && galleriesQuery.data.length > 0) {
      setSelectedGalleryId(galleriesQuery.data[0].id);
    }
  }, [galleriesQuery.data, selectedGalleryId]);

  const galleryTitle = useMemo(() => {
    const t = (detailQuery.data as any)?.title;
    return (t && String(t).trim().length > 0 ? String(t) : "Untitled Exhibition");
  },[detailQuery.data]);

  // 0〜11スロット（祭壇用）の正規化リスト
  const altarExhibits = detailQuery.normalizedExhibits ?? new Array(12).fill(null);

  // Shopなどに渡すための存在する全Exhibit（0〜11の有効なもののみ）
  const allAvailableExhibits = useMemo(() => {
    return altarExhibits.filter(e => e);
  }, [altarExhibits]);

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
      <div className="absolute inset-0 z-0 bg-[#050506]">
        <GalleryDetailPreview3D slots={altarExhibits} isPaused={false} />
      </div>

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
        collectionCount={0} 
        onOpenDrawer={() => setIsDrawerOpen(true)} 
        onOpenShop={() => setIsShopOpen(true)}
      />

      <RoomDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        altarExhibits={altarExhibits}
        // ★ slotIndex を受け取って URL クエリにする
        onNavigateToStudio={(slotIndex) => {
          if (typeof slotIndex === "number") {
             navigate(`/app/studio?slot=${slotIndex}`);
          } else {
             navigate('/app/studio');
          }
        }}
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
          // 既存データの編集なので、slot_index をクエリに乗せて遷移
          navigate(`/app/studio?slot=${ex.slot_index}`, { state: { exhibit: ex } });
        }}
      />
    </div>
  );
}