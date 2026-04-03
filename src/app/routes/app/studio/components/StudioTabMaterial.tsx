import { Palette } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useEditorContext } from "@/features/exhibits/hooks/useExhibitEditorStore";

const MATERIALS =[
  { id: "none", name: "クリアアクリル", icon: "🧊" },
  { id: "hologram", name: "ホログラム", icon: "🌈" },
  { id: "glitter", name: "グリッター", icon: "✨" },
  { id: "emission", name: "ネオン発光", icon: "💡" },
];

export function StudioTabMaterial() {
  const store = useEditorContext();

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xs font-extrabold text-brand-text-muted mb-3 flex items-center gap-1">
          <Palette size={14} /> アクスタの素材
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MATERIALS.map(m => {
            const isActive = store.styleConfig.foregroundEffect === m.id;
            return (
              <button 
                key={m.id}
                onClick={() => store.updateStyleConfig({ foregroundEffect: m.id as any })}
                className={cn(
                  "border-2 rounded-[1.5rem] p-4 flex flex-col items-center gap-2 transition-all",
                  isActive 
                    ? "border-brand-primary bg-brand-primary-soft shadow-md scale-100" 
                    : "border-brand-border bg-brand-bg hover:border-brand-primary/30 scale-95"
                )}
              >
                <span className="text-3xl">{m.icon}</span>
                <span className={cn("text-[11px] font-extrabold", isActive ? "text-brand-primary" : "text-brand-text-muted")}>
                  {m.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-brand-bg-soft p-5 rounded-[1.5rem] border border-brand-border-strong">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-extrabold text-brand-text-muted">アクリルの厚さ（高級感）</span>
          <span className="text-sm font-black text-brand-primary bg-white px-3 py-1 rounded-full shadow-sm">
            {store.styleConfig.depth} mm
          </span>
        </div>
        <input 
          type="range" min="2" max="15" step="1"
          value={store.styleConfig.depth}
          onChange={(e) => store.updateStyleConfig({ depth: parseFloat(e.target.value) })}
          className="w-full accent-brand-primary"
        />
        <div className="flex justify-between mt-2 text-[10px] font-bold text-brand-text-soft">
          <span>ペラペラ (2mm)</span>
          <span>極厚ブロック (15mm)</span>
        </div>
      </section>
    </div>
  );
}