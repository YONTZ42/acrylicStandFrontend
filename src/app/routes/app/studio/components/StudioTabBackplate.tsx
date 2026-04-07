import { useState } from "react";
import { Layers, Wand2, X, Building2, Cloud, Mic, Leaf } from "lucide-react";
import { useEditorContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { runGemini } from "@/shared/utils/imageProcessingFromLambda";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import { useToast } from "@/app/providers/ToastProvider";

type Props = {
  onStartProcess: (msg: string) => void;
  onEndProcess: () => void;
};

const PRESETS =[
  { id: "cyber", name: "Cyber City", icon: Building2, prompt: "A neon lit cyberpunk city street background, matching the atmosphere of the subject." },
  { id: "dream", name: "Dreamy Pastel", icon: Cloud, prompt: "A pastel dreamy magical girl background with clouds and sparkles, matching the subject." },
  { id: "stage", name: "Live Stage", icon: Mic, prompt: "A gorgeous idol live stage with spotlights and audience glow sticks, matching the subject." },
  { id: "nature", name: "Nature", icon: Leaf, prompt: "A beautiful sunny nature background with trees and flowers, matching the subject." },
];

export function StudioTabBackplate({ onStartProcess, onEndProcess }: Props) {
  const store = useEditorContext();
  const toast = useToast();
  const { uploadImageAndGetUrl } = useExhibitImageUpload();
  
  const[customPrompt, setCustomPrompt] = useState("");

  const generateBackground = async (prompt: string, useSubjectAsRef: boolean) => {
    onStartProcess("Generating background...");
    try {
      const refBlob = useSubjectAsRef ? (store.originalBlob || undefined) : undefined;
      const resultBlob = await runGemini(prompt, refBlob, uploadImageAndGetUrl);
      store.setLayerBlob("background", resultBlob);
      toast.success("Background generated.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate background.");
    } finally {
      onEndProcess();
    }
  };

  const handleClearBackground = () => {
    store.updateState({ backgroundBlob: null, backgroundUrl: null });
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex justify-between items-end mb-4 border-b border-brand-border pb-2">
          <h3 className="text-xs font-light tracking-widest uppercase text-brand-text-muted flex items-center gap-2">
            <Layers size={14} strokeWidth={1.5} /> Smart Presets
          </h3>
          {(store.backgroundBlob || store.backgroundUrl) && (
            <button onClick={handleClearBackground} className="text-[9px] font-light tracking-widest uppercase text-brand-text-muted hover:text-brand-secondary flex items-center gap-1 transition-colors">
              <X size={12} strokeWidth={1.5} /> Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map((p) => (
            <button 
              key={p.id}
              onClick={() => generateBackground(p.prompt, true)}
              className="border border-brand-border bg-white rounded-xl p-5 flex flex-col items-center gap-3 hover:border-brand-primary hover:bg-brand-primary-soft transition-all active:scale-95 shadow-sm group"
            >
              <p.icon size={24} strokeWidth={1} className="text-brand-text-soft group-hover:text-brand-primary transition-colors" />
              <span className="text-[10px] font-light tracking-widest uppercase text-brand-text">{p.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
        <h3 className="text-xs font-light tracking-widest uppercase text-brand-text-muted mb-4 flex items-center gap-2">
          <Wand2 size={14} strokeWidth={1.5} /> Custom Prompt
        </h3>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="e.g. A beautiful starry night sky with glowing flowers..."
          className="w-full p-4 rounded-xl border border-brand-border text-sm font-light text-brand-text focus:outline-none focus:border-brand-primary bg-brand-bg resize-none h-24 mb-4"
        />
        <button 
          onClick={() => customPrompt && generateBackground(customPrompt, false)}
          disabled={!customPrompt}
          className="w-full py-3.5 rounded-xl border border-brand-secondary bg-brand-secondary text-white text-[10px] font-light tracking-widest uppercase shadow-sm active:scale-95 disabled:opacity-30 transition-all hover:bg-black"
        >
          Generate Concept
        </button>
      </section>
    </div>
  );
}