
* `/app` は SPA のアプリ本体
* `/g/:slug` は公開Viewer
* LPで guest を発行して `X-Guest-Id` を使う既存仕様は維持する 
* DB は **Gallery 1 : N Exhibit**
* Collection は「選択中 Gallery に紐づく Exhibit 一覧」
* Exhibit 詳細は **モーダル**
* `AppHome` 中心の state 分岐はやめる

---

# アクスタUGCアプリ フロントエンド再設計書 v1

## 1. 目的

既存の `/app -> AppHome -> activeTab 分岐` 構成を廃止し、
`/app` を **AppShell 配下の SPA** として再設計する。

狙いは3つ。

1. URL と画面状態を一致させる
2. Gallery / Studio を独立したワークスペースとして整理する
3. Collection と Exhibit 詳細を Gallery 文脈の中で自然に扱う

---

## 2. 情報設計

### 2.1 ドメイン整理

#### Gallery

* 棚
* 展示単位
* 公開URLの親
* 12枠の展示面を持つ

#### Exhibit

* 単体のアクスタ
* Gallery に属する
* slot_index を持つ
* 編集対象の最小単位

#### Collection

* 独立した別データではない
* **選択中 Gallery に属する Exhibit 一覧ビュー**
* Shelf view の対になる list/grid view

---

## 3. URL設計

### 公開ルート

* `/`

  * LP
* `/login`

  * ログイン
* `/register`

  * 登録
* `/g/:slug`

  * 公開Viewer

### アプリルート

* `/app`

  * `/app/galleries` にリダイレクト
* `/app/galleries`

  * Gallery 一覧
* `/app/galleries/:galleryId`

  * Gallery ワークスペース
* `/app/studio`

  * アクスタ作成・編集ワークスペース

これで十分。
Collection は独立URLを持たず、`/app/galleries/:galleryId` 内の表示モードとして扱う。

---

## 4. AppRouter設計

## 4.1 方針

* トップレベルで route を直置きしない
* layout route を使う
* `/app` は `AppShellLayout`
* `/g/:slug` は `ViewerLayout`
* `AppHome` は廃止

## 4.2 ルートツリー

```tsx
<BrowserRouter>
  <Routes>
    <Route element={<RootLayout />}>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/g/:slug" element={<ViewerLayout />}>
        <Route index element={<PublicGalleryPage />} />
      </Route>

      <Route path="/app" element={<AppShellLayout />}>
        <Route index element={<Navigate to="galleries" replace />} />

        <Route path="galleries">
          <Route index element={<GalleriesPage />} />
          <Route path=":galleryId" element={<GalleryWorkspacePage />} />
        </Route>

        <Route path="studio" element={<StudioPage />} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Route>
  </Routes>
</BrowserRouter>
```

---

## 5. AppShellLayout設計

## 5.1 役割

`/app` 配下の共通殻。
ここでアプリ全体の枠を持つ。

### 責務

* auth ready 待ち
* 共通ヘッダー表示
* ボトムタブ表示
* `<Outlet />` 描画
* 将来の toast / overlay 基盤置き場

## 5.2 レイアウト構成

```tsx
<div className="min-h-dvh bg-black text-white">
  <AppHeader />
  <main className="pb-20">
    <Outlet />
  </main>
  <AppBottomTabs />
</div>
```

## 5.3 auth 初期化

`/app` 入場時に guest を保証する現在方針は維持。
ただし `AppHome` ではなく `AppShellLayout` で待機/初期化する。
LP でも guest 発行を行う現行仕様と整合する 

---

## 6. タブ設計

## 6.1 タブ数

MVP は **2タブ** にする。

* Galleries
* Studio

Collection は独立タブにしない。

## 6.2 理由

Collection を独立させると、
「Gallery が親なのか Collection が親なのか」がぶれる。

今の DB が `Gallery -> Exhibit` なので、
Collection は Gallery 詳細の中の表示モードに寄せるのが自然。

## 6.3 タブUI

`AppBottomTabs` は state を受け取るのでなく、**NavLink ベース**に変える。

* `/app/galleries`
* `/app/studio`

active 判定は router に任せる。

---

## 7. Galleryワークスペース設計

## 7.1 `/app/galleries`

### 目的

Gallery一覧を表示する入口。

