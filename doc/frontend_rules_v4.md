# フロントエンド実装ルール（ディレクトリ構成以外） v4（仕様変更反映版）
（**API型は schema.ts の paths**、**モデル型は components/schemas**。型の import 起点は **/shared/types/fromBackend** に統一）

このファイルは「フロントエンドの実装ルール」だけをまとめたもの（ディレクトリ構成は含めない）。  
v3（既存）を置き換える正式版。

---

## 1. 認証・ヘッダ運用（最重要）
- **すべてのAPIリクエストで `X-Guest-Id` を自動付与**（guest_id がある場合）  
  → 付与処理は必ず `shared/api/http.ts` に閉じ込める。
- `/app` 入場時は `ensureGuestId()` を必ず実行（未発行なら `POST /api/auth/guest/`）。
- ユーザー認証が Cookie/Session の場合は、API呼び出しを **`credentials: "include"`** 前提で統一する。

---

## 2. 認証分岐ルール（確定仕様）
### 2.1 判定方法（唯一）
```ts
if (auth.user) {
  // 通常ユーザー
} else {
  // Guest
}
```
- `auth.user` が存在する場合のみ User とみなす  
- それ以外は **すべて Guest** として扱う（guest_id がある前提）

---

## 3. 型定義（SSOT）— import 起点を **/shared/types/fromBackend** に統一
### 3.1 方針（重要）
- **原則、すべての型（API・ドメイン・Propsも含む）は `src/shared/types/fromBackend/schema.ts` から import する。**

```
src/shared/types/fromBackend/
  schema.ts        # openapi-typescript の生成物（編集しない）
  index.ts         # schema.ts から必要な型を再export（推奨）
```

### 3.2 使い分けルール
- **APIまわり（request/response）は `paths` から取る（operationsは使わない）**
- **Gallery / Exhibit 等のモデル（ドメイン型）は `components["schemas"]` から取る**

> まとめ：
> - API境界 = `paths[...]`
> - ドメイン型 = `components["schemas"][...]`

---

## 4. API型を `paths` から取るテンプレ（統一）
### 4.1 JSONレスポンス型（200）
```ts
import type { paths } from "@/shared/types/fromBackend/schema";

export type GuestIssueRes =
  paths["/api/auth/guest/"]["post"]["responses"][200]["content"]["application/json"];
```

### 4.2 JSONリクエストBody型
```ts
import type { paths } from "@/shared/types/fromBackend/schema";

export type CreateGalleryReq =
  paths["/api/galleries/"]["post"]["requestBody"]["content"]["application/json"];
```

---

## 5. ドメイン型（Gallery/Exhibit等）を `components/schemas` から取る
```ts
import type { components } from "@/shared/types/fromBackend/schema";

export type Gallery = components["schemas"]["Gallery"];
export type Exhibit = components["schemas"]["Exhibit"];
```

---

## 6. Gallery API分岐（重要）
### 6.1 User の場合
- `GET /api/galleries/`
- `POST /api/galleries/`

### 6.2 Guest の場合
- `GET /api/guest/gallery/`
- `POST /api/guest/gallery/`

**ルール：UIで分岐しない。API層（features/galleries/api.ts）で分岐を内包する。**

---

## 7. Gallery作成フロー（Guest）
### 7.1 CreateGalleryButton 押下時
- `POST /api/guest/gallery/`
  - **既存があれば既存を返す**
  - **なければ作成して返す**

**フロントは「作成/取得」を区別しない（常に POST を叩き、返った Gallery を使う）。**

---

## 8. 削除後の扱い（正式仕様）
- `DELETE` 成功後は **ローカル状態から完全削除**
- **再作成可能**
- 削除済みデータは「存在しない前提」でUI設計する（復活/復元UIは作らない）

---

## 9. Exhibit CRUD（Guestでも従来APIを使用）
Guestでも Exhibit は従来通り以下を使用する：

- `POST   /api/galleries/{gallery_id}/exhibits/`
- `PUT    /api/galleries/{gallery_id}/exhibits/{slot_index}/`
- `DELETE /api/galleries/{gallery_id}/exhibits/{slot_index}/`

### 9.1 ヘッダ必須
- `X-Guest-Id`（guest時は必ず送信）
- `credentials: "include"`（常に送る）

---

## 10. APIクライアント実装ルール
- Guest時は必ず `X-Guest-Id` を送信（http.tsに封じ込める）
- 削除済みデータは存在しない前提でUI設計する（404は通常フローとして扱う）
- `slot_index` はUI側で **重複生成しない**
  - 0..11固定
  - 1枠につき「有効データ1つのみ」

---

## 11. スロット設計（12枠）
- `slot_index` は **0〜11固定**
- APIから返る exhibits は「存在する枠だけ」なので、フロントで必ず：
  - `slot_index 0..11` の **12枠に正規化**
- 正規化処理は `shared/utils/slot.ts` に集約

---

## 12. Exhibit編集APIは PUT 中心（UIを単純化）
- 更新戦略は **PUTで統一（upsert）**：
  - `PUT /api/galleries/{gallery_id}/exhibits/{slot_index}/`
    - その枠が空なら作成
    - 既にあるなら置換（更新）
- 枠を空に戻す：
  - `DELETE /api/galleries/{gallery_id}/exhibits/{slot_index}/`

---

## 13. 所有権・認可はフロントで頑張らない
- user/guestの分岐、所有、slot衝突などはサーバ側で担保
- フロント側の責務は以下だけ：
  - ゲスト時に `X-Guest-Id` を漏れなく送る
  - ユーザー時に `credentials` を送る
  - payloadに owner/guest_id を含めない（サーバーが決定）

---

## 14. 🔴 重要な設計確定事項（仕様）
- 論理削除は正式仕様
- 部分ユニーク制約は必須
- Guestは **1 Galleryのみ**
- Exhibit slot は **有効データ1つのみ**

---

## 15. 実装の基本原則（短縮版）
1. guest/user差分は API層に閉じ込める  
2. 12枠は slot_index で正規化する  
3. Exhibitは PUT upsert でUIを簡単にする  
4. 所有チェックはバックエンドに任せる  
5. 公開と編集を分離する  
6. **API境界の型は `paths` から**  
7. **ドメイン型は `components/schemas` から**  
8. **型の import 起点は `/shared/types/fromBackend` に統一**
