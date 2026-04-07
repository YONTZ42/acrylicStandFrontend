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
  const[newTitle, setNewTitle] = useState("");

  if (!open) return null;

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const created = await createGallery.mutateAsync({ title: newTitle.trim(), isPublic: false } as any);
      if ((created as any)?.id) onSelect((created as any).id);
      setIsCreating(false);
      setNewTitle("");
      onClose();
    } catch (e) {
      alert("作成に失敗しました");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm rounded-3xl border border-brand-border bg-white shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 border-b border-brand-border">
          <h2 className="text-lg font-serif text-brand-text flex items-center gap-2 tracking-wide">
            <Library size={18} strokeWidth={1.5} className="text-brand-primary" />
            Exhibitions
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full text-brand-text-muted hover:text-brand-text hover:bg-brand-bg-soft transition-colors">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
          {galleries.map((g) => {
            const isSelected = g.id === selectedId;
            return (
              <div 
                key={g.id} 
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                  isSelected 
                    ? "border-brand-primary bg-brand-primary-soft shadow-sm" 
                    : "border-brand-border bg-white hover:border-brand-primary/50"
                )}
                onClick={() => { onSelect(g.id); onClose(); }}
              >
                <div className="flex flex-col">
                  <span className={cn("text-sm font-serif tracking-wide", isSelected ? "text-brand-primary" : "text-brand-text")}>
                    {g.title || "Untitled"}
                  </span>
                  <span className="text-[10px] font-light tracking-widest uppercase text-brand-text-soft mt-1">
                    {g.exhibits?.length || 0} Items
                  </span>
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); onClose(); onOpenSettings(g.id); }}
                  className="p-2 rounded-full text-brand-text-soft hover:text-brand-primary hover:bg-white transition-colors"
                >
                  <Settings2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-brand-border bg-brand-bg">
          {status === "authenticated" ? (
            isCreating ? (
              <div className="bg-white p-4 rounded-2xl border border-brand-border">
                <input
                  autoFocus
                  className="w-full bg-transparent border-b border-brand-border px-2 py-2 text-sm font-serif text-brand-text focus:outline-none focus:border-brand-primary mb-4"
                  placeholder="Exhibition Name..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-[10px] font-light tracking-widest uppercase text-brand-text-muted hover:text-brand-text transition-colors">Cancel</button>
                  <button onClick={handleCreate} disabled={!newTitle.trim() || createGallery.isPending} className="px-5 py-2 text-[10px] font-light tracking-widest uppercase bg-brand-secondary text-white rounded-full flex items-center gap-1.5 hover:bg-black transition-colors disabled:opacity-50">
                    {createGallery.isPending ? <Loader2 size={12} strokeWidth={1.5} className="animate-spin" /> : <Plus size={12} strokeWidth={1.5} />} Create
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-brand-border-strong text-brand-text-muted hover:text-brand-primary hover:border-brand-primary transition-all text-xs font-light tracking-widest uppercase"
              >
                <Plus size={16} strokeWidth={1.5} /> New Exhibition
              </button>
            )
          ) : (
            <div className="text-center text-[10px] font-light tracking-widest uppercase text-brand-text-soft">
              Sign in to create more exhibitions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}