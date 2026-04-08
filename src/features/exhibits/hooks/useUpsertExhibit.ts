// src/features/exhibits/hooks/useUpsertExhibit.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertExhibit } from "@/features/exhibits/api";
import type { UpsertExhibitReq, Exhibit } from "@/features/exhibits/api";
import { galleriesKeys } from "@/features/galleries/hooks/keys";
import { useAuthContext } from "@/features/auth/AuthProvider";

export function useUpsertExhibit(galleryId: string) {
  const qc = useQueryClient();
  const {status, user, guestId} = useAuthContext();
  const identifier = status === "authenticated" ? user?.id ?? null: guestId;

  return useMutation<
    Exhibit,
    Error,
    { slotIndex: number; body: UpsertExhibitReq }
  >({
    
    mutationFn: async ({ slotIndex, body }) => {
      return upsertExhibit({ galleryId, slotIndex, body });
    },
    onSuccess: async () => {
      const effectiveId = status === "guest" ? "me" :galleryId;
      // Gallery detail がSSOT（exhibits内包）なので detail を更新
      await qc.invalidateQueries({ queryKey: galleriesKeys.detail(status, identifier, effectiveId) });
    },
  });
}
