// src/features/galleries/hooks/usePublicGallery.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicGallery } from "@/features/galleries/api";
import type { GetPublicGalleryRes } from "@/features/galleries/api";
import { galleriesKeys } from "./keys";
import type { Exhibit } from "@/features/galleries/api";
import { normalizeSlots } from "@/shared/utils/slot";


export function usePublicGallery(slug: string | null | undefined) {
  const enabled = !!slug && slug.length > 0;

  const q =  useQuery<GetPublicGalleryRes | null>({
    queryKey: enabled ? galleriesKeys.publicBySlug(String(slug)) : galleriesKeys.publicBySlug(""),
    queryFn: enabled? 
    async () => getPublicGallery(String(slug)) : undefined,
    enabled,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
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
