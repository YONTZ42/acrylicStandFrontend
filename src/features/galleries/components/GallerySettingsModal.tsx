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
  },[props.open, g?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", props.className)} role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-brand-text/20 backdrop-blur-sm transition-opacity"
        onClick={() => (busy ? null : props.onClose())}
      />

      <div className="relative w-full max-w-md rounded-[2rem] border border-brand-border bg-brand-surface p-8 shadow-xl">
        <div className="flex flex-col mb-8 gap-2">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-extrabold text-brand-text tracking-tight">Gallery Settings</h2>
            <button
              type="button"
              className="rounded-full bg-brand-bg-soft px-4 py-2 text-sm font-bold text-brand-text hover:bg-brand-border transition-all active:scale-95 disabled:opacity-50"
              onClick={props.onClose}
              disabled={busy}
            >
              Close
            </button>
          </div>
          <div className="inline-flex self-start items-center text-xs font-bold text-brand-text-muted bg-brand-bg-soft px-3 py-1 rounded-full border border-brand-border-strong">
            {detail.isLoading ? "Loading..." : g ? `slug: ${g.slug}` : "Not found"}
          </div>
        </div>

        <div className="space-y-6">
          <label className="block">
            <div className="text-xs font-extrabold tracking-wide text-brand-text-muted mb-2 uppercase">Title</div>
            <input
              className={cn(
                "w-full rounded-2xl border border-brand-border-strong bg-brand-bg-soft px-4 py-3.5 text-sm font-bold text-brand-text",
                "placeholder:text-brand-text-soft focus:outline-none focus:border-brand-primary focus:bg-white transition-all shadow-sm",
                "disabled:opacity-60",
              )}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Gallery title"
              disabled={busy || !g}
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-brand-border-strong bg-brand-bg-soft px-5 py-4 cursor-pointer hover:bg-white transition-colors">
            <div>
              <div className="text-sm font-extrabold text-brand-text">Public</div>
              <div className="text-xs font-medium text-brand-text-muted mt-0.5">Anyone with the link can view</div>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 accent-brand-primary cursor-pointer"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={busy || !g}
            />
          </label>

          {isPublic && g?.slug ? (
            <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary-soft p-5 shadow-sm">
              <div className="text-xs font-extrabold text-brand-primary uppercase tracking-wide">Public URL</div>
              <div className="mt-1.5 break-all text-sm font-bold text-brand-text">{publicUrl}</div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-full bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-primary-hover active:scale-95 transition-all"
                  onClick={onCopyPublicUrl}
                >
                  Copy URL
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white border border-brand-primary/20 px-5 py-2 text-xs font-bold text-brand-primary hover:bg-brand-bg-soft active:scale-95 transition-all"
                >
                  Open
                </a>
              </div>

              {!g.isPublic ? (
                <div className="mt-4 text-xs font-bold text-brand-text-muted bg-white/50 px-3 py-2 rounded-xl border border-brand-primary/10">
                  SaveするとこのURLで公開されます。
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between gap-2">
          <button
            type="button"
            className="rounded-full bg-brand-secondary/10 px-5 py-2.5 text-sm font-bold text-brand-secondary hover:bg-brand-secondary/20 active:scale-95 transition-all disabled:opacity-50"
            onClick={onDelete}
            disabled={busy || !g}
          >
            Delete
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full bg-brand-bg-soft border border-brand-border px-5 py-2.5 text-sm font-bold text-brand-text hover:bg-brand-border active:scale-95 transition-all disabled:opacity-50"
              onClick={props.onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-full bg-brand-primary px-8 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              onClick={onSave}
              disabled={!canSave}
            >
              {update.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {detail.isError ? (
          <div className="mt-4 rounded-xl border border-brand-secondary/30 bg-brand-secondary/10 px-4 py-3 text-sm font-bold text-brand-secondary">
            Failed to load gallery.
          </div>
        ) : null}
      </div>
    </div>
  );
}