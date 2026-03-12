import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGallery } from "@/features/galleries/api";
import type { 
  Exhibit, 
  GetGalleryRes, 
  GuestGetGalleryRes 
} from "@/features/galleries/api";
import { galleriesKeys } from "./keys";
import { normalizeSlots } from "@/shared/utils/slot";
import { useAuthContext } from "@/features/auth/AuthProvider";

export function useGalleryDetail(id: string | null | undefined) {
  const { status, user, guestId, isReady } = useAuthContext();

  // 1. キャッシュ分離用の識別子を決定
  const identifier = status === "authenticated" ? user?.id : guestId;

  // 2. APIリソースを特定するためのIDを決定
  // ゲストの場合は常に "me"（自身の唯一のギャラリー）を取得する仕様
  const effectiveId = status === "guest" ? "me" : (id ?? "");

  const q = useQuery<GetGalleryRes | GuestGetGalleryRes | null>({
    // 3. status と identifier を含めたユニークなキーを使用
    queryKey: galleriesKeys.detail(status, identifier ?? "none", effectiveId),
    
    queryFn: async () => {
      if (status === "authenticated") {
        return (await getGallery(effectiveId, "user")) as any;
      } else {
        // ゲストはパスにIDを含まない
        return (await getGallery("", "guest")) as any;
      }
    },

    // 4. 重要: 認証の準備が整い、かつ (ゲストである OR ユーザーでIDがある) 場合のみ実行
    enabled: isReady && (status === "guest" || !!id),
    
    staleTime: 10_000,
    gcTime: 5 * 60_000,
  });

  // 5. 展示スロットの正規化（0〜11の配列に変換）
  const normalizedExhibits = useMemo(() => {
    const data = q.data as any;
    const exhibits = data?.exhibits as Exhibit[] | undefined;
    
    if (!exhibits) return null;
    return normalizeSlots(exhibits);
    
    // データそのものが更新された時、または詳細から一覧へ戻った時の再計算をトリガーにする
  }, [q.dataUpdatedAt]);

  return { 
    ...q, 
    normalizedExhibits 
  };
}