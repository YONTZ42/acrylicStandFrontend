# 🔐 Auth機能拡張（dj-rest-auth + allauth 対応）

## 概要

-   Django側は **dj-rest-auth + django-allauth** を採用予定
-   フロントは JWT（/api/token/）＋ `/api/me/` で user を復元
-   Guest と User を共存させる設計
-   将来的に **Guest → User データ移行** を実装予定

------------------------------------------------------------------------

# 1. ディレクトリ構成変更

## 変更後構成

    src/
      shared/
        api/
          http.ts
          endpoints.ts
        auth/
          storage.ts
        types/fromBackend/
          schema.ts

      features/
        auth/
          api.ts
          useAuth.ts
          AuthProvider.tsx

      app/
        providers/
          AuthProvider.tsx

------------------------------------------------------------------------

# 2. shared/auth/storage.ts（新設）

## 管理キー

-   guest_id
-   access_token
-   refresh_token
-   guest_migration_done

## 責務

-   http.ts が毎回 readGuestId() を実行
-   Authorization / X-Guest-Id ヘッダ自動付与
-   guest → user 移行の実行管理

------------------------------------------------------------------------

# 3. http.ts 改修

## 変更点

-   毎回 localStorage から guestId / accessToken を取得
-   Bearer Token を自動付与
-   X-Guest-Id を自動付与
-   credentials: "include" を維持

------------------------------------------------------------------------

# 4. useAuth 再設計

## 責務

-   guestId の発行と保存
-   JWT login / refresh
-   /api/me/ による user 復元
-   guest → user 移行トリガー
-   logout 処理

------------------------------------------------------------------------

## ensureGuestId 改修

### 発生エラー

    Error: issueGuestId() did not return guest_id

### 原因

-   バックエンドのレスポンスキー揺れ
-   guestId が保存されていなかった

### 修正内容

-   extractGuestId 実装（キー揺れ対応）
-   writeGuestId を ensureGuestId 内で保証

------------------------------------------------------------------------

## login フロー

1.  /api/token/ 取得
2.  writeTokens()
3.  /api/me/ 取得
4.  migrateGuestToUser() 試行
5.  成功時 guestId 削除

------------------------------------------------------------------------

# 5. useLpExhibitStartFlow 修正

## 問題

-   CTAボタンが guestId 未発行のため disabled
-   openFromCta が発火しない

## 修正

-   disabled 条件を auth.isReady のみに変更
-   openFromCta 内で ensureGuestId() を実行

------------------------------------------------------------------------

# 6. 発生したバグと修正履歴

## ❌ ApiError: X-Guest-id required

### 原因

-   guestId 未保存
-   http.ts がヘッダ付与できなかった

### 修正

-   ensureGuestId 保存保証
-   http.ts が毎回 readGuestId() を実行する構造へ修正

------------------------------------------------------------------------

# 7. Guest → User データ移行設計

## 将来実装API

    POST /api/auth/migrate-guest/

## 要件

-   request.user.is_authenticated == True
-   X-Guest-Id 必須
-   冪等設計
-   成功後 guestId 削除

------------------------------------------------------------------------

# 8. 現在のAuth状態フロー

    App起動
      ↓
    restoreGuest()
      ↓
    restoreUser()
      ↓
    auth.isReady = true

    Guest:
      ensureGuestId() → storage保存

    User:
      login()
        ↓
      writeTokens
        ↓
      fetchMe
        ↓
      migrateGuestToUser

------------------------------------------------------------------------

# 現在の安定状態

-   Guest API 正常動作
-   X-Guest-Id 自動付与
-   JWT 自動付与
-   login / refresh 復元
-   CTA ボタン正常動作
-   ImagePicker 表示復旧
