import  { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useToast } from "@/app/providers/ToastProvider";
import { useCreateGallery } from "@/features/galleries/hooks";
import type { CreateGalleryReq } from "@/features/galleries/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (galleryId: string) => void;
  className?: string;
  defaultTitle?: string;
};

export function CreateGalleryModal(props: Props) {
  const toast = useToast();
  const m = useCreateGallery();

  const [title, setTitle] = useState(props.defaultTitle ?? "");

  useEffect(() => {
    if (!props.open) return;
    setTitle(props.defaultTitle ?? "");
  }, [props.open, props.defaultTitle]);

  const busy = m.isPending;

  const canCreate = useMemo(() => {
    return title.trim().length > 0 && !busy;
  }, [title, busy]);

  const body: CreateGalleryReq = useMemo(() => {
    // サーバが受け取る想定フィールドのみ（型境界で cast）
    return {
      title: title.trim(),
      isPublic: false,
    } as unknown as CreateGalleryReq;
  }, [title]);

  async function onCreate() {
    try {
      const created = await m.mutateAsync(body);
      const id = (created as any)?.id as string | undefined;

      toast.success("Gallery created", { title: "Success" });
      props.onClose();
      if (id) props.onCreated?.(id);
    } catch {
      toast.error("Failed to create gallery", { title: "Error" });
    }
  }

  if (!props.open) return null;

  return (
    <div className={cn("fixed inset-0 z-50", props.className)} role="dialog" aria-modal="true">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => (busy ? null : props.onClose())}
      />

      {/* panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0f19] p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-white">Create gallery</div>
              <div className="mt-0.5 text-sm text-white/60">
                Enter a title to create a new gallery.
              </div>
            </div>

            <button
              type="button"
              className={cn(
                "rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white/80",
                "hover:bg-white/15 active:scale-[0.99]",
                "disabled:opacity-50"
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
                  "disabled:opacity-60"
                )}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Mini Museum"
                disabled={busy}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canCreate) onCreate();
                  if (e.key === "Escape") props.onClose();
                }}
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              className={cn(
                "rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/80",
                "hover:bg-white/15 active:scale-[0.99]",
                "disabled:opacity-50"
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
                "disabled:opacity-50"
              )}
              onClick={onCreate}
              disabled={!canCreate}
            >
              {busy ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
