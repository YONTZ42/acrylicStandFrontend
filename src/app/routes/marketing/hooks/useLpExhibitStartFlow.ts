// src/app/routes/marketing/hooks/useLpExhibitStartFlow.ts
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import { http } from "@/shared/api/http";

export function useLpExhibitStartFlow() {
  const navigate = useNavigate();
  const { ensureGuestId, status } = useAuthContext();
  const { uploadImageAndGetUrl, isUploading } = useExhibitImageUpload();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 選択された画像ファイルとプレビューURL
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const finalizeExhibition = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Guest IDの確保（未発行なら発行し、ストレージに保存される）
      await ensureGuestId();

      // 2. 画像のアップロード（S3等へPUTし、参照URLを取得）
      const uploadedUrl = await uploadImageAndGetUrl(selectedFile);

      // 3. ギャラリーの確保（Guest仕様v5: 既存があれば返し、無ければ作る idempotent な POST）
      const gallery = (await http.post("/api/guest/gallery/")) as any;
      const targetId = gallery.id;

      // 4. 空きスロットの計算 (0〜11のどこか)
      let nextSlotIndex = 0;
      const occupiedSlots = new Set((gallery.exhibits ?? []).map((e: any) => e.slot_index ?? e.slotIndex));
      for (let i = 0; i < 12; i++) {
        if (!occupiedSlots.has(i)) {
          nextSlotIndex = i;
          break;
        }
      }

      // 5. アクスタ(Exhibit)の作成 (指定スロットへの PUT upsert)
      await http.put(`/api/galleries/${targetId}/exhibits/${nextSlotIndex}/`, {
        slotIndex: nextSlotIndex,
        title: "尊い概念",
        imageOriginalUrl:uploadedUrl,
        imageForegroundUrl: uploadedUrl, // 透過済み/前景用画像として保存
        imageBackgroundUrl: "",
        styleConfig: {                   // ★ 追加: 必須のスタイル初期値をセット
          depth: 5, 
          foregroundEffect: "none", 
          backgroundEffect: "none"
        },

      });

      // 6. 新しいルーティング設計に従い、GalleryWorkspacePageへ遷移
      navigate(`/app/galleries/${targetId}`, { replace: true });

    } catch (e: any) {
      console.error(e);
      setError("祭壇の準備中にエラーが発生しました。");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, ensureGuestId, uploadImageAndGetUrl, navigate]);

  return {
    status,
    error,
    isLoading: isProcessing || isUploading,
    selectedFile,
    previewUrl,
    handleImageSelect,
    clearSelection,
    finalizeExhibition,
  };
}