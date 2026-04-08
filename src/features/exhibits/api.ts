// src/features/exhibits/api.ts
import { http } from "@/shared/api/http";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type { components, paths } from "@/shared/types/fromBackend/schema";

export type Exhibit = components["schemas"]["Exhibit"];

// --- request/response types (paths 由来) ---
export type UpsertExhibitReq =
  paths["/api/galleries/{gallery_id}/exhibits/{slot_index}/"]["put"]["requestBody"]["content"]["application/json"];

export type UpsertExhibitRes =
  paths["/api/galleries/{gallery_id}/exhibits/{slot_index}/"]["put"]["responses"][200]["content"]["application/json"];

export async function upsertExhibit(params: {
  galleryId: string | number;
  slotIndex: number;
  body: UpsertExhibitReq;
}): Promise<UpsertExhibitRes> {
  const { galleryId, slotIndex, body } = params;
  return http.put<UpsertExhibitRes, UpsertExhibitReq>(
    API_ENDPOINTS.exhibits.upsert(galleryId, slotIndex),
    body
  );
}

export async function deleteExhibit(params: {
  galleryId: string | number;
  slotIndex: number;
}): Promise<void> {
  const { galleryId, slotIndex } = params;
  await http.del<void>(API_ENDPOINTS.exhibits.remove(galleryId, slotIndex));
}

// optional legacy: POST（仕様上は基本使わないが将来用）
export type CreateExhibitLegacyReq =
  paths["/api/galleries/{gallery_id}/exhibits/"]["post"]["requestBody"]["content"]["application/json"];
export type CreateExhibitLegacyRes =
  paths["/api/galleries/{gallery_id}/exhibits/"]["post"]["responses"][201]["content"]["application/json"];

export async function createExhibitLegacy(params: {
  galleryId: string | number;
  body: CreateExhibitLegacyReq;
}): Promise<CreateExhibitLegacyRes> {
  const { galleryId, body } = params;
  return http.post<CreateExhibitLegacyRes, CreateExhibitLegacyReq>(
    API_ENDPOINTS.exhibits.create(galleryId),
    body
  );
}
