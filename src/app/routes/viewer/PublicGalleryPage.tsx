// src/app/routes/viewer/PublicGalleryPage.tsx
import { Link, useParams } from "react-router-dom";
import type { components } from "@/shared/types/fromBackend/schema";
import { cn } from "@/shared/utils/cn";
import { usePublicGallery } from "@/features/galleries/hooks/usePublicGallery";
import { GalleryDetailPreview3D } from "@/features/exhibits/components/playcanvas/GalleryDetailPreview3D";

type ExhibitPublic = components["schemas"]["ExhibitPublic"];

type PlaycanvasNormalizedSlot = {
  imageOriginalUrl?: string | null;
  imageBackgroundUrl?: string | null;
  imageForegroundUrl?: string | null;
  title?: string | null;
  description?: string | null;
  styleConfig?: any | null; // Preview用に追加
} | null;

function normalizePublicSlots(
  exhibits: readonly ExhibitPublic[] | null | undefined,
): PlaycanvasNormalizedSlot[] {
  const slots: PlaycanvasNormalizedSlot[] = Array.from({ length: 12 }, () => null);

  for (const ex of exhibits ?? []) {
    if (typeof ex?.slotIndex !== "number") continue;
    if (ex.slotIndex < 0 || ex.slotIndex > 11) continue;

    slots[ex.slotIndex] = {
      imageOriginalUrl: ex.imageOriginalUrl ?? null,
      imageForegroundUrl: ex.imageForegroundUrl ?? null,
      imageBackgroundUrl: ex.imageBackgroundUrl ?? null,
      title: ex.title ?? null,
      description: ex.description ?? null,
      styleConfig: ex.styleConfig ?? { depth: 5, foregroundEffect: "none", backgroundEffect: "none" },
    };
  }

  return slots;
}

function ViewerState(props: {
  title: string;
  body?: string;
  loading?: boolean;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="min-h-screen bg-[#06070a] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
          <div className="text-xl font-bold">{props.title}</div>
          {props.body ? <div className="mt-3 text-sm text-white/60">{props.body}</div> : null}

          {props.loading ? (
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-yellow-400" />
            </div>
          ) : null}

          {props.actionHref && props.actionLabel ? (
            <div className="mt-8">
              <Link
                to={props.actionHref}
                className={cn(
                  "inline-flex rounded-full bg-white/10 px-6 py-2.5 text-sm font-bold text-white hover:bg-white/20 active:scale-[0.99] transition-all",
                )}
              >
                {props.actionLabel}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PublicGalleryPage() {
  const params = useParams<{ slug: string }>();
  const slug = (params.slug ?? "").trim();

  const q = usePublicGallery(slug || null);

  if (!slug) {
    return (
      <ViewerState
        title="Gallery not found"
        body="公開URLが不正です。slug が見つかりません。"
        actionHref="/"
        actionLabel="Back to top"
      />
    );
  }

  if (q.isLoading) {
    return (
      <ViewerState
        title="Loading gallery..."
        body="Preparing 3D Exhibition space."
        loading
      />
    );
  }

  if (q.isError || !q.data) {
    return (
      <ViewerState
        title="Gallery not found"
        body="この公開ギャラリーは存在しないか、現在は非公開に設定されています。"
        actionHref="/"
        actionLabel="Back to top"
      />
    );
  }

  const gallery = q.data;
  const normalizedSlots = normalizePublicSlots(gallery.exhibits);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      {/* Header */}
      <div className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="min-w-0 flex items-center gap-4">
             {gallery.coverRenderUrl && (
                <img src={gallery.coverRenderUrl} alt="Cover" className="w-10 h-10 rounded-lg object-cover border border-white/10 hidden sm:block" />
             )}
             <div>
                <div className="truncate text-base font-bold text-white">
                  {gallery.title?.trim() || "Public Gallery"}
                </div>
                <div className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-white/40">ID: {gallery.slug}</div>
             </div>
          </div>

          <Link
            to="/"
            className="shrink-0 rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-bold text-black hover:bg-yellow-300 transition-colors"
          >
            Create Your Own
          </Link>
        </div>
      </div>

      {/* Main 3D View */}
      <div className="flex-1 relative w-full h-full bg-black/80">
         <GalleryDetailPreview3D slots={normalizedSlots} />
      </div>
    </div>
  );
}