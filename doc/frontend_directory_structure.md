frontend/
  index.html
  package.json
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  public/
    favicon.svg
    ogp.png
  src/
    main.tsx

    app/
      AppRouter.tsx              # react-router 定義（/ /login /app /g/:slug）
      providers/
        QueryProvider.tsx        # TanStack Query
        ToastProvider.tsx
        AuthProvider.tsx         #/features/auth/AuthProvider.tsx のラッパー
      layouts/
        RootLayout.tsx           # 最上位（<Outlet/>）
        MarketingLayout.tsx      # LP用
        AppShellLayout.tsx       # /app 用（Header/Tab/Footer）
        ViewerLayout.tsx         # /g/:slug 用（必要なら）
      routes/
        marketing/
          LandingPage.tsx
        hooks/
          useLpExhibitStartFlow.ts
        auth/
          LoginPage.tsx
          RegisterPage.tsx
        app/
          AppHome.tsx            # /app の枠（2タブの親）
          tabs/
            GalleryLibraryTab.tsx
            GalleryDetailTab.tsx
        viewer/
          PublicGalleryPage.tsx  # /g/:slug（閲覧）

    features/
      auth/
        api.ts                   # POST /api/auth/guest/ など
        storage.ts               # shared/auth/storage.tsからインポート
        useAuth.ts               # guest/user状態hook
        AuthProvider.tsx         # auth state（guest/user）

      galleries/
        api.ts                   # GET/POST/PATCH/DELETE galleries
        hooks/
          index.ts
          key.ts
          useCreateGallery.ts
          useDeleteGallery.ts
          useGalleriesList.ts
          useGalleryDetail.ts
          usePublicGallery.ts
          useUpdateGallery.ts
        components/
          CreateGalleryModal.tsx
          GalleryCard.tsx
          GalleryGrid.tsx
          CreateGalleryButton.tsx
          GallerySettingsModal.tsx

      exhibits/
        api.ts                   # POST/PUT/DELETE exhibits（slot_index駆動）
        hooks/
          index.ts
          keys.ts
          useExhibitImageUpload.ts
          useUpsertExhibit.ts
          useDeleteExhibit.ts
        components/
          PlaycanvasExhibits.tsx
          ExhibitSlots2DModal/
            ExhibitSlots2DModal.tsx
            SlotGrid.tsx
            SlotCard.tsx
          ExhibitEditorModal/
            ExhibitEditorButton.tsx
            ExhibitPublishButton.tsx
            ExhibitEditorModal.tsx
            ImagePicker.tsx
            TitleDescriptionForm.tsx
            StylePicker.tsx
          playcanvas/
            app.ts
            camera.ts
            environment.ts
            utils.ts
            index.ts
            PlaycanvasExhibits.tsx


    shared/
      api/
        http.ts                   # fetch/axios wrapper（X-Guest-Id 付与）
        endpoints.ts              # パス定義
        errors.ts                 # APIエラー共通
      auth/
        storage.ts                # localStorage keys, guest_id 永続化
      components/
        PhotoCutoutPanel/
          PhotoCutoutPanel.tsx
          PhotoCutoutHeader.tsx
          PhotoCutoutStage.tsx
          PhotoCutoutEmptyState.tsx
        ImagePicker.tsx
      hooks/
        useDisclosure.ts
        useMediaQuery.ts
        useImageEditorState.ts
        useKonvaDraw.ts
      utils/
        cn.ts                     # className結合
        slot.ts                   # slot_index補完（0..11）
        url.ts
        imageProcessing.ts
        imageProcessingFromLambda.ts
        imageCropMultiObjects.ts
        lambdaClient.ts
      styles/
        globals.css

    types/
      fromBackend/
        schema.ts
      local/
        schema.ts
