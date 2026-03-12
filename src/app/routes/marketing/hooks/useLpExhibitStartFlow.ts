import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import { useCreateGallery } from "@/features/galleries/hooks/useCreateGallery";
import { listGalleries } from "@/features/galleries/api";
import { upsertExhibit } from "@/features/exhibits/api";

export function useLpExhibitStartFlow() {
  const navigate = useNavigate();
  const { ensureGuestId, status } = useAuthContext();
  const { uploadImageAndGetUrl, isUploading } = useExhibitImageUpload();
  const { mutateAsync: createGalleryAsync } = useCreateGallery();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // ImagePicker に渡すための URL 状態
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);

  const startFlow = useCallback(() => {
    if (status === "authenticated") {
      navigate("/app", { replace: true });
    } else {
      setShowPicker(true);
    }
  }, [status, navigate]);

  // 画像確定後の最終処理（Gallery作成 -> Exhibit作成 -> 遷移）
  const finalizeExhibition = useCallback(async () => {
    // どちらかの画像がない場合は何もしない（通常は編集完了時に呼ばれる）
    if (!originalUrl) return;

    setIsProcessing(true);
    setError(null);
    setShowPicker(false);

    try {
      await ensureGuestId();

      const galleries = await listGalleries("guest");
      const anyData = galleries as any;
      const existingGalleries = Array.isArray(anyData) ? anyData : (anyData?.results ?? []);

      let targetId: string;
      let nextSlotIndex = 0;

      if (anyData) {
        const gallery = anyData;
        targetId = gallery.id;
        const occupiedSlots = new Set((gallery.exhibits ?? []).map((e: any) => e.slotIndex));
        for (let i = 0; i < 12; i++) {
          if (!occupiedSlots.has(i)) {
            nextSlotIndex = i;
            break;
          }
        }
      } else {
        const newGallery = await createGalleryAsync({ title: "My Museum", isPublic: false });
        targetId = newGallery.id;
      }

      // 最終的な Exhibit 保存（Original と Cutout 両方をセット）
      await upsertExhibit({
        galleryId: targetId,
        slotIndex: nextSlotIndex,
        body: {
          slotIndex: nextSlotIndex,
          title: `Memory #${nextSlotIndex + 1}`,
          imageOriginalUrl: originalUrl,
          imageCutoutPngUrl: cutoutUrl, // 切り抜きがあれば保存
        } as any,
      });

      navigate("/app", {
        state: { initialTab: "detail", initialGalleryId: targetId },
        replace: true,
      });
    } catch (e: any) {
      console.error(e);
      setError("博物館の準備中にエラーが発生しました。");
      setIsProcessing(false);
    }
  }, [originalUrl, cutoutUrl, ensureGuestId, createGalleryAsync, navigate]);

  return {
    startFlow,
    showPicker,
    setShowPicker,
    isLoading: isProcessing || isUploading,
    error,
    status,
    // ImagePicker 用の Props
    imageProps: {
      imageOriginalUrl: originalUrl,
      imageCutoutPngUrl: cutoutUrl,
      onOriginalUploaded: setOriginalUrl,
      onCutoutUploaded: (url: string) => {
        setCutoutUrl(url);
        // 切り抜きまで完了したら自動で最終処理へ進むロジックにする場合
        // （あるいはUI側に「この画像で決定」ボタンを置く）
      },
    },
    finalizeExhibition, // 手動決定用
  };
}