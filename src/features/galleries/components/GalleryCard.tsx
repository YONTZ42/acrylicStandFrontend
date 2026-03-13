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
        "group flex flex-col w-full rounded-[2rem] overflow-hidden text-left shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-primary/10 hover:border-brand-primary active:scale-95",
        "focus:outline-none focus:ring-4 focus:ring-brand-primary-soft bg-brand-surface border border-brand-border",
        props.className
      )}
      onClick={() => props.onOpen?.(g.id)}
    >
      {/* Background Cover Area */}
      <div className="relative w-full aspect-[4/3] bg-brand-bg-soft overflow-hidden border-b border-brand-border">
        {g.coverRenderUrl ? (
          <img
            src={g.coverRenderUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
             <div className="w-16 h-16 border-4 border-dashed border-brand-text-muted rounded-full"></div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div
            className={cn(
              "rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-widest uppercase shadow-sm backdrop-blur-md",
              isPublic 
                ? "bg-brand-mint/90 text-white border border-brand-mint/20" 
                : "bg-white/90 text-brand-text-muted border border-brand-border"
            )}
          >
            {isPublic ? "Public" : "Private"}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative p-5 w-full bg-brand-surface">
        <h3 className="text-lg font-extrabold text-brand-text truncate group-hover:text-brand-primary transition-colors">{title}</h3>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs font-extrabold text-brand-primary bg-brand-primary-soft border border-brand-border-strong px-3 py-1 rounded-full">
            {g.exhibits?.length ?? 0} Exhibits
          </div>
          <div className="text-[10px] text-brand-text-soft uppercase tracking-widest font-bold">
            {formatDate(g.updatedAt)}
          </div>
        </div>
      </div>
    </button>
  );
}