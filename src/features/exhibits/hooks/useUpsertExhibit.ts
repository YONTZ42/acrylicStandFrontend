// src/features/exhibits/hooks/useUpsertExhibit.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertExhibit, createExhibit } from "@/features/exhibits/api";
import type { UpsertExhibitReq, CreateExhibitReq, Exhibit } from "@/features/exhibits/api";
import { galleriesKeys } from "@/features/galleries/hooks/keys";
import { useAuthContext } from "@/features/auth/AuthProvider";

export function useSaveExhibit(galleryId: string) {
  const qc = useQueryClient();
  const { status, user, guestId } = useAuthContext();
  const identifier = status === "authenticated" ? user?.id ?? null : guestId;

  return useMutation<
    Exhibit,
    Error,
    { slotIndex?: number; body: UpsertExhibitReq | CreateExhibitReq }
  >({
    mutationFn: async ({ slotIndex, body }) => {
      // 0〜11の範囲内であれば PUT (upsert)、それ以外は POST (create)
      if (typeof slotIndex === "number" && slotIndex >= 0 && slotIndex <= 11) {
        return upsertExhibit({ galleryId, slotIndex, body: body as UpsertExhibitReq });
      } else {
        return createExhibit({ galleryId, body: body as CreateExhibitReq });
      }
    },
    onSuccess: async () => {
      const effectiveId = status === "guest" ? "me" : galleryId;
      await qc.invalidateQueries({ queryKey: galleriesKeys.detail(status, identifier, effectiveId) });
    },
  });
}