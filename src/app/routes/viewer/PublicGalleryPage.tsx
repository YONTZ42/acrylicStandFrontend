// src/app/routes/viewer/PublicGalleryPage.tsx
import { Link, useParams } from "react-router-dom";
import type { components } from "@/shared/types/fromBackend/schema";
import { cn } from "@/shared/utils/cn";
import { usePublicGallery } from "@/features/galleries/hooks/usePublicGallery";
import { PlaycanvasExhibits } from "@/features/exhibits/components/playcanvas/PlaycanvasExhibits";

type ExhibitPublic = components["schemas"]["ExhibitPublic"];


 type PlaycanvasNormalizedSlot = {
   imageOriginalUrl?: string | null;
   imageBackgroundUrl?: string | null;
   imageForegroundUrl?: string | null;
   title?: string | null;
   description?: string | null;
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
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div className="text-xl font-semibold">{props.title}</div>
          {props.body ? <div className="mt-2 text-sm text-white/65">{props.body}</div> : null}

          {props.loading ? (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-sky-400/70" />
            </div>
          ) : null}

          {props.actionHref && props.actionLabel ? (
            <div className="mt-5">
              <Link
                to={props.actionHref}
                className={cn(
                  "inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/85",
                  "hover:bg-white/15 active:scale-[0.99]",
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
        body="公開ギャラリーを読み込んでいます。"
        loading
      />
    );
  }

  if (q.isError) {
    return (
      <ViewerState
        title="Failed to load gallery"
        body="通信に失敗しました。少し時間をおいて再度お試しください。"
        actionHref="/"
        actionLabel="Back to top"
      />
    );
  }

  if (!q.data) {
    return (
      <ViewerState
        title="Gallery not found"
        body="この公開ギャラリーは存在しないか、現在は非公開です。"
        actionHref="/"
        actionLabel="Back to top"
      />
    );
  }

  const gallery = q.data;
  console.log("public galleru", gallery);
  const normalizedSlots = normalizePublicSlots(gallery.exhibits);

  return (
    <div className="min-h-screen bg-[#06070a] text-white">
      <div className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">
              {gallery.title?.trim() || "Public Gallery"}
            </div>
            <div className="mt-1 truncate text-xs text-white/55">slug: {gallery.slug}</div>
          </div>

          <Link
            to="/"
            className={cn(
              "shrink-0 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/80",
              "hover:bg-white/15 active:scale-[0.99]",
            )}
          >
            Top
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="text-sm text-white/65">
            Public view. 編集UIは表示せず、公開中の展示のみを閲覧できます。
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl">
          <PlaycanvasExhibits normalizedSlots={normalizedSlots} />
        </div>
      </div>
    </div>
  );
}