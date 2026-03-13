import { cn } from "@/shared/utils/cn";
import type { Gallery } from "@/features/galleries/api";
import { GalleryCard } from "./GalleryCard";

type Props = {
  galleries: Gallery[];
  onOpen?: (id: string) => void;
  className?: string;
  emptyTitle?: string;
  emptyMessage?: string;
};

export function GalleryGrid(props: Props) {
  const galleries = props.galleries ??[];

  if (galleries.length === 0) {
    return (
      <div
        className={cn(
          "rounded-[2rem] border-2 border-dashed border-brand-border-strong bg-brand-surface p-12 flex flex-col items-center justify-center text-center",
          props.className
        )}
      >
        <div className="text-xl font-extrabold text-brand-text tracking-tight">
          {props.emptyTitle ?? "No galleries yet"}
        </div>
        <div className="mt-3 text-sm font-medium text-brand-text-muted max-w-sm leading-relaxed">
          {props.emptyMessage ?? "Create your first gallery to start displaying your acrylic stands."}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        props.className
      )}
    >
      {galleries.map((g) => (
        <GalleryCard key={g.id} gallery={g} onOpen={props.onOpen} />
      ))}
    </div>
  );
}