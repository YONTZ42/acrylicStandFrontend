# 実装済み TS / TSX まとめ（コンポーネント名・入出力・依存）

> このドキュメントは、これまでこのスレッドで作成した **ts/tsx** の“公開API”（export）と、主な入出力・副作用を一覧化したものです。  
> **型の参照ルール**：API境界の型は `paths`、ドメイン型は `components/schemas`（fromBackend）を利用。

---

## 0. エントリポイント / ルーティング

### `src/main.tsx`
**責務**: React ルートをマウントし、Provider を積んで `AppRouter` を描画。

- **exports**: なし（エントリ）
- **依存**:
  - `@/shared/styles/globals.css`
  - `QueryProvider` / `AuthProvider` / `ToastProvider`
  - `AppRouter`
- **副作用**: `ReactDOM.createRoot(...).render(...)`

### `src/app/AppRouter.tsx`
**責務**: SPA ルーティング（/, /login, /app, /404）。

- **export**: `AppRouter(): JSX.Element`
- **routes**:
  - `/` → `LandingPage`
  - `/login` → `LoginPage`
  - `/app` → `AppHome`
  - `*` → `/404`
- **開発用**: DEV 時のみ簡易ナビ表示

---

## 1. shared/types（fromBackend）

### `src/shared/types/fromBackend/schema.ts`
**責務**: OpenAPI 生成物（`paths`, `components` など）。  
- **export**: 生成物そのまま（編集しない前提）

### `src/shared/types/fromBackend/index.ts`
**責務**: schema の薄い再 export。

- **export**:
  - `type paths`
  - `type components`

---

## 2. shared/api（HTTP基盤）

### `src/shared/api/errors.ts`
**責務**: API エラー型の統一。

- **export types**
  - `ApiErrorPayload`
- **export classes**
  - `ApiError extends Error`
    - **constructor**: `{ status: number; message: string; url?: string; payload?: unknown }`
    - **fields**: `status`, `url`, `payload`
- **export functions**
  - `isApiError(e: unknown): e is ApiError`

### `src/shared/api/endpoints.ts`
**責務**: API パスの一元管理（features はこれを参照）。

- **export const** `API_ENDPOINTS`
  - `auth.guest = "/api/auth/guest/"`
  - `galleries.listCreate = "/api/galleries/"`
  - `galleries.detail(id) => "/api/galleries/{id}/"`
  - `galleries.publicBySlug(slug) => "/api/galleries/g/{slug}/"`
  - `exhibits.upsert(galleryId, slotIndex) => "/api/galleries/{gallery_id}/exhibits/{slot_index}/"`
  - `exhibits.remove(galleryId, slotIndex) => 同上 DELETE`
  - `exhibits.create(galleryId) => "/api/galleries/{gallery_id}/exhibits/"`（legacy）

### `src/shared/api/http.ts`
**責務**: fetch wrapper（全 API 呼び出しは必ずここ経由）。

- **export types**
  - `HttpClient`（`get/post/put/patch/del`）
- **export const**
  - `http: HttpClient`
- **主要仕様**
  - `credentials: "include"` 固定
  - `localStorage["guest_id"]` がある場合 `X-Guest-Id` を自動付与
  - JSON は `Content-Type: application/json`、body は `JSON.stringify`
  - 非 `ok` は `ApiError` を throw（payload の `detail/message` を優先）
  - timeout（デフォ 30s）で abort

- **入出力（例）**
  - `http.get<T>(path: string, opts?): Promise<T>`
  - `http.post<TRes, TBody>(path: string, body?: TBody, opts?): Promise<TRes>`
  - `opts.baseUrl`（なければ同一オリジン）、`opts.headers`, `opts.signal`, `opts.timeoutMs`

---

## 3. shared/utils / hooks

### `src/shared/utils/cn.ts`
**責務**: className 結合。

- **export**: `cn(...parts: Array<string | null | undefined | false>): string`

