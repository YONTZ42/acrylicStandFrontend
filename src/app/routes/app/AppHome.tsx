import React, {  useCallback, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { AppFooterTabs, type AppTabKey } from "@/app/layouts/AppFooterTabs";
import { GalleryLibraryTab } from "@/app/routes/app/tabs/GalleryLibraryTab";
import { GalleryDetailTab } from "@/app/routes/app/tabs/GalleryDetailTab";
import {cn} from "@/shared/utils/cn";
type NavState = {
  initialTab?: AppTabKey;
  initialGalleryId?: string;
};

export function AppHome(): React.ReactElement {
  const { isReady } = useAuthContext();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<AppTabKey>("library");
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | undefined>(undefined);

  // 1. 外部（LP等）からの遷移時のステート復元
  useEffect(() => {
    const st = (location.state ?? null) as NavState | null;
    if (!st) return;
    if (st.initialGalleryId) setSelectedGalleryId(st.initialGalleryId);
    if (st.initialTab) setActiveTab(st.initialTab);
  }, [location.key, location.state]);

  // 2. ギャラリー選択時のアクション
  const openDetail = useCallback((id: string) => {
    setSelectedGalleryId(id);
    setActiveTab("detail");
  }, []);

  
  // 4. 認証初期化待ち
  if (!isReady) {
    return <div className="min-h-dvh bg-black" />; // ちらつき防止の黒画面
  }

return (
    <div className="min-h-dvh bg-black text-white">
      <main className="pb-20">
        {/* --- Library Tab (常駐) --- */}
        <div className={cn(activeTab !== "library" && "hidden")}>
          <GalleryLibraryTab 
            onSelectGalleryId={openDetail} 
          />
        </div>

        {/* --- Detail Tab (常駐) --- */}
        <div className={cn(activeTab !== "detail" && "hidden")}>
          {/* idがない状態でPlayCanvasが動かないよう、内部でガードは必要 */}
          <GalleryDetailTab 
            galleryId={selectedGalleryId} 
            onBack={() => setActiveTab("library")}
          />
        </div>
      </main>

      <AppFooterTabs
        active={activeTab}
        onChange={setActiveTab}
        detailEnabled={!!selectedGalleryId}
      />
    </div>
  );
}