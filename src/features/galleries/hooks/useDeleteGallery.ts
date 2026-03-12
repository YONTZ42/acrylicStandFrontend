import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGallery } from "@/features/galleries/api";
import { galleriesKeys } from "./keys";
import { useAuthContext } from "@/features/auth/AuthProvider";

export function useDeleteGallery() {
  const qc = useQueryClient();
  const { status, user, guestId } = useAuthContext();
  const identifier = status === "authenticated" ? user?.id : guestId;

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const mode = status === "authenticated" ? "user" : "guest";
      await deleteGallery(id, mode);
    },
    onSuccess: (_, vars) => {
      const effectiveId = status === "guest" ? "me" : vars.id;
      // キャッシュから削除
      qc.removeQueries({ queryKey: galleriesKeys.detail(status, identifier ?? "none", effectiveId) });
      qc.invalidateQueries({ queryKey: galleriesKeys.list(status, identifier ?? "none") });
    },
  });
}