### `src/shared/utils/slot.ts`
**責務**: slot_index（0..11）正規化。

- **export const**: `SLOT_COUNT = 12`
- **export type**: `SlotIndex = 0|1|...|11`
- **export functions**
  - `isValidSlotIndex(n: number): n is SlotIndex`
  - `clampSlotIndex(n: number): SlotIndex`
  - `normalizeSlots<T extends {slot_index:number}>(items: T[]): Array<T|null>`
    - **出力**: 長さ 12 の配列（穴は `null`）

### `src/shared/utils/url.ts`
**責務**: URL 組み立て。

- **export**
  - `withQuery(path: string, query: Record<string, string|number|boolean|null|undefined>): string`
  - `absoluteUrl(path: string): string`

### `src/shared/hooks/useDisclosure.ts`
**責務**: open/close/toggle（モーダル等）。

- **export**: `useDisclosure(initial?: boolean)`
- **return**
  - `{ isOpen, open(), close(), toggle(), setIsOpen }`

### `src/shared/hooks/useMediaQuery.ts`
**責務**: `matchMedia` を hook 化。

- **export**: `useMediaQuery(query: string): boolean`
- **副作用**: media query change listener 登録/解除

---

## 4. features/auth（ゲスト認証）

### `src/features/auth/storage.ts`
**責務**: guest_id の localStorage I/O。

- **export const**
  - `AUTH_STORAGE_KEYS.guestId = "guest_id"`
- **export types**
  - `GuestId = string`
- **export functions**
  - `getGuestId(): GuestId | null`
  - `setGuestId(guestId: GuestId): void`
  - `clearGuestId(): void`

### `src/features/auth/api.ts`
**責務**: auth API（guest issue）。

- **export types**
  - `GuestIssueRes = paths["/api/auth/guest/"]["post"]["responses"][200]["content"]["application/json"]`
- **export functions**
  - `issueGuestId(): Promise<GuestIssueRes>`
    - **I/O**: `POST /api/auth/guest/`（bodyなし）

### `src/features/auth/useAuth.ts`
**責務**: guest_id を確保し状態として配布。

- **export types**
  - `AuthState`
    - `guestId: string | null`
    - `isGuestReady: boolean`
    - `ensureGuestId(): Promise<string>`
    - `refreshGuestId(): Promise<string>`
    - `clearGuestId(): void`
- **export**
  - `useAuth(): AuthState`

### `src/features/auth/AuthProvider.tsx`
**責務**: `useAuth()` を Context に載せる。

- **export**
  - `AuthProvider({ children }): JSX.Element`
  - `useAuthContext(): AuthState`

---

## 5. features/galleries / features/exhibits（API）

### `src/features/galleries/api.ts`
- **export types**: `Gallery`, `Exhibit`（components）
- **export functions**
  - `listGalleries()`
  - `createGallery(body)`
  - `getGallery(id)`
  - `patchGallery(id, body)`
  - `deleteGallery(id)`
  - `getPublicGallery(slug)`

### `src/features/exhibits/api.ts`
- **export types**: `Exhibit`（components）
- **export functions**
  - `upsertExhibit({ galleryId, slotIndex, body })`
  - `deleteExhibit({ galleryId, slotIndex })`
  - `createExhibitLegacy({ galleryId, body })`

---

## 6. app/providers

### `src/app/providers/AuthProvider.tsx`
- **export**: `AuthProvider({ children }): JSX.Element`

### `src/app/providers/QueryProvider.tsx`
- **export**: `QueryProvider({ children }): JSX.Element`

### `src/app/providers/ToastProvider.tsx`
- **export**: `ToastProvider({ children }): JSX.Element`, `useToast(): ToastApi`

---

## 7. app/routes

### `src/app/routes/marketing/LandingPage.tsx`
- **export**: `LandingPage(): JSX.Element`
- **副作用**: mount で `ensureGuestId()` 実行

