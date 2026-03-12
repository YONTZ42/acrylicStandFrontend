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
  const galleries = props.galleries ?? [];

  if (galleries.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-white/5 p-6 text-center",
          props.className
        )}
      >
        <div className="text-sm font-semibold text-white">{props.emptyTitle ?? "No galleries"}</div>
        <div className="mt-1 text-sm text-white/70">
          {props.emptyMessage ?? "Create your first gallery to start exhibiting."}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
        props.className
      )}
    >
      {galleries.map((g) => (
        <GalleryCard key={g.id} gallery={g} onOpen={props.onOpen} />
      ))}
    </div>
  );
}
