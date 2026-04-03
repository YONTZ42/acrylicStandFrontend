import { useState } from "react";
import { Plus, X, Settings2, Loader2, Library } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useCreateGallery } from "@/features/galleries/hooks";
import { useAuthContext } from "@/features/auth/AuthProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  galleries: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenSettings: (id: string) => void;
};

export function GallerySwitcherModal({ open, onClose, galleries, selectedId, onSelect, onOpenSettings }: Props) {
  const { status } = useAuthContext();
  const createGallery = useCreateGallery();
  
  const[isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  if (!open) return null;

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const created = await createGallery.mutateAsync({ title: newTitle.trim(), isPublic: false } as any);
      if ((created as any)?.id) {
        onSelect((created as any).id);
      }
      setIsCreating(false);
      setNewTitle("");
      onClose();
    } catch (e) {
      console.error(e);
      alert("作成に失敗しました");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-text/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm rounded-[2rem] border border-brand-border bg-brand-surface p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-brand-text flex items-center gap-2">
            <Library size={20} className="text-brand-primary" />
            祭壇をえらぶ
          </h2>
          <button onClick={onClose} className="p-2 rounded-full bg-brand-bg-soft text-brand-text-muted hover:text-brand-text">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 mb-6">
          {galleries.map((g) => {
            const isSelected = g.id === selectedId;
            return (
              <div 
                key={g.id} 
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                  isSelected 
                    ? "border-brand-primary bg-brand-primary-soft/50 shadow-sm" 
                    : "border-brand-border bg-brand-bg hover:border-brand-primary/50 hover:bg-brand-bg-soft"
                )}
                onClick={() => { onSelect(g.id); onClose(); }}
              >
                <div className="flex flex-col">
                  <span className={cn("text-sm font-extrabold", isSelected ? "text-brand-primary" : "text-brand-text")}>
                    {g.title || "Untitled"}
                  </span>
                  <span className="text-[10px] text-brand-text-muted mt-0.5">
                    {g.exhibits?.length || 0} アクスタ
                  </span>
                </div>
                
                {/* 歯車ボタン (Settingsへ) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onClose(); onOpenSettings(g.id); }}
                  className="p-2 rounded-full text-brand-text-soft hover:text-brand-primary hover:bg-white transition-colors"
                >
                  <Settings2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* ゲストは1つしか作れないため、ユーザー登録済みの場合のみ作成UIを表示 */}
        {status === "authenticated" ? (
          isCreating ? (
            <div className="bg-brand-bg-soft p-4 rounded-2xl border border-brand-border">
              <input
                autoFocus
                className="w-full bg-white rounded-xl border border-brand-border-strong px-4 py-2 text-sm font-bold text-brand-text focus:outline-none focus:border-brand-primary mb-3"
                placeholder="新しい祭壇の名前..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-xs font-bold text-brand-text-muted">キャンセル</button>
                <button onClick={handleCreate} disabled={!newTitle.trim() || createGallery.isPending} className="px-4 py-2 text-xs font-bold bg-brand-primary text-white rounded-full flex items-center gap-1">
                  {createGallery.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} 作る
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-brand-mint text-brand-mint font-extrabold text-sm hover:bg-brand-mint/10 transition-colors"
            >
              <Plus size={18} /> 新しい祭壇を作る
            </button>
          )
        ) : (
          <div className="text-center text-xs font-bold text-brand-text-muted bg-brand-bg-soft p-3 rounded-xl border border-brand-border-strong">
            さらに祭壇を作るにはログインが必要です✨
          </div>
        )}
      </div>
    </div>
  );
}