### `src/app/routes/auth/LoginPage.tsx`
- **export**: `LoginPage(): JSX.Element`

### `src/app/routes/app/AppHome.tsx`
- **export**: `AppHome(): JSX.Element`
- **副作用**: mount で `ensureGuestId()` 実行

### `src/app/routes/misc/NotFoundPage.tsx`
- **export**: `NotFoundPage(): JSX.Element`

# 追記：Galleries Hooks / Components / Tabs 実装

---

## 8. features/galleries（Hooks）

### `src/features/galleries/hooks/keys.ts`
**責務**: React Query 用キーの一元管理。

- **export const**
  - `galleriesKeys`
    - `all`
    - `list()`
    - `detail(id)`
    - `publicBySlug(slug)`

---

### `src/features/galleries/hooks/useGalleriesList.ts`
**責務**: Gallery 一覧取得（常に `Gallery[]` を返す）。

- **export**
  - `useGalleriesList(): UseQueryResult<Gallery[]>`

- **内部仕様**
  - `listGalleries()` を実行
  - `select` でレスポンスを正規化
    - `Gallery[]` の場合 → そのまま返す
    - `{ results: Gallery[] }`（DRFページング） → `results`
    - `{ items: Gallery[] }` / `{ data: Gallery[] }` → 吸収
    - その他 → `[]`
  - 常に `Gallery[]` を返すため UI 側で `.map` クラッシュしない

---

### `src/features/galleries/hooks/useGalleryDetail.ts`
**責務**: 単一 Gallery 詳細取得 + exhibits を 12枠に正規化。

- **export**
  - `useGalleryDetail(id)`

- **return**
  - React Query の標準プロパティ
  - `normalizedExhibits: Array<Exhibit|null> | null`

- **内部仕様**
  - `getGallery(id)`
  - `normalizeSlots(exhibits)`
  - slot 0..11 の 12配列へ正規化

---

### `src/features/galleries/hooks/useCreateGallery.ts`
**責務**: Gallery 作成

- **export**
  - `useCreateGallery()`

- **副作用**
  - `galleriesKeys.list()` を invalidate
  - 作成直後に `detail(id)` を `setQueryData` でキャッシュ温め

---

### `src/features/galleries/hooks/useUpdateGallery.ts`
**責務**: Gallery 更新

- **export**
  - `useUpdateGallery()`

- **副作用**
  - `detail(id)` を即時キャッシュ更新
  - `list()` を invalidate

---

### `src/features/galleries/hooks/useDeleteGallery.ts`
**責務**: Gallery 削除

- **export**
  - `useDeleteGallery()`

- **副作用**
  - `detail(id)` を remove
  - `list()` を invalidate

---

### `src/features/galleries/hooks/usePublicGallery.ts`
**責務**: 公開 Gallery 取得（slug）

- **export**
  - `usePublicGallery(slug)`

---

## 9. features/galleries（Components）

### `src/features/galleries/components/GalleryCard.tsx`
**責務**: Gallery 一覧カードUI。

- **props**
  - `gallery: Gallery`
  - `onOpen?: (id: string) => void`
  - `className?: string`

- **表示**
  - cover image
  - title
  - updatedAt
  - isPublic バッジ
  - exhibits数

---

### `src/features/galleries/components/GalleryGrid.tsx`
**責務**: Gallery カードグリッド。

- **props**
  - `galleries: Gallery[]`
  - `onOpen?: (id: string) => void`
  - `emptyTitle?`
  - `emptyMessage?`

- **実行時保険**
  - `Array.isArray(props.galleries)` ガード
  - `.map is not a function` 防止

---

### `src/features/galleries/components/CreateGalleryButton.tsx`
**責務**: Gallery 作成UI。

- **props**
  - `onCreated?: (id: string) => void`
  - `defaultTitle?: string`

