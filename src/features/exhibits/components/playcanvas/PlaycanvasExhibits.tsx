import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/shared/utils/cn";

import type { PlayCanvas } from "./app";
import { createPlayCanvasApp } from "./app";
import { setupEnvironment } from "./environment";
import { setupOrbitCamera } from "./camera";
import { createAcrylicShowcase, type SlotView } from "./objects";
import { safeText } from "./utils";

type NormalizedSlot = {
  imageOriginalUrl?: string | null;
  imageCutoutPngUrl?: string | null;
  title?: string | null;
  description?: string | null;
} | null;

type Props = {
  normalizedSlots: NormalizedSlot[]; // length 12 想定
  className?: string;
  revision?: string;
};

export function PlaycanvasExhibits(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const appHandleRef = useRef<null | { destroy: () => void; start: () => void; app: import("playcanvas").AppBase }>(null);
  const envRef = useRef<null | { destroy: () => void }>(null);
  const camRef = useRef<null | { update: () => void; destroy: () => void }>(null);

  const showcaseRef = useRef<null | { destroy: () => void }>(null);

  const slotViews: SlotView[] = useMemo(() => {
    const a = Array.isArray(props.normalizedSlots) ? props.normalizedSlots.slice(0, 12) : [];
    while (a.length < 12) a.push(null);

    return a.map((s, i) => ({
      slotIndex: i,
      imageUrl: s ? safeText(
        s.imageCutoutPngUrl ? s.imageCutoutPngUrl:s.imageOriginalUrl,
         "") || null : null,
      title: s ? safeText(s.title, `Slot ${i}`) : `Slot ${i}`,
      description: s ? safeText(s.description, "") : "",
    }));
  }, [props.normalizedSlots]);

  // init app once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    (async () => {
      const pc = (await import("playcanvas")) as PlayCanvas;

      const handle = await createPlayCanvasApp(pc, canvas);
      if (cancelled) {
        handle.destroy();
        return;
      }
      appHandleRef.current = handle;

      envRef.current = setupEnvironment(pc, handle.app, {
        envAtlasUrl: "/assets/table-mountain-env-atlas.png",
        skyboxRotationY: 70,
        skyboxIntensity: 1.25,
        exposure: 1.05,
      });

      camRef.current = setupOrbitCamera(pc, handle.app, canvas, {
        enableSceneColorMap: false,
      });

      const onUpdate = () => camRef.current?.update();
      handle.app.on("update", onUpdate);

      handle.start();

      return () => {
        try {
          handle.app.off("update", onUpdate);
        } catch {}

        try {
          showcaseRef.current?.destroy();
        } catch {}
        showcaseRef.current = null;

        try {
          camRef.current?.destroy();
        } catch {}
        camRef.current = null;

        try {
          envRef.current?.destroy();
        } catch {}
        envRef.current = null;

        try {
          handle.destroy();
        } catch {}
        appHandleRef.current = null;
      };
    })().catch((e) => console.error(e));

    return () => {
      cancelled = true;
    };
  }, []);

  // rebuild showcase when slots change
  useEffect(() => {
    const handle = appHandleRef.current;
    if (!handle) return;

    let disposed = false;

    (async () => {
      const pc = (await import("playcanvas")) as PlayCanvas;
      if (disposed) return;

      try {
        showcaseRef.current?.destroy();
      } catch {}
      showcaseRef.current = null;

      showcaseRef.current = createAcrylicShowcase(
        pc,
        handle.app,
        slotViews,
        { caseWidth: 1.25, caseHeight: 2.2, caseDepth: 0.35, yawDeg: 10 },
        { plateMargin: 0.12, plateThickness: 0.01, plateGap: 0.03, canvasPx: 512 }
      );
    })().catch((e) => console.error(e));

    return () => {
      disposed = true;
    };
  }, [slotViews, props.revision]);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-black/40", props.className)}>
      <div className="aspect-[9/16] w-full">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </div>
  );
}