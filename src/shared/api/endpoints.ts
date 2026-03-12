// src/shared/api/endpoints.ts
export const API_ENDPOINTS = {
  auth: {
    guest: "/api/auth/guest/",
  },
  galleries: {
    listCreate: "/api/galleries/",
    detail: (id: string | number) => `/api/galleries/${id}/`,
    publicBySlug: (slug: string) => `/api/galleries/g/${slug}/`,

    // ✅ 追加：Guest は「1ゲスト=1ギャラリー」単一エンドポイント
    guestSingleton: "/api/guest/gallery/",
  },
  exhibits: {
    // NOTE: UIはPUT upsert中心（仕様ルール）
    upsert: (galleryId: string | number, slotIndex: number) =>
      `/api/galleries/${galleryId}/exhibits/${slotIndex}/`,
    remove: (galleryId: string | number, slotIndex: number) =>
      `/api/galleries/${galleryId}/exhibits/${slotIndex}/`,
    // optional legacy:
    create: (galleryId: string | number) => `/api/galleries/${galleryId}/exhibits/`,
  },
} as const;
