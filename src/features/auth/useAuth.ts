// src/features/auth/useAuth.ts
import { useCallback, useEffect, useState, useRef } from "react";
import type { components } from "@/shared/types/fromBackend/schema";
import {
  issueGuestId,
  fetchMe,
  loginWithPassword,

} from "@/features/auth/api";
import {
  readGuestId,
  writeGuestId,
  clearGuestId,
  readAccessToken,
  writeTokens,
  clearTokens,
  //readGuestMigrationDone,
  writeGuestMigrationDone,
} from "@/shared/auth/storage";

import { loginWithGoogle } from "@/features/auth/api";


type User = components["schemas"]["User"];

export type AuthStatus = "idle" | "restoring" | "authenticated" | "guest";

export type AuthState = {
  user: User | null;
  guestId: string | null;
  status: AuthStatus;
  /** 初期化（guest復元 + user復元）が完了したか */
  isReady: boolean;
  loginWithGoogle: (idToken: string) => Promise<void>;

  ensureGuestId: () => Promise<string>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestIdState] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const isInitializing = useRef(false);



  const ensureGuestId = useCallback(async () => {
    // userログイン中でも “移行目的でguestId保持” はあり得るので、
    // ここは「無ければ発行」だけにする（混在禁止で空文字返し、はやめる）
    const existing = readGuestId();
    if (existing) {
      setGuestIdState(existing);
      return existing;
    }
    const res = await issueGuestId();
    const newId = res.guestId;
    writeGuestId(newId);
    setGuestIdState(newId);
    return newId;
  }, []);

  const initialize = useCallback(async () => {
    if (isInitializing.current) return;
    isInitializing.current = true;
    setStatus("restoring");

    try {
      const token = readAccessToken();
      if (token) {
        try {
          const me = await fetchMe();
          setUser(me);
          setStatus("authenticated");
          return;
        }catch(e){
          clearTokens();
        }
      }
      await ensureGuestId();
      setStatus("guest");
    } catch(error){
      console.error("Auth initialization failed", error);
      setStatus("guest");
    } finally {
      isInitializing.current = false;
    }   
  }, [ensureGuestId]);

  useEffect(() => {
    initialize();
  },[initialize])
  
  /*
  const tryMigrateGuest = useCallback(async () => {
    // userがいる時だけ移行を試す
    if (!user) return;

    const gid = readGuestId();
    if (!gid) return;

    // 一度成功してたら再実行しない（任意）
    if (readGuestMigrationDone()) return;

    try {
      writeGuestMigrationDone();
      // ✅ 移行が成功したら guestId を破棄（以後、意図せずguest制約APIに当たらない）
      clearGuestId();
      setGuestIdState(null);
      //await migrateGuestToUser();
    } catch (e: any) {
      // バックエンド未実装の間は 404 を許容（後で実装したら自然に動く）
      const status = e?.status ?? e?.payload?.status;
      if (status === 404) return;
      // それ以外は一旦握りつぶし（必要ならtoast/logを足す）
    }
  }, [user]);
*/

  const login = useCallback(async (email: string, password: string) => {
    // SimpleJWTが username/password の場合が多いので email を username に入れている（backend側に合わせる）
    const tokenRes = await loginWithPassword({ email: email, password } as any);
    const {access, refresh} = (tokenRes as any);
    
    writeTokens(access, refresh);
    const me = await fetchMe();

    setUser(me);
    setStatus("authenticated");

    writeGuestMigrationDone();
    clearGuestId();
    setGuestIdState(null);
  }, []);


// 実装追加（login と同じ構造）
const loginWithGoogleFn = useCallback(async (idToken: string) => {
  const tokenRes = await loginWithGoogle({id_token: idToken});
  const { access, refresh } = tokenRes;

  writeTokens(access, refresh);
  const me = await fetchMe();

  setUser(me);
  setStatus("authenticated");

  // 既存方針に合わせて guest を破棄
  writeGuestMigrationDone();
  clearGuestId();
  setGuestIdState(null);
}, []);


  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    initialize();
  }, [initialize]);



  return { user, 
    guestId,status,
    isReady: status !== "idle" && status !=="restoring", 
    loginWithGoogle:loginWithGoogleFn,
    ensureGuestId, 
    login, 
    logout};
}