- **内部**
  - `useCreateGallery`
  - `useToast`
  - 成功時に toast 表示
  - 作成後に `onCreated(id)` 呼び出し

---

### `src/features/galleries/components/GallerySettingsModal.tsx`
**責務**: Gallery 設定編集モーダル。

- **props**
  - `open: boolean`
  - `onClose: () => void`
  - `galleryId: string`

- **内部**
  - `useGalleryDetail`
  - `useUpdateGallery`
  - `useDeleteGallery`
  - タイトル編集
  - isPublic 切替
  - 削除ボタン

---

## 10. app/routes/app/tabs

### `src/app/routes/app/tabs/GalleryLibraryTab.tsx`
**責務**: Gallery 一覧タブ。

- **props**
  - `selectedGalleryId?: string`
  - `onSelectGalleryId?: (id: string) => void`

- **内部**
  - `useGalleriesList`
  - `CreateGalleryButton`
  - `GalleryGrid`

---

### `src/app/routes/app/tabs/GalleryDetailTab.tsx`
**責務**: Gallery 詳細タブ。

- **props**
  - `galleryId?: string`
  - `onBack?: () => void`

- **内部**
  - `useGalleryDetail`
  - `normalizedExhibits` を使用
  - WebGPU 表示プレースホルダ
  - `GallerySettingsModal`

---

## 11. 修正履歴（今回の重要修正）

### 🧩 型修正
- `PatchGalleryReq` を `/api/galleries/{id}/` の `patch` に修正

### 🛡 一覧クラッシュ修正
- `galleries.map is not a function` 解消
- `useGalleriesList` で常に `Gallery[]` を返すよう正規化
- `GalleryGrid` に `Array.isArray` 実行時ガード追加

### 🗂 命名整合
- `normalizedSlots` → `normalizedExhibits` に統一
---

## 12. Exhibits（展示物）: Editor / Modal UI

### `src/features/exhibits/components/ExhibitEditorModal.tsx`
**責務**: Exhibit（展示物）の作成/更新（Upsert）を行うモーダル。  
画像選択・タイトル/説明編集・材質プリセット選択をまとめて、`useUpsertExhibit` で保存する。

- **exports**
  - `ExhibitEditorModal(props)`
- **props**
  - `open: boolean` — 表示/非表示
  - `onClose: () => void` — 閉じる
  - `galleryId: string` — 対象ギャラリーID
  - `slotIndex: number` — 対象スロット
  - `current: Exhibit | null` — 既存展示（編集時）。※現状 `any | null` になっているので、`Exhibit | null` に寄せると良い
- **内部状態（主要）**
  - `imageUrl: string | null`
  - `title: string`
  - `description: string`
  - `materialParams: Record<string, number>`
- **副作用**
  - 保存時に `upsert.mutateAsync({ slotIndex, body })` を実行
  - 保存成功で `onClose()`、React Query のキャッシュ更新（hook 側）

> 型の注意: `schema.ts` では `imageOriginalUrl` が `string` 必須になっている場合があるため、  
> **保存ボタンの活性条件**を「画像がある時のみ」にする / `""` を許容するかを仕様として決めて統一する。

---

### `src/features/exhibits/components/ImagePicker.tsx`
**責務**: 画像URL（または将来的にアップロード結果URL）を選ぶUI。  
MVP では URL/ダミー入力を扱う前提。

- **exports**
  - `ImagePicker(props)`
- **props**
  - `value: string | null`
  - `onChange(next: string | null): void`
- **入出力**
  - 入力: 現在の画像URL
  - 出力: 新しい画像URL（未選択は `null`）

---

### `src/features/exhibits/components/TitleDescriptionForm.tsx`
**責務**: タイトル/説明の編集フォーム。

- **exports**
  - `TitleDescriptionForm(props)`
- **props**
  - `title: string`
  - `description: string`
  - `onChange(next: { title: string; description: string }): void`

---

