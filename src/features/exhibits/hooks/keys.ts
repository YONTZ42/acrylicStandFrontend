// src/features/exhibits/hooks/keys.ts
import {type AuthStatus} from "@/features/auth/useAuth";

export const exhibitsKeys = {
  all: ["exhibits"] as const,

  // 認証状態と識別子をルートに挟む
  root: (status: AuthStatus, identifier: string | null) =>
    [...exhibitsKeys.all, { status, identifier }] as const,

  // 特定ギャラリーの展示一覧
  lists: (status: AuthStatus, identifier: string | null, galleryId: string) =>
    [...exhibitsKeys.root(status, identifier), "list", galleryId] as const,

  // 特定のスロット詳細
  detail: (status: AuthStatus, identifier: string | null, galleryId: string, slotIndex: number) =>
    [...exhibitsKeys.root(status, identifier), "detail", galleryId, slotIndex] as const,
};