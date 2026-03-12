// src/features/exhibits/hooks/useDeleteExhibit.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExhibit } from "@/features/exhibits/api";
import { galleriesKeys } from "@/features/galleries/hooks/keys";
import { useAuthContext } from "@/features/auth/AuthProvider";

export function useDeleteExhibit(galleryId: string) {
  const qc = useQueryClient();
  const {status, user, guestId} = useAuthContext();
  const identifier = status === "authenticated" ? user?.id ?? null : guestId;
  return useMutation<void, Error, { slotIndex: number }>({
    mutationFn: async ({ slotIndex }) => {
      await deleteExhibit({ galleryId, slotIndex });
    },
    onSuccess: async () => {
      const effectiveId = status === "guest" ? "me" :galleryId;

      await qc.invalidateQueries({ queryKey: galleriesKeys.detail(status, identifier, effectiveId) });
    },
  });
}
