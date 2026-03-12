import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGallery } from "@/features/galleries/api";
import type {
  CreateGalleryReq,
  CreateGalleryRes,
  GuestCreateGalleryRes,
} from "@/features/galleries/api";
import { galleriesKeys } from "./keys";
import { useAuthContext } from "@/features/auth/AuthProvider";

export function useCreateGallery() {
  const qc = useQueryClient();
  const { status, user, guestId } = useAuthContext();
  
  // キャッシュ特定のための識別子
  const identifier = status === "authenticated" ? user?.id : guestId;

  return useMutation<CreateGalleryRes | GuestCreateGalleryRes, unknown, CreateGalleryReq>({
    mutationFn: async (body) => {
      // status に基づいて API モードを決定
      const mode = status === "authenticated" ? "user" : "guest";
      
      // 注意: AppHome で ensureGuestId 済みである前提だが、
      // 念のため status が確定していない状態での実行は防ぐ
      if (status === "idle" || status === "restoring") {
        throw new Error("Auth is not ready");
      }

      return await createGallery(body, mode);
    },
    onSuccess: (created) => {
      if (!identifier) return;

      const rootKey = galleriesKeys.list(status, identifier);

      // 1. ギャラリー一覧のキャッシュを無効化して再取得を促す
      qc.invalidateQueries({ queryKey: rootKey });

      // 2. 作成された詳細データを個別のキャッシュに即時反映（楽観的更新に近いUX）
      const createdData = created as any;
      const createdId = createdData?.id;

      if (createdId) {
        // ゲストの場合は詳細APIのキーは常に "me"、ユーザーの場合は実際の UUID
        const detailId = status === "guest" ? "me" : String(createdId);
        
        qc.setQueryData(
          galleriesKeys.detail(status, identifier, detailId),
          created
        );
      }
    },
  });
}