# フロントエンド：依存関係・責務マップ v4（仕様変更反映版）
（依存が浅い順 / “どこで分岐を持つか” を明確化）

---

## 0. 依存が最も浅い層（基盤）
### `index.html`
- Vite SPA のエントリ
- `#root` と `src/main.tsx` の読み込みのみ

### `public/*`
- 静的アセット

---

## 1. グローバル設定・スタイル層
### `vite.config.ts`
- alias / env / build 設定

### `src/shared/styles/globals.css`
- Tailwind base + global style

---

## 2. 型（SSOT）層
### `src/shared/types/fromBackend/schema.ts`
- openapi-typescript 生成物（編集しない）
- `paths` / `components` を参照する唯一の入口

### `src/shared/types/fromBackend/index.ts`（推奨）
- `schema.ts` から必要型を再exportして import を簡単にする

---

## 3. shared（ドメイン非依存）層
> shared は features/app を import しない（循環禁止）

### `src/shared/api/http.ts`（最重要）
- HTTP クライアントの唯一の入口
- 仕様反映：
  - `X-Guest-Id` 自動付与（guest_id がある場合は常に）
  - `credentials: "include"` を統一
  - エラー正規化（`errors.ts`）

**禁止**：features/app が `fetch()` を直叩きしない（全部ここ経由）。

### `src/shared/api/errors.ts`
- status/message を正規化

### `src/shared/utils/slot.ts`
- exhibits を 0..11 の 12枠へ正規化（空きを補完）

### `src/shared/utils/*` / `src/shared/hooks/*`
- UI汎用（cn, url, useDisclosure 等）

---

## 4. features（ドメイン層：分岐はここに閉じ込める）
> features は shared/types のみ import（app を import しない）

### 4.1 `src/features/auth/*`
#### `features/auth/storage.ts`
- localStorage の key と get/set（guest_id など）

#### `features/auth/api.ts`
- `POST /api/auth/guest/`（guest_id 発行）

#### `features/auth/useAuth.ts`
- `auth.user`（User/Guest判定の唯一の材料）を提供
- `/app` 入場時に `ensureGuestId()` を実行

#### `src/app/providers/AuthProvider.tsx`
- `useAuth` を Context 化して全体へ供給

---

### 4.2 `src/features/galleries/*`（ここが最重要：Gallery API分岐を内包）
#### `features/galleries/api.ts`
- **User/Guest でエンドポイントを切り替える**
  - User:
    - `GET  /api/galleries/`
    - `POST /api/galleries/`
  - Guest:
    - `GET  /api/guest/gallery/`
    - `POST /api/guest/gallery/`（既存があれば既存返却＝フロントは作成/取得を区別しない）
- **ルール**：routes/components は分岐を知らない（api.ts が吸収）

#### `features/galleries/hooks/*`
- TanStack Query
  - `useGalleriesList()`（User/Guest両対応は api.ts 側で吸収）
  - `useCreateGallery()`（Guestは POST /api/guest/gallery/ を叩くだけで良い）
  - `useDeleteGallery()`（成功後、stateから完全削除＝削除済みは存在しない前提）

#### `features/galleries/components/*`
- `CreateGalleryButton`：hook を呼ぶだけ（分岐は持たない）
- `CreateGalleryModal`：必要なら title 入力（ただし Guest は “既存返却” があるので UX に注意）

---

### 4.3 `src/features/exhibits/*`（Guestでも従来API。ヘッダ必須）
#### `features/exhibits/api.ts`
- Guestでも同じパスを使用：
  - `POST   /api/galleries/{gallery_id}/exhibits/`
  - `PUT    /api/galleries/{gallery_id}/exhibits/{slot_index}/`
  - `DELETE /api/galleries/{gallery_id}/exhibits/{slot_index}/`
- `X-Guest-Id` は http.ts が自動付与（漏れない設計にする）
- UI は基本 PUT upsert を中心に

#### `features/exhibits/hooks/*`
- `useUpsertExhibit(galleryId)` / `useDeleteExhibit(galleryId)`

---

## 5. app（画面層：分岐を知らない）
> app は features を組み立てるだけ。API直叩き禁止。

### `src/main.tsx`
- Provider を積む（QueryProvider / AuthProvider / ToastProvider）

### `src/app/routes/app/tabs/*`
- `GalleryLibraryTab`：一覧表示（分岐なし。useGalleriesList を呼ぶだけ）
- `GalleryDetailTab`：詳細 + WebGPU（分岐なし。useGalleryDetail を呼ぶだけ）

---

## 6. 依存関係の禁止ルール（v4）
- `shared/*` → `features/*` / `app/*` を import 禁止
- `features/*` → `app/*` を import 禁止
- `app/*` → API直叩き禁止（必ず features/**/api.ts + http.ts 経由）
- 分岐（User/Guest）は **features/galleries/api.ts** に封じ込める
