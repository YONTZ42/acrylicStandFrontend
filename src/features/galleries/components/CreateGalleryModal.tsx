import { useEffect, useMemo, useState, useRef } from "react";
import { cn } from "@/shared/utils/cn";
import { useToast } from "@/app/providers/ToastProvider";
import { useCreateGallery } from "@/features/galleries/hooks";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import type { CreateGalleryReq } from "@/features/galleries/api";
import { ImageIcon, Loader2 } from "lucide-react";

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
  const { uploadImageAndGetUrl, isUploading } = useExhibitImageUpload();

  const[title, setTitle] = useState(props.defaultTitle ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!props.open) {
      setTitle(props.defaultTitle ?? "");
      setCoverFile(null);
      setCoverPreviewUrl(null);
    }
  },[props.open, props.defaultTitle]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreviewUrl(URL.createObjectURL(file));
    }
  };

  const busy = m.isPending || isUploading;

  const canCreate = useMemo(() => {
    return title.trim().length > 0 && !busy;
  },[title, busy]);

  async function onCreate() {
    if (!canCreate) return;
    try {
      let uploadedCoverUrl = "";
      if (coverFile) {
        uploadedCoverUrl = await uploadImageAndGetUrl(coverFile);
      }

      const body: CreateGalleryReq = {
        title: title.trim(),
        isPublic: false,
        coverRenderUrl: uploadedCoverUrl || undefined,
      } as unknown as CreateGalleryReq;

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
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", props.className)} role="dialog" aria-modal="true">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-brand-text/20 backdrop-blur-sm transition-opacity"
        onClick={() => (busy ? null : props.onClose())}
      />

      <div className="relative w-full max-w-md rounded-[2rem] border border-brand-border bg-brand-surface p-8 shadow-xl">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-brand-text tracking-tight">Create Gallery</h2>
          <p className="mt-1.5 text-sm font-medium text-brand-text-muted">
            Set up a new space for your exhibits.
          </p>
        </div>

        <div className="space-y-6">
          {/* Title Input */}
          <label className="block">
            <div className="text-xs font-extrabold tracking-wide text-brand-text-muted mb-2 uppercase">Title</div>
            <input
              className={cn(
                "w-full rounded-2xl border border-brand-border-strong bg-brand-bg-soft px-4 py-3.5 text-sm font-bold text-brand-text",
                "placeholder:text-brand-text-soft focus:outline-none focus:border-brand-primary focus:bg-white transition-all shadow-sm",
                "disabled:opacity-60"
              )}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Acrylic Collection"
              disabled={busy}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && canCreate) onCreate();
                if (e.key === "Escape") props.onClose();
              }}
            />
          </label>

          {/* Cover Image Upload */}
          <div>
            <div className="text-xs font-extrabold tracking-wide text-brand-text-muted mb-2 uppercase">Cover Image (Optional)</div>
            <div 
              className={cn(
                "relative w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all",
                coverPreviewUrl 
                  ? "border-brand-border bg-brand-bg-soft" 
                  : "border-brand-border-strong bg-brand-bg hover:bg-brand-primary-soft hover:border-brand-primary cursor-pointer"
              )}
              onClick={() => !coverPreviewUrl && fileInputRef.current?.click()}
            >
              {coverPreviewUrl ? (
                <>
                  <img src={coverPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreviewUrl(null); }}
                    className="absolute top-3 right-3 bg-brand-surface/90 text-brand-text text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-brand-surface transition-colors"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-brand-text-muted">
                  <ImageIcon size={28} strokeWidth={1.5} className="text-brand-primary" />
                  <span className="text-xs font-bold">Click to upload cover</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={busy}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-end gap-3">
          <button
            type="button"
            className="rounded-full bg-brand-bg-soft border border-brand-border px-6 py-2.5 text-sm font-bold text-brand-text hover:bg-brand-border transition-all disabled:opacity-50"
            onClick={props.onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-brand-primary px-8 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-hover shadow-md shadow-brand-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
            onClick={onCreate}
            disabled={!canCreate}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            {busy ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}