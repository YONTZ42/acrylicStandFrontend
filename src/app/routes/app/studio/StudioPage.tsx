import { StudioExhibitEditor } from "./components/StudioExhibitEditor";

export function StudioPage() {
  return (
    <div className="h-[calc(100dvh-56px-68px)] w-full relative flex flex-col bg-brand-bg">
      <StudioExhibitEditor />
    </div>
  );
}