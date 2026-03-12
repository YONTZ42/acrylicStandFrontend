# Digital Miniature Museum
## MVP仕様書

---

## 1. システム構成

### フロントエンド
- WebGPU（展示室描画） by playcanvas
- React / Vite / tailwind

### バックエンド
- Django REST API on AWS App Runner
- PostgreSQL on Neon

---

## 2. データモデル

### Gallery

| フィールド | 型 | 説明 |
|------------|----|------|
| id | UUID | 主キー |
| slug | string | 公開URL用ランダム文字列 |
| owner_type | string | "guest" or "user" |
| owner_id | string | guest_id or user_id |
| title | string | ギャラリー名 |
| layout_cols | int | デフォルト3 |
| layout_rows | int | デフォルト4 |
| is_public | bool | 公開状態 |
| cover_render_url | string | 一覧用サムネイル |
| created_at | datetime | 作成日時 |

---

### Exhibit

| フィールド | 型 | 説明 |
|------------|----|------|
| id | UUID | 主キー |
| gallery_id | FK | Gallery参照 |
| slot_index | int | 0〜11 |
| image_original_url | string | 元画像 |
| image_cutout_png_url | string | 透過PNG |
| style | string | pop / pixel |
| title | string | 任意 |
| description | string | 任意 |
| created_at | datetime | 作成日時 |

---

## 3. URL設計

/                → My Galleries  
/g/{slug}       → Gallery Viewer  

---

## 4. ゲスト仕様

- 初回アクセス時にUUID生成
- localStorageに保存
- APIリクエストに `X-Guest-Id` ヘッダ付与
- owner一致で編集UI表示

---

## 5. ギャラリー仕様

### レイアウト
- 3×4固定（12枠）
- DB上は可変設計

### 展示室
- ダーク背景
- 固定テンプレ空間
- 展示枠12個
- 中央揃え

---

## 6. 展示物（ガラス封入）

### 構造
- 外側：透明ガラスブロック
- 内側：画像プレーン
- 軽い反射
- 控えめな影

### インタラクション
- スマホ体験重視
-　日本指操作対応
- hoverで微回転
- クリックで拡大表示

---

## 7. 公開仕様

- /g/{slug} で閲覧可能
- いいね無し
- コメント無し
- 閲覧数非表示
- 所有者のみ編集UI表示

---

## 8. 編集機能（所有者のみ）

- Add Exhibit
- Replace Exhibit
- Delete Exhibit
- Title編集
- Description編集
- 公開切替

---

## 9. パフォーマンス設計

- 一覧は静止サムネ表示
- WebGPUはViewerのみ起動
- テクスチャ圧縮
- 軽量シャドウ

---

## 10. 非機能要件

- モバイル対応
- 初期表示3秒以内
- 12作品安定描画