### `src/features/exhibits/components/StylePicker.tsx`
**責務**: WebGPU 表示用の「材質パラメータ」プリセットを選ぶUI。

- **exports**
  - `StylePicker(props)`
  - `MaterialPresetKey`（`"glass" | "matte" | "paper" | "clearSheet"`）
- **プリセット例（概念）**
  - Glass / Matte / Paper / ClearSheet など
- **入出力**
  - 入力: 現在の `materialParams`
  - 出力: 選択したプリセットの `params` を `onChange` で返す（`Record<string, number>`）

---

## 13. Exhibits: API / Hook

### `src/features/exhibits/api.ts`
**責務**: Exhibits 関連 API 呼び出しの薄いラッパ。

- **exports（型）**
  - `Exhibit = components["schemas"]["Exhibit"]`
  - `UpsertExhibitReq` / `UpsertExhibitRes`（`paths` 由来）
- **exports（関数）**
  - `upsertExhibit(galleryId: string, slotIndex: number, body: UpsertExhibitReq)`
  - `deleteExhibit(galleryId: string, slotIndex: number)`
- **依存**
  - `http`（共通HTTPクライアント）
  - `API_ENDPOINTS`
  - `fromBackend/schema`

---

### `src/features/exhibits/hooks/useUpsertExhibit.ts`
**責務**: Upsert 用 mutation hook。保存後のキャッシュ更新/無効化をまとめる。

- **exports**
  - `useUpsertExhibit(galleryId: string)`
- **返り値（概念）**
  - `mutateAsync({ slotIndex, body })`
  - `isPending / error` など（React Query 標準）
- **副作用（キャッシュ）**
  - `galleriesKeys` を使って `galleries`/`galleryDetail` 系のクエリを invalidate する設計

---

## 14. 進捗ログ（追記欄 / 自分用メモ）

> ここは “日付 + 変更点 + 次やること” を短く追記していく欄。  
> 迷ったら「①できたこと ②残タスク ③ブロッカー」を3行で書く。

- 2026-02-21
  - ✅ Exhibits: `api.ts` / `useUpsertExhibit` / `ExhibitEditorModal` 周辺を追加
  - ✅ Exhibits Editor UI: ImagePicker / TitleDescriptionForm / StylePicker を追加
  - 🟨 型調整: `ExhibitEditorModal.current` を `Exhibit | null` に寄せる、`imageOriginalUrl` の必須/任意を仕様として固定
  - ▶ Next:
    - `features/exhibits/api.ts` に「PATCH（部分更新）」があるなら、タイトル/説明だけ更新の導線を追加
    - `GalleryDetail` から ExhibitEditorModal を呼び出す導線の最終接続（open/close、current の受け渡し）

---

## 15. shared/components（画像編集 UI: PhotoCutoutPanel）

### `src/shared/components/PhotoCutoutPanel/PhotoCutoutPanel.tsx`（新規 or 移設）
**責務**: 画像の切り抜き/消しゴム編集を行い、編集済み画像を `Blob` で返す汎用パネル。  
（Sticker専用ではなく、「画像だけ」を扱えるようにする）

- **export**:
  - `PhotoCutoutPanel(props): JSX.Element`
