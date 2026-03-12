// src/shared/auth/storage.ts

export const AUTH_STORAGE_KEYS = {
  guestId: "guest_id",
  accessToken: "access_token",
  refreshToken: "refresh_token",

  // ゲスト→ユーザー移行を一度だけ走らせたい時に使う（任意）
  guestMigrationDone: "guest_migration_done",
} as const;

export function readGuestId(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.guestId);
  } catch {
    return null;
  }
}

export function writeGuestId(guestId: string): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.guestId, guestId);
    // guestが再発行されたら移行フラグはリセット（任意）
    localStorage.removeItem(AUTH_STORAGE_KEYS.guestMigrationDone);
  } catch {
    // ignore
  }
}

export function clearGuestId(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.guestId);
    localStorage.removeItem(AUTH_STORAGE_KEYS.guestMigrationDone);
  } catch {
    // ignore
  }
}

export function readAccessToken(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
  } catch {
    return null;
  }
}

export function writeTokens(access: string, refresh: string): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, access);
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, refresh);
  } catch {
    // ignore
  }
}

export function readRefreshToken(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
    localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  } catch {
    // ignore
  }
}

export function readGuestMigrationDone(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.guestMigrationDone) === "1";
  } catch {
    return false;
  }
}

export function writeGuestMigrationDone(): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.guestMigrationDone, "1");
  } catch {
    // ignore
  }
}