// src/features/galleries/api.ts
import { http } from "@/shared/api/http";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type { components, paths } from "@/shared/types/fromBackend/schema";

export type GalleryMode = "user" | "guest";

/**
 * ドメイン型（UI内部のSSOT）
 * - state/props で持つ型は components/schemas を優先
 */
export type Gallery = components["schemas"]["Gallery"];
export type Exhibit = components["schemas"]["Exhibit"];

/**
 * API境界の型（必ず paths）
 */
export type ListGalleriesRes =
  paths["/api/galleries/"]["get"]["responses"][200]["content"]["application/json"];

export type CreateGalleryReq =
  NonNullable<paths["/api/guest/gallery/"]["patch"]["requestBody"]>["content"]["application/json"];
export type CreateGalleryRes =
  paths["/api/galleries/"]["post"]["responses"][201]["content"]["application/json"];

export type GuestGetGalleryRes =
  paths["/api/guest/gallery/"]["get"]["responses"][200]["content"]["application/json"];

export type GuestCreateGalleryReq =
  NonNullable<paths["/api/guest/gallery/"]["patch"]["requestBody"]>["content"]["application/json"];

export type GuestCreateGalleryRes =
  | paths["/api/guest/gallery/"]["post"]["responses"][200]["content"]["application/json"]
  | paths["/api/guest/gallery/"]["post"]["responses"][201]["content"]["application/json"];

export type GuestPatchGalleryReq =
  NonNullable<paths["/api/guest/gallery/"]["patch"]["requestBody"]>["content"]["application/json"];
export type GuestPatchGalleryRes =
  paths["/api/guest/gallery/"]["patch"]["responses"][200]["content"]["application/json"];

export type GetGalleryRes =
  paths["/api/galleries/{id}/"]["get"]["responses"][200]["content"]["application/json"];

export type PatchGalleryReq =
  NonNullable<paths["/api/galleries/{id}/"]["patch"]["requestBody"]>["content"]["application/json"];

export type PatchGalleryRes =
  paths["/api/galleries/{id}/"]["patch"]["responses"][200]["content"]["application/json"];

export type GetPublicGalleryRes =
  paths["/api/galleries/g/{slug}/"]["get"]["responses"][200]["content"]["application/json"];

function isHttpErrorWithStatus(err: unknown, status: number): boolean {
  const anyErr = err as any;
  const s = anyErr?.status ?? anyErr?.response?.status ?? anyErr?.data?.status;
  return Number(s) === status;
}

function resolveMode(mode?: GalleryMode): GalleryMode {
  return mode ?? "user";
}

/**
 * GET galleries
 * - User : GET /api/galleries/
 * - Guest: GET /api/guest/gallery/（1ゲスト=1ギャラリー。なければ404）
 *
 * 返り値は UI 側で Gallery[] に正規化する（hook側で吸収）。
 */
export async function listGalleries(
  mode?: GalleryMode,
): Promise<ListGalleriesRes | GuestGetGalleryRes | null> {
  const m = resolveMode(mode);

  if (m === "user") {
    return await http.get<ListGalleriesRes>(API_ENDPOINTS.galleries.listCreate);
  }

  try {
    return await http.get<GuestGetGalleryRes>(API_ENDPOINTS.galleries.guestSingleton);
  } catch (e) {
    // Guest は「まだGalleryが無い」が通常フロー（404）
    if (isHttpErrorWithStatus(e, 404)) return null;
    throw e;
  }
}

/**
 * POST galleries
 * - User : POST /api/galleries/
 * - Guest: POST /api/guest/gallery/（既存があれば既存を返す＝作成/取得を区別しない）
 */
export async function createGallery(
  body: CreateGalleryReq | GuestCreateGalleryReq,
  mode?: GalleryMode,
): Promise<CreateGalleryRes | GuestCreateGalleryRes> {
  const m = resolveMode(mode);

  if (m === "user") {
    return await http.post<CreateGalleryRes, CreateGalleryReq>(
      API_ENDPOINTS.galleries.listCreate,
      body as CreateGalleryReq,
    );
  }

  return await http.post<GuestCreateGalleryRes, GuestCreateGalleryReq>(
    API_ENDPOINTS.galleries.guestSingleton,
    body as GuestCreateGalleryReq,
  );
}

/**
 * GET Gallery
 * - User : GET /api/galleries/{id}/
 * - Guest: GET /api/guest/gallery/
 */
export async function getGallery(
  id: string | number,
  mode?: GalleryMode,
): Promise<GetGalleryRes | GuestGetGalleryRes | null> {
  const m = resolveMode(mode);

  if (m === "user") {
    return await http.get<GetGalleryRes>(API_ENDPOINTS.galleries.detail(id));
  }

  // ✅ guest の 404 は「未作成」扱い
  try {
    return await http.get<GuestGetGalleryRes>(API_ENDPOINTS.galleries.guestSingleton);
  } catch (e) {
    if (isHttpErrorWithStatus(e, 404)) return null;
    throw e;
  }
}


/**
 * PATCH Gallery
 * - User : PATCH /api/galleries/{id}/
 * - Guest: PATCH /api/guest/gallery/
 */
export async function patchGallery(
  id: string | number,
  body: PatchGalleryReq | GuestPatchGalleryReq,
  mode?: GalleryMode,
): Promise<PatchGalleryRes | GuestPatchGalleryRes> {
  const m = resolveMode(mode);

  if (m === "user") {
    return await http.patch<PatchGalleryRes, PatchGalleryReq>(
      API_ENDPOINTS.galleries.detail(id),
      body as PatchGalleryReq,
    );
  }
  return await http.patch<GuestPatchGalleryRes, GuestPatchGalleryReq>(
    API_ENDPOINTS.galleries.guestSingleton,
    body as GuestPatchGalleryReq,
  );
}

/**
 * DELETE Gallery
 * - User : DELETE /api/galleries/{id}/
 * - Guest: DELETE /api/guest/gallery/
 */
export async function deleteGallery(id: string | number, mode?: GalleryMode): Promise<void> {
  const m = resolveMode(mode);

  if (m === "user") {
    await http.del<void>(API_ENDPOINTS.galleries.detail(id));
    return;
  }
  await http.del<void>(API_ENDPOINTS.galleries.guestSingleton);
}

/**
 * GET /api/galleries/g/{slug}/（公開Viewer）
 */
export async function getPublicGallery(slug: string): Promise<GetPublicGalleryRes | null> {
  try {
    return await http.get<GetPublicGalleryRes>(API_ENDPOINTS.galleries.publicBySlug(slug));
  } catch (e) {
    if (isHttpErrorWithStatus(e, 404)) return null;
    throw e;
  }
}