- **props**
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onComplete: (imageBlob: Blob) => void`  
    - **重要**: ここではアップロードしない。呼び出し側に Blob を返すだけ。
- **依存**
  - `react-konva`（Stage/Layer/Line/Image）
  - `lucide-react`（UIアイコン）
  - `useImageEditorState`（編集履歴）
  - `useKonvaDraw`（マウス/タッチの線入力）
  - 既存の画像処理 util（暫定的に stickers 側の util を流用している可能性あり）
- **副作用**
  - パネルOpen/Close時の編集状態初期化
  - `File input` で画像を取り込み
  - AutoCutout（Lambda等）を叩く場合は非同期処理

---

## 16. shared/hooks（画像編集 state / Konva 入力）

### `src/shared/hooks/useImageEditorState.ts`（新規）
**責務**: 画像編集の履歴（undo/redo）を `Blob` ベースで管理する。  
（もともとの `useStickerEditorState` を汎用化）

- **export**
  - `useImageEditorState()`
- **return**
  - `currentBlob: Blob | null`
  - `init(blob: Blob): void`
  - `pushState(blob: Blob): void`
  - `undo(): void`
  - `redo(): void`
  - `reset(): void`
  - `canUndo: boolean`
  - `canRedo: boolean`

### `src/shared/hooks/useKonvaDraw.ts`（移設 or 既存流用）
**責務**: Konva 上での線入力（cut/erase など）を抽象化。

- **export**
  - `useKonvaDraw()`
- **return**
  - `mode, setMode`
  - `currentPoints`
  - `isDrawing`
  - `handleMouseDown/Move/Up`
  - `resetDraw()`

---

## 17. features/exhibits（画像アップロード & ImagePicker プレビュー化）

### `src/features/exhibits/hooks/useExhibitImageUpload.ts`（新規）
**責務**: Exhibit用の画像 `Blob` を S3 に PUT し、最終的に表示/保存に使える URL を返す。  
（uploads issue/confirm を利用）

- **export**
  - `useExhibitImageUpload()`
- **return**
  - `uploadImageAndGetUrl(blob: Blob): Promise<string>`
  - `isUploading: boolean`
  - `error: string | null`
- **依存**
  - `shared/api/http.ts`（必須：`X-Guest-Id` 自動付与を期待）
  - `/api/uploads/issue/`, `/api/uploads/confirm/`（バックエンド）

> NOTE: confirm の payload は `upload_session_id`（snake）か `uploadSessionId`（camel）かを backend と統一する必要がある。

---

### `src/features/exhibits/components/ImagePicker.tsx`（変更）
**責務**: 画像URL入力ではなく「画像プレビュー領域」として振る舞う。  
プレビュー領域タップで `PhotoCutoutPanel` を開き、編集後に upload → URL取得 → プレビュー更新。

- **props（想定）**
  - `value: string | null`（= 画像URL）
  - `onChange: (next: string | null) => void`
  - `hiddenName?: string`（フォーム連携が必要なら hidden input で値保持）
- **内部の流れ**
  1. プレビュー領域クリック → `PhotoCutoutPanel` を open
  2. `onComplete(blob)` で `uploadImageAndGetUrl(blob)` を実行
  3. 取得した URL を `onChange(url)` で親に返す
  4. `value` が更新されるとプレビュー画像も更新される
- **UI方針**
  - URL文字列は表示しない（必要なら hidden input に保持）

---

## 18. shared/api（Guestヘッダ運用の関連）

### `src/shared/api/http.ts`（仕様上の重要点）
**責務**: すべての API 通信に `X-Guest-Id` を自動付与（guest_id がある場合）。  
uploads も含め、guest の場合はこれが必須。

- **要件**
  - `localStorage["guest_id"]` を参照して `X-Guest-Id` を付与
  - `ensureGuestId()` が未実行で guest_id が無い場合、どこで発行するかを統一（/app入場時 or http内で担保）
- **注意**
  - Cookie（next-auth等）に依存しない
  - Vite では env は `import.meta.env.VITE_*`

---

## 19. backend（uploads: Guest 対応）

### `/api/uploads/{action}/`（Django側）
**方針**
- permission を `AllowAny` にする
- ただし無制限に開放しない
  - `request.user.is_authenticated` なら OK
  - そうでないなら `X-Guest-Id` 必須
  - `purpose` を whitelist（例: `exhibit_image` など）で縛る
  - throttle（DRF）推奨

**追加で必要になりがちな変更**
- `UploadSession` が `user` 必須設計の場合、Guest用に `guest_id` を持たせる（`user` nullable化 + check constraint 推奨）


