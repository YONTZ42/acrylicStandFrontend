// src/features/exhibits/api.ts
import { http } from "@/shared/api/http";
import { API_ENDPOINTS } from "@/shared/api/endpoints";
import type { components, paths } from "@/shared/types/fromBackend/schema";

export type Exhibit = components["schemas"]["Exhibit"];

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

// POSTを用いた新規作成用 (クエリパラメータがない場合に使用)
export type CreateExhibitReq =
  paths["/api/galleries/{gallery_id}/exhibits/"]["post"]["requestBody"]["content"]["application/json"];
export type CreateExhibitRes =
  paths["/api/galleries/{gallery_id}/exhibits/"]["post"]["responses"][201]["content"]["application/json"];

export async function createExhibit(params: {
  galleryId: string | number;
  body: CreateExhibitReq;
}): Promise<CreateExhibitRes> {
  const { galleryId, body } = params;
  return http.post<CreateExhibitRes, CreateExhibitReq>(
    API_ENDPOINTS.exhibits.create(galleryId),
    body
  );
}