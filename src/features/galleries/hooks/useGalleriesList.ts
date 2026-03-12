import { useQuery } from "@tanstack/react-query";
import { listGalleries } from "@/features/galleries/api";
import { galleriesKeys } from "./keys";
import { useAuthContext } from "@/features/auth/AuthProvider";

export function useGalleriesList() {
  const { status, user, guestId, isReady } = useAuthContext();
  const identifier = status === "authenticated" ? user?.id : guestId;

  return useQuery({
    queryKey: galleriesKeys.list(status, identifier ?? "none"),
    queryFn: async () => {
      console.log("status: ", status);

      // status に基づいて API モードを確定
      const mode = status === "authenticated" ? "user" : "guest";
      try {
        const data = await listGalleries(mode);
        // data の正規化（以前のロジックを流用）
        const anyData = data as any;
        if (!anyData) return [];
        if (Array.isArray(anyData)) return anyData;
        if (Array.isArray(anyData.results)) return anyData.results;
        if (typeof anyData === "object" && anyData.id) return [anyData]; 
        return [];
      } catch (e: any) {
        if (e?.status === 404 && mode === "guest") return []; // ゲストで未作成時は空配列
        throw e;
      }
    },
    // status が idle や restoring の間は実行しない
    enabled: isReady && !!identifier,
  });
}