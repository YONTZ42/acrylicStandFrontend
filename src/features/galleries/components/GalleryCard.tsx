
import { cn } from "@/shared/utils/cn";
import type { Gallery } from "@/features/galleries/api";

type Props = {
  gallery: Gallery;
  onOpen?: (id: string) => void;
  className?: string;
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

export function GalleryCard(props: Props) {
  const g = props.gallery;

  const title = (g.title && g.title.trim().length > 0 ? g.title : "Untitled") as string;
  const isPublic = !!g.isPublic;

  return (
    <button
      type="button"
      className={cn(
        "group w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-left shadow-sm",
        "transition hover:bg-white/8 active:scale-[0.99]",
        "focus:outline-none focus:ring-2 focus:ring-sky-400/50",
        props.className
      )}
      onClick={() => props.onOpen?.(g.id)}
    >
      <div className="flex gap-3">
        {/* Cover */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
          {g.coverRenderUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={g.coverRenderUrl}
              alt={title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-white/50">
              no cover
            </div>
          )}

          <div
            className={cn(
              "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-medium",
              isPublic ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/70"
            )}
          >
            {isPublic ? "Public" : "Private"}
          </div>
        </div>

        {/* Meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{title}</div>
              <div className="mt-0.5 text-xs text-white/60">
                Updated {formatDate(g.updatedAt)}
              </div>
            </div>

            <div className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70">
              {g.exhibits?.length ?? 0} items
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="truncate rounded-lg bg-black/20 px-2 py-1 text-[11px] text-white/60">
              slug: {g.slug}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