### 構成

* ページタイトル
* `CreateGalleryButton`
* `GalleryGrid`

### 使用コンポーネント

* `useGalleriesList`
* `GalleryGrid`
* `GalleryCard`
* `CreateGalleryButton`

既存の `GalleryLibraryTab` の責務をここへ移す。

---

## 7.2 `/app/galleries/:galleryId`

### 目的

1つの Gallery を中心に、展示と一覧を切り替えながら扱う。

### 画面上部

* Back
* Gallery title
* 公開設定ボタン
* 共有ボタン
* 設定ボタン

### 中央の表示切替

* `Shelf`
* `Collection`

この2つを segmented control か tabs で切り替える。

---

## 8. GalleryWorkspacePage詳細設計

## 8.1 内部state

ルーティングは `galleryId` だけ URL に持つ。
その上で UI state として持つのは次だけ。

* `viewMode: "shelf" | "collection"`
* `selectedExhibit: Exhibit | null`
* `isExhibitDetailOpen: boolean`
* `isEditorOpen: boolean`
* `editingSlotIndex: number | null`

## 8.2 取得データ

* `useGalleryDetail(galleryId)`
* `normalizedExhibits`

既存の `GalleryDetailTab` のコア責務はそのまま引き継ぐ。

---

## 9. Shelf view 設計

## 9.1 役割

Gallery を「棚」として見せる主ビュー。

## 9.2 表示内容

* 12スロットの2Dグリッド
* WebGPU棚プレビュー
* 選択中スロットの簡易情報

## 9.3 操作

* 空スロット押下

  * `ExhibitEditorModal` を新規作成モードで開く
* 既存スロット押下

  * `ExhibitDetailModal` を開く
* 設定ボタン押下

  * `GallerySettingsModal`

## 9.4 使用コンポーネント

* `SlotGrid`
* `SlotCard`
* `PlaycanvasExhibits`
* `GallerySettingsModal`
* `ExhibitEditorModal`
* `ExhibitDetailModal`（新規）

---

## 10. Collection view 設計

## 10.1 役割

同一 Gallery に属する Exhibit 一覧を、軽い一覧表示で見る。

## 10.2 表示内容

* Exhibit カードグリッド
* サムネイル
* title
* style/material
* updatedAt
* slot_index

## 10.3 表示方針

ここでは **リアルタイム WebGPU を回さない**。
保存済みスナップショットまたは軽量 preview 画像を使う。

## 10.4 操作

* カード押下

  * `ExhibitDetailModal`
* `+ 新規作成`

  * `ExhibitEditorModal`
* ソート

  * 新しい順 / slot順

---

## 11. ExhibitDetailModal設計

## 11.1 位置づけ

Exhibit 詳細は route ではなくモーダル。
親文脈は常に `GalleryWorkspacePage` に残す。

## 11.2 表示内容

* 大きな単体プレビュー
* 可能なら単体WebGPU表示
* title
* description
* style/material 情報
* slot_index
* 更新日時

## 11.3 アクション

* 編集
* 削除
* 共有（将来）
* 実物発注（将来）

## 11.4 利点

* Gallery文脈が残る
* URLが増えない
* いまのMVPに合う
* `galleryId + slotIndex` をURLに露出しなくていい

---

## 12. StudioPage設計

## 12.1 目的

アクスタ生成・編集の専用ワークスペース。

## 12.2 役割

既存の `ExhibitEditorModal` を中心にしつつ、
単なる modal ではなく「作成導線の中心」にする。

## 12.3 画面構成

左

* 画像編集ツール
* 切り抜き
* 背景編集
* AI変換
* 質感設定

右

* 2D preview / WebGPU preview
* 保存先Gallery選択
* 保存ボタン

## 12.4 保存フロー

1. 画像編集
2. Gallery選択
3. 空きslotを決定
4. `upsertExhibit`
5. 保存後、対象 Gallery に遷移

### 保存後遷移

* `/app/galleries/:galleryId`
* 初期表示は `Collection` view でもよい

---

## 13. 画面遷移フロー

## 13.1 Galleryから作成

`/app/galleries/:galleryId`
→ 空スロット押下
→ `ExhibitEditorModal`
→ 保存
→ 同じ Gallery に反映

## 13.2 Studioから作成

