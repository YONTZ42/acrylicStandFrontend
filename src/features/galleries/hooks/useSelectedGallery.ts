import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/features/auth/AuthProvider";

const selectedGalleryKeys = {
  all: ["selected-gallery"] as const,
  current: (scope: string) => [...selectedGalleryKeys.all, scope] as const,
};

function buildScope(status: string, userId?: string | null, guestId?: string | null) {
  if (status === "authenticated" && userId) {
    return `user:${userId}`;
  }
  if (guestId) {
    return `guest:${guestId}`;
  }
  return "anonymous";
}

export function useSelectedGallery() {
  const queryClient = useQueryClient();
  const { status, user, guestId, isReady } = useAuthContext();

  const scope = buildScope(status, user?.id ?? null, guestId ?? null);
  const queryKey = selectedGalleryKeys.current(scope);

  const query = useQuery<string | null>({
    queryKey,
    queryFn: async () => null,
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: isReady,
  });

  const setSelectedGalleryId = useCallback(
    (galleryId: string | null) => {
      queryClient.setQueryData(queryKey, galleryId);
    },
    [queryClient, queryKey]
  );

  const clearSelectedGalleryId = useCallback(() => {
    queryClient.setQueryData(queryKey, null);
  }, [queryClient, queryKey]);

  return {
    selectedGalleryId: query.data ?? null,
    setSelectedGalleryId,
    clearSelectedGalleryId,
    isReady,
  };
}

// user typo 対応の別名
export const useSelectedGalley = useSelectedGallery;