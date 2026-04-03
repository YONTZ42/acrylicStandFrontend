import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useToast } from "@/app/providers/ToastProvider";
import { useDeleteGallery, useGalleryDetail, useUpdateGallery } from "@/features/galleries/hooks";
import type { PatchGalleryReq } from "@/features/galleries/api";
import { Copy, ExternalLink, Settings, Trash2, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  galleryId: string | null;
};

export function GallerySettingsModal({ open, onClose, galleryId }: Props) {
  const toast = useToast();
  const detail = useGalleryDetail(open ? galleryId : null);
  const update = useUpdateGallery();
  const del = useDeleteGallery();

  const g = detail.data;
  const [title, setTitle] = useState("");
  const[isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (!open || !g) return;
    setTitle((g.title ?? "").toString());
    setIsPublic(!!g.isPublic);
  }, [open, g?.id]);

  const busy = detail.isLoading || update.isPending || del.isPending;
  const changed = useMemo(() => {
    if (!g) return false;
    return title.trim() !== (g.title ?? "").toString().trim() || isPublic !== !!g.isPublic;
  },[g, title, isPublic]);

  const publicUrl = useMemo(() => {
    if (!g?.slug) return "";
    return `${window.location.origin}/g/${g.slug}`;
  },[g?.slug]);

  async function onSave() {
    if (!g) return;
    try {
      await update.mutateAsync({ 
        id: g.id, 
        body: { title: title.trim(), isPublic } as unknown as PatchGalleryReq 
      });
      toast.success("設定を保存しました");
      onClose();
    } catch {
      toast.error("保存に失敗しました");
    }
  }

  async function onDelete() {
    if (!window.confirm("本当にこの祭壇を削除しますか？\n（アクスタは消えません）")) return;
    try {
      if(galleryId) await del.mutateAsync({ id: galleryId });
      toast.success("削除しました");
      onClose();
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  async function onCopyUrl() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("URLをコピーしました！");
    } catch {
      toast.error("コピーに失敗しました");
    }
  }

  if (!open || !galleryId) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-text/30 backdrop-blur-sm" onClick={() => !busy && onClose()} />

      <div className="relative w-full max-w-md rounded-[2.5rem] border border-brand-border bg-brand-surface p-8 shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
            <Settings className="text-brand-primary" /> 設定・シェア
          </h2>
          <button onClick={onClose} disabled={busy} className="p-2 rounded-full bg-brand-bg-soft text-brand-text-muted hover:text-brand-text hover:bg-brand-border transition-colors">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Title Edit */}
          <div>
            <label className="text-xs font-extrabold text-brand-text-muted uppercase tracking-wider mb-2 block">
              祭壇の名前
            </label>
            <input
              className="w-full rounded-2xl border border-brand-border-strong bg-brand-bg-soft px-4 py-3.5 text-sm font-bold text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy || !g}
            />
          </div>

          {/* Share Toggle */}
          <div className={cn("rounded-2xl border transition-colors duration-300 p-5", isPublic ? "border-brand-primary bg-brand-primary-soft/30" : "border-brand-border-strong bg-brand-bg-soft")}>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => !busy && setIsPublic(!isPublic)}>
              <div>
                <div className="text-sm font-extrabold text-brand-text">公開してシェアする</div>
                <div className="text-[10px] font-bold text-brand-text-muted mt-0.5">URLを知っている人が閲覧できます</div>
              </div>
              
              {/* Cute Toggle Switch */}
              <div className={cn("w-14 h-8 rounded-full flex items-center p-1 transition-colors duration-300", isPublic ? "bg-brand-mint" : "bg-brand-border-strong")}>
                <div className={cn("w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300", isPublic ? "translate-x-6" : "translate-x-0")} />
              </div>
            </div>

            {/* URL Display Area (Animates in when public) */}
            {isPublic && g?.slug && (
              <div className="mt-4 pt-4 border-t border-brand-primary/20 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 bg-white rounded-xl border border-brand-primary/30 p-2 pl-3 shadow-sm">
                  <span className="flex-1 text-xs font-bold text-brand-text truncate opacity-80 select-all">
                    {publicUrl}
                  </span>
                  <button 
                    onClick={onCopyUrl}
                    className="flex-shrink-0 bg-brand-primary hover:bg-brand-primary-hover text-white p-2 rounded-lg transition-colors active:scale-95"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <div className="mt-3 flex justify-end">
                  <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1">
                    プレビューを見る <ExternalLink size={12} />
                  </a>
                </div>
                {!g.isPublic && (
                  <p className="mt-2 text-[10px] font-bold text-brand-secondary">※ 下の「保存する」を押すと公開されます</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            onClick={onDelete}
            disabled={busy || !g}
            className="flex items-center gap-1 text-xs font-bold text-brand-secondary/70 hover:text-brand-secondary transition-colors"
          >
            <Trash2 size={16} /> 削除する
          </button>

          <button
            onClick={onSave}
            disabled={!changed || busy}
            className="rounded-full bg-gradient-to-tr from-brand-primary to-brand-mint px-8 py-3 text-sm font-extrabold text-white shadow-md shadow-brand-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {update.isPending ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}