`/app/studio`
→ 画像編集
→ 保存先 Gallery 選択
→ 保存
→ `/app/galleries/:galleryId`

## 13.3 Collectionから詳細

`/app/galleries/:galleryId`
→ Collection view
→ Exhibit card 押下
→ `ExhibitDetailModal`

---

## 14. 新ディレクトリ構成

```text
src/
  app/
    AppRouter.tsx

    providers/
      AuthProvider.tsx
      QueryProvider.tsx
      ToastProvider.tsx

    layouts/
      RootLayout.tsx
      MarketingLayout.tsx
      ViewerLayout.tsx
      AppShellLayout.tsx
      AppHeader.tsx
      AppBottomTabs.tsx

    routes/
      marketing/
        LandingPage.tsx

      auth/
        LoginPage.tsx
        RegisterPage.tsx

      viewer/
        PublicGalleryPage.tsx

      app/
        galleries/
          GalleriesPage.tsx
          GalleryWorkspacePage.tsx
          components/
            GalleryViewSwitch.tsx
            GalleryShelfView.tsx
            GalleryCollectionView.tsx

        studio/
          StudioPage.tsx

      misc/
        NotFoundPage.tsx
```

---

## 15. 既存ファイルの移行方針

## 廃止

* `src/app/routes/app/AppHome.tsx`
* `src/app/routes/app/tabs/*`

今の AppHome は tab state と selectedGalleryId を内包していて、
URLと状態がズレる原因になっている。
この中心分岐は廃止する。

## 改名または吸収

* `GalleryLibraryTab.tsx` → `GalleriesPage.tsx`
* `GalleryDetailTab.tsx` → `GalleryWorkspacePage.tsx` の内部へ吸収

## そのまま活かす

* `features/galleries/hooks/*`
* `features/galleries/components/*`
* `features/exhibits/hooks/*`
* `features/exhibits/components/*`
* `shared/*`

`app` は組み立て専用、分岐やAPI知識は features に閉じ込める既存原則は維持する。

---

## 16. 主要コンポーネント責務

## AppRouter

* layout route 定義
* `/app` を AppShell にぶら下げる
* `/app` 直アクセス時は `/app/galleries` へリダイレクト

## AppShellLayout

* auth ready gate
* Header
* BottomTabs
* Outlet

## AppBottomTabs

* `NavLink` ベース
* state を受けない
* `galleries`, `studio` のみ

## GalleriesPage

* Gallery一覧
* Gallery作成導線

## GalleryWorkspacePage

* Gallery詳細取得
* `viewMode` 管理
* Exhibit detail modal 管理
* Exhibit editor modal 管理

## GalleryShelfView

* 12スロット表示
* WebGPU棚表示
* slot click action

## GalleryCollectionView

* Exhibit一覧表示
* snapshotカード
* modal open

## StudioPage

* アクスタ作成・編集UI
* 保存先Gallery選択
* 保存後遷移

## ExhibitDetailModal

* 単体詳細
* 編集/削除

---

## 17. 状態管理方針

## URLに載せるもの

* `galleryId`
* 現在のワークスペース

## URLに載せないもの

* `viewMode`
* `selectedExhibit`
* modal open/close
* editingSlotIndex

この方針で十分。
MVPでは過剰にURLを増やさない。

---

## 18. 実装順

### Step 1

* `AppRouter.tsx` を layout route 化
* `AppHome` をやめる
* `AppShellLayout` 新設

### Step 2

* `GalleriesPage` 作成
* `GalleryLibraryTab` を移植

### Step 3

* `GalleryWorkspacePage` 作成
* `GalleryDetailTab` を移植
* `viewMode` 切替追加

### Step 4

* `GalleryCollectionView` 作成
* Exhibit snapshot grid 実装

### Step 5

* `ExhibitDetailModal` 作成

### Step 6

* `StudioPage` を editor 中心に再構築

---

## 19. 最終判断

この構成の核はこれ。

* **Gallery が親**
* **Collection は Gallery 内ビュー**
* **Exhibit 詳細はモーダル**
* **`/app` は AppShell 配下のSPA**
* **AppHome 中心分岐は廃止**

この形が、今の DB 構造と MVP の重さ、そして将来のアクスタUGCアプリ化に一番合っている。

