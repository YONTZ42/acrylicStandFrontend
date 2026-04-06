// src/features/auth/api.ts
import { http } from "@/shared/api/http";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type { paths, components } from "@/shared/types/fromBackend/schema";

export type GuestIssueRes =
  paths["/api/auth/guest/"]["post"]["responses"][200]["content"]["application/json"];

export async function issueGuestId(): Promise<GuestIssueRes> {
  return await http.post<GuestIssueRes>(API_ENDPOINTS.auth.guest);
}

export type RegisterReq =
  paths["/api/auth/register/"]["post"]["requestBody"]["content"]["application/json"];
export type RegisterRes =
  paths["/api/auth/register/"]["post"]["responses"][201]["content"]["application/json"];

export async function registerUser(body: RegisterReq): Promise<RegisterRes> {
  return http.post("/api/auth/register/", body);
}

export type TokenReq =
  paths["/api/token/"]["post"]["requestBody"]["content"]["application/json"];
export type TokenRes =
  paths["/api/token/"]["post"]["responses"][200]["content"]["application/json"];

export async function loginWithPassword(body: TokenReq): Promise<TokenRes> {
  return http.post("/api/token/", body);
}

export type RefreshReq =
  paths["/api/token/refresh/"]["post"]["requestBody"]["content"]["application/json"];
export type RefreshRes =
  paths["/api/token/refresh/"]["post"]["responses"][200]["content"]["application/json"];

export async function refreshAccessToken(body: RefreshReq): Promise<RefreshRes> {
  return http.post("/api/token/refresh/", body);
}

export type User = components["schemas"]["User"];
export type MeRes = paths["/api/me/"]["get"]["responses"][200]["content"]["application/json"];

export async function fetchMe(): Promise<MeRes> {
  return http.get("/api/me/");
}

/**
 * ✅ 将来実装予定：ゲストデータをユーザーへ移行する
 * バックエンドができるまで 404 は許容して無視できるように useAuth 側で扱う
 *
 * 例）POST /api/auth/migrate-guest/ （X-Guest-Id + Authorization or session）
 */
export async function migrateGuestToUser(): Promise<void> {
  await http.post("/api/auth/migrate-guest/");
}





/* Google auth user 
将来的に, schema.tsのpath[]からtype取得予定
*/
export type GoogleLoginReq = {
  id_token: string;
};

export type GoogleLoginRes = {
  access: string;
  refresh: string;
};

export async function loginWithGoogle(body: GoogleLoginReq): Promise<GoogleLoginRes> {
  return http.post("/api/auth/google/", body);
}