import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useToast } from "@/app/providers/ToastProvider";
import { useDeleteGallery, useGalleryDetail, useUpdateGallery } from "@/features/galleries/hooks";
import type { PatchGalleryReq } from "@/features/galleries/api";

type Props = {
  open: boolean;
  onClose: () => void;
  galleryId: string;
  className?: string;
};

export function GallerySettingsModal(props: Props) {
  const toast = useToast();

  const detail = useGalleryDetail(props.open ? props.galleryId : null);
  const update = useUpdateGallery();
  const del = useDeleteGallery();

  const g = detail.data;

  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (!props.open) return;
    if (!g) return;

    setTitle((g.title ?? "").toString());
    setIsPublic(!!g.isPublic);
  }, [props.open, g?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const busy = detail.isLoading || update.isPending || del.isPending;

  const canSave = useMemo(() => {
    if (!g) return false;
    const nextTitle = title.trim();
    const curTitle = (g.title ?? "").toString().trim();
    const changed = nextTitle !== curTitle || isPublic !== !!g.isPublic;
    return changed && !busy;
  }, [g, title, isPublic, busy]);

  const publicUrl = useMemo(() => {
    if (!g?.slug) return "";
    if (typeof window === "undefined") return `/g/${g.slug}`;
    return `${window.location.origin}/g/${g.slug}`;
  }, [g?.slug]);

  async function onSave() {
    if (!g) return;

    const body: PatchGalleryReq = {
      title: title.trim() || undefined,
      isPublic,
    } as unknown as PatchGalleryReq;

    try {
      await update.mutateAsync({ id: g.id, body });
      toast.success("Saved", { title: "Gallery" });
      props.onClose();
    } catch {
      toast.error("Failed to save", { title: "Gallery" });
    }
  }

  async function onDelete() {
    const ok = window.confirm("Delete this gallery? This cannot be undone.");
    if (!ok) return;

    try {
      await del.mutateAsync({ id: props.galleryId });
      toast.success("Deleted", { title: "Gallery" });
      props.onClose();
    } catch {
      toast.error("Failed to delete", { title: "Gallery" });
    }
  }

  async function onCopyPublicUrl() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Copied public URL", { title: "Gallery" });
    } catch {
      toast.error("Failed to copy URL", { title: "Gallery" });
    }
  }

  if (!props.open) return null;

  return (
    <div className={cn("fixed inset-0 z-50", props.className)} role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => (busy ? null : props.onClose())}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0f19] p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-white">Gallery settings</div>
              <div className="mt-0.5 text-sm text-white/60">
                {detail.isLoading ? "Loading..." : g ? `slug: ${g.slug}` : "Not found"}
              </div>
            </div>

            <button
              type="button"
              className={cn(
                "rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white/80",
                "hover:bg-white/15 active:scale-[0.99]",
                "disabled:opacity-50",
              )}
              onClick={props.onClose}
              disabled={busy}
            >
              Close
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <label className="block">
              <div className="text-xs font-semibold text-white/70">Title</div>
              <input
                className={cn(
                  "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white",
                  "placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/40",
                  "disabled:opacity-60",
                )}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Gallery title"
                disabled={busy || !g}
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <div>
                <div className="text-sm font-semibold text-white">Public</div>
                <div className="text-xs text-white/60">Anyone with the link can view</div>
              </div>

              <input
                type="checkbox"
                className="h-5 w-5 accent-sky-400"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={busy || !g}
              />
            </label>

            {isPublic && g?.slug ? (
              <div className="rounded-xl border border-sky-400/20 bg-sky-400/5 p-3">
                <div className="text-xs font-semibold text-sky-200">Public URL</div>
                <div className="mt-1 break-all text-sm text-white/80">{publicUrl}</div>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className={cn(
                      "rounded-lg bg-sky-500/20 px-3 py-2 text-xs font-semibold text-sky-200",
                      "hover:bg-sky-500/25 active:scale-[0.99]",
                    )}
                    onClick={onCopyPublicUrl}
                  >
                    Copy URL
                  </button>

                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white/80",
                      "hover:bg-white/15 active:scale-[0.99]",
                    )}
                  >
                    Open
                  </a>
                </div>

                {!g.isPublic ? (
                  <div className="mt-2 text-xs text-white/50">
                    SaveするとこのURLで公開されます。
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              className={cn(
                "rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-200",
                "hover:bg-rose-500/20 active:scale-[0.99]",
                "disabled:opacity-50",
              )}
              onClick={onDelete}
              disabled={busy || !g}
            >
              Delete
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  "rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/80",
                  "hover:bg-white/15 active:scale-[0.99]",
                  "disabled:opacity-50",
                )}
                onClick={props.onClose}
                disabled={busy}
              >
                Cancel
              </button>

              <button
                type="button"
                className={cn(
                  "rounded-xl bg-sky-500/20 px-3 py-2 text-sm font-semibold text-sky-200",
                  "hover:bg-sky-500/25 active:scale-[0.99]",
                  "disabled:opacity-50",
                )}
                onClick={onSave}
                disabled={!canSave}
              >
                {update.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {detail.isError ? (
            <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              Failed to load gallery.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}