import { useState } from "react";
import { Scissors, Sparkles, Image as ImageIcon, LayoutGrid } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useEditorContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { runRembg, runGemini, type RembgModel } from "@/shared/utils/imageProcessingFromLambda";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import { useToast } from "@/app/providers/ToastProvider";

type Props = {
  onStartProcess: (msg: string) => void;
  onEndProcess: () => void;
};

const REMBG_MODELS: { id: RembgModel; name: string; desc: string }[] =[
  { id: "isnet-general-use", name: "Standard", desc: "Fast & reliable" },
  { id: "birefnet-general-lite", name: "High Quality", desc: "Best precision" },
  { id: "isnet-anime", name: "Illustration", desc: "For 2D artworks" },
];

export function StudioTabCutout({ onStartProcess, onEndProcess }: Props) {
  const store = useEditorContext();
  const toast = useToast();
  const { uploadImageAndGetUrl } = useExhibitImageUpload();
  const[selectedModel, setSelectedModel] = useState<RembgModel>("isnet-general-use");

  const handleCutout = async () => {
    if (!store.originalBlob) return toast.error("Please upload an image first.");
    onStartProcess("Removing background...");
    try {
      const resultBlob = await runRembg(store.originalBlob, selectedModel, uploadImageAndGetUrl);
      store.setLayerBlob("foreground", resultBlob);
      toast.success("Background removed.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove background.");
    } finally {
      onEndProcess();
    }
  };

  const handleAIStyle = async (prompt: string, styleName: string) => {
    if (!store.originalBlob) return;
    onStartProcess(`Applying ${styleName} filter...`);
    try {
      const resultBlob = await runGemini(prompt, store.originalBlob, uploadImageAndGetUrl);
      store.updateState({ originalBlob: resultBlob });
      onStartProcess("Adjusting edges...");
      const cutoutBlob = await runRembg(resultBlob, "isnet-anime", uploadImageAndGetUrl);
      store.setLayerBlob("foreground", cutoutBlob);
      toast.success(`Style applied.`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to apply style.");
    } finally {
      onEndProcess();
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
        <h3 className="text-xs font-light tracking-widest uppercase text-brand-text-muted mb-4 border-b border-brand-border pb-2 flex items-center gap-2">
          <Scissors size={14} strokeWidth={1.5} /> AI Cutout
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {REMBG_MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all",
                  selectedModel === m.id 
                    ? "border-brand-primary bg-brand-primary-soft shadow-sm" 
                    : "border-brand-border bg-brand-bg hover:border-brand-primary/50"
                )}
              >
                <div className="text-[11px] font-medium tracking-wider text-brand-text">{m.name}</div>
                <div className="text-[9px] font-light tracking-wide text-brand-text-muted mt-1">{m.desc}</div>
              </button>
            ))}
          </div>
          <button 
            onClick={handleCutout}
            className="w-full py-3.5 rounded-xl bg-brand-text text-white text-[10px] font-light tracking-widest uppercase shadow-sm hover:bg-black active:scale-95 transition-all"
          >
            Extract Subject
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-light tracking-widest uppercase text-brand-text-muted mb-4 border-b border-brand-border pb-2 flex items-center gap-2">
          <Sparkles size={14} strokeWidth={1.5} /> AI Filters
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          <button 
            onClick={() => handleAIStyle("Based on the provided image of the person or the object, remove the original background completely and output a precise cutout of the person or the object. The final output must be against a transparent background (alpha channel, RGBA), showcasing only the person and the added text elements. The text that suits to the person  is hand-written in a charcoal-colored, raw brush-script font, and arranged in a perfect arc curve over the person's head, creating a halo effect. ", "Anime")}
            className="flex-shrink-0 w-32 aspect-square rounded-2xl border border-brand-border bg-white flex flex-col items-center justify-center gap-3 hover:border-brand-primary hover:bg-brand-primary-soft transition-all active:scale-95 shadow-sm group"
          >
            <ImageIcon size={24} strokeWidth={1} className="text-brand-text-soft group-hover:text-brand-primary" />
            <span className="text-[10px] font-light tracking-widest uppercase text-brand-text">Anime Style</span>
          </button>
          <button 
            onClick={() => handleAIStyle("Everskiesスタイルの全身ピクセルアートイラストを作成してください。映っている被写体（モノ、人物）の体型、顔の表情、服装とヘアスタイルの表現方法を模倣してください。添付画像の人物の髪型、服装、アクセサリーを参考にして、白い背景に全身のイラストを描いてください。ピクセルアート風のドット絵スタイルで、ゲームキャラクターのような可愛らしい仕上がりにしてください。背景透過RGBA形式で。", "Pixel")}
            className="flex-shrink-0 w-32 aspect-square rounded-2xl border border-brand-border bg-white flex flex-col items-center justify-center gap-3 hover:border-brand-primary hover:bg-brand-primary-soft transition-all active:scale-95 shadow-sm group"
          >
            <LayoutGrid size={24} strokeWidth={1} className="text-brand-text-soft group-hover:text-brand-primary" />
            <span className="text-[10px] font-light tracking-widest uppercase text-brand-text">Pixel Art</span>
          </button>
        </div>
      </section>
    </div>
  );
}