// src/app/routes/app/studio/StudioPage.tsx
import { StudioExhibitEditor } from "./components/StudioExhibitEditor";

export function StudioPage() {
  return (
    // heightの固定計算をやめ、h-full と min-h-0 に変更
    <div className="h-full w-full relative flex flex-col bg-brand-bg min-h-0">
      <StudioExhibitEditor />
    </div>
  );
}