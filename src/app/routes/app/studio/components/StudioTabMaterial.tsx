import { Palette, Box, Sparkles, Stars, Lightbulb } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useEditorContext } from "@/features/exhibits/hooks/useExhibitEditorStore";

const MATERIALS =[
  { id: "none", name: "Clear Acrylic", icon: Box },
  { id: "hologram", name: "Hologram", icon: Sparkles },
  { id: "glitter", name: "Glitter", icon: Stars },
  { id: "emission", name: "Neon Glow", icon: Lightbulb },
];

export function StudioTabMaterial() {
  const store = useEditorContext();

  return (
    <div className="space-y-10">
      <section>
        <h3 className="text-xs font-light tracking-widest uppercase text-brand-text-muted mb-4 border-b border-brand-border pb-2 flex items-center gap-2">
          <Palette size={14} strokeWidth={1.5} /> Surface Finish
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MATERIALS.map(m => {
            const isActive = store.styleConfig.foregroundEffect === m.id;
            return (
              <button 
                key={m.id}
                onClick={() => store.updateStyleConfig({ foregroundEffect: m.id as any })}
                className={cn(
                  "border rounded-2xl p-5 flex flex-col items-center gap-3 transition-all group",
                  isActive 
                    ? "border-brand-primary bg-brand-primary-soft shadow-sm scale-100" 
                    : "border-brand-border bg-white hover:border-brand-primary/50 scale-95"
                )}
              >
                <m.icon size={24} strokeWidth={1} className={cn("transition-colors", isActive ? "text-brand-primary" : "text-brand-text-soft group-hover:text-brand-primary/70")} />
                <span className={cn("text-[9px] font-light tracking-widest uppercase", isActive ? "text-brand-primary" : "text-brand-text-muted")}>
                  {m.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div className="flex justify-between items-end mb-6">
          <span className="text-xs font-light tracking-widest uppercase text-brand-text-muted">Thickness</span>
          <span className="text-[11px] font-serif tracking-widest text-brand-text border-b border-brand-text pb-0.5">
            {store.styleConfig.depth} mm
          </span>
        </div>
        <input 
          type="range" min="2" max="15" step="1"
          value={store.styleConfig.depth}
          onChange={(e) => store.updateStyleConfig({ depth: parseFloat(e.target.value) })}
          className="w-full accent-brand-secondary"
        />
        <div className="flex justify-between mt-3 text-[9px] font-light tracking-widest uppercase text-brand-text-soft">
          <span>Thin (2mm)</span>
          <span>Thick (15mm)</span>
        </div>
      </section>
    </div>
  );
}