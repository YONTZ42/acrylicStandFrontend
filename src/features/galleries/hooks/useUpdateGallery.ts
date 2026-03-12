import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchGallery, type PatchGalleryReq } from "@/features/galleries/api";
import { galleriesKeys } from "./keys";
import { useAuthContext } from "@/features/auth/AuthProvider";

export function useUpdateGallery() {
  const qc = useQueryClient();
  const { status, user, guestId } = useAuthContext();
  const identifier = status === "authenticated" ? user?.id : guestId;

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: PatchGalleryReq }) => {
      const mode = status === "authenticated" ? "user" : "guest";
      return await patchGallery(id, body, mode);
    },
    onSuccess: (updated, vars) => {
      const effectiveId = status === "guest" ? "me" : vars.id;
      // 特定の詳細キャッシュを更新
      qc.setQueryData(galleriesKeys.detail(status, identifier ?? "none", effectiveId), updated);
      // リストを無効化
      qc.invalidateQueries({ queryKey: galleriesKeys.list(status, identifier ?? "none") });
    },
  });
}