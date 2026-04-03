import React, { useEffect, useRef, useState, useMemo } from "react";
import * as pc from "playcanvas";
import { Loader2 } from "lucide-react";

import { useEditorContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { createAcrylicAssets, type AcrylicAssets } from "../../utils/acrylicGenerator";
import { generateAcrylicMeshData } from "../../utils/acrylicMeshGenerator";

// ============================================================================
// Wrapper Component
// レイヤー編集モーダルが開いている間は、WebGPUデバイスの競合を防ぐために
// PlayCanvas本体(Inner)をアンマウントしてプレースホルダを表示する。
// ============================================================================
export const ExhibitPreview3D: React.FC = () => {
  const store = useEditorContext();

  if (store.editingLayer) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white/40 border border-white/5">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-sm font-bold tracking-wider mb-2">EDITING LAYER...</div>
          <div className="text-[10px]">3D Preview is paused to avoid GPU conflict.</div>
        </div>
      </div>
    );
  }

  return <ExhibitPreview3DInner />;
};

// ============================================================================
// Inner Component (Core PlayCanvas Logic)
// ============================================================================
const ExhibitPreview3DInner: React.FC = () => {
  const store = useEditorContext();

  const fgSrc = useMemo(
    () => (store.foregroundBlob ? URL.createObjectURL(store.foregroundBlob) : store.foregroundUrl),
    [store.foregroundBlob, store.foregroundUrl]
  );
  const bgSrc = useMemo(
    () => (store.backgroundBlob ? URL.createObjectURL(store.backgroundBlob) : store.backgroundUrl),
    [store.backgroundBlob, store.backgroundUrl]
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<pc.Application | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // PlayCanvas Entities
  const standGroupRef = useRef<pc.Entity | null>(null);
  const cameraRef = useRef<pc.Entity | null>(null);

  // 操作ステート
  const isOrbitDragging = useRef(false);
  const lastPointerX = useRef(0);
  const lastPointerY = useRef(0);

  const targetYaw = useRef(0);
  const currentYaw = useRef(0);

  const targetPitch = useRef(12);
  const currentPitch = useRef(12);

  const targetZoom = useRef(14);
  const currentZoom = useRef(14);

  const targetPan = useRef(new pc.Vec3(0, 0, 0));
  const currentPan = useRef(new pc.Vec3(0, 0, 0));

  const lastPinchDist = useRef(0);
  const lastTwoFingerCenter = useRef<{ x: number; y: number } | null>(null);
  // ------------------------------------------------------------------------
  // 1. PlayCanvas Application の初期化
  // ------------------------------------------------------------------------
useEffect(() => {
  if (!canvasRef.current) return;

  const app = new pc.Application(canvasRef.current, {
    mouse: new pc.Mouse(canvasRef.current),
    touch: new pc.TouchDevice(canvasRef.current),
    elementInput: new pc.ElementInput(canvasRef.current),
  });
  app.start();
  appRef.current = app;

  app.setCanvasFillMode(pc.FILLMODE_NONE);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  const handleResize = () => app.resizeCanvas();
  window.addEventListener("resize", handleResize);

  // --- Camera ---
  const camera = new pc.Entity("camera");
  camera.addComponent("camera", {
    clearColor: new pc.Color(0.78, 0.82, 0.88, 1),
    projection: pc.PROJECTION_PERSPECTIVE,
    fov: 20,
  });
  camera.setPosition(0, 2, targetZoom.current);
  camera.lookAt(0, 0, 0);
  app.root.addChild(camera);
  cameraRef.current = camera;

  // --- Lights ---
  const dirLight = new pc.Entity("dirLight");
  dirLight.addComponent("light", {
    type: "directional",
    color: new pc.Color(1, 1, 1),
    intensity: 1.2,
  });
  dirLight.setEulerAngles(45, 0, 0);
  app.root.addChild(dirLight);

  const backLight = new pc.Entity("backLight");
  backLight.addComponent("light", {
    type: "directional",
    color: new pc.Color(0.8, 0.9, 1.0),
    intensity: 0.8,
  });
  backLight.setEulerAngles(135, -135, 0);
  app.root.addChild(backLight);

  

  // --- Acrylic Stand Group ---
  const standGroup = new pc.Entity("standGroup");
  app.root.addChild(standGroup);
  standGroupRef.current = standGroup;

  // --- Input ---
  app.mouse?.on(pc.EVENT_MOUSEDOWN, (e) => {
    if (e.button === pc.MOUSEBUTTON_LEFT) {
      isOrbitDragging.current = true;
      lastPointerX.current = e.x;
      lastPointerY.current = e.y;
    }
  });

  app.touch?.on(pc.EVENT_TOUCHSTART, (e) => {
    if (e.touches.length === 1) {
      isOrbitDragging.current = true;
      lastPointerX.current = e.touches[0].x;
      lastPointerY.current = e.touches[0].y;
      lastTwoFingerCenter.current = null;
    } else if (e.touches.length === 2) {
      isOrbitDragging.current = false;

      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dx = t0.x - t1.x;
      const dy = t0.y - t1.y;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
      lastTwoFingerCenter.current = {
        x: (t0.x + t1.x) / 2,
        y: (t0.y + t1.y) / 2,
      };
    }
  });

  app.mouse?.on(pc.EVENT_MOUSEWHEEL, (e) => {
    targetZoom.current -= e.wheelDelta * 0.6;
    targetZoom.current = pc.math.clamp(targetZoom.current, 6, 30);
  });

  const orbitByPointer = (x: number, y: number) => {
    if (!isOrbitDragging.current) return;

    const dx = x - lastPointerX.current;
    const dy = y - lastPointerY.current;

    targetYaw.current += dx * 0.35;
    targetPitch.current -= dy * 0.25;
    targetPitch.current = pc.math.clamp(targetPitch.current, -35, 45);

    lastPointerX.current = x;
    lastPointerY.current = y;
  };

  app.mouse?.on(pc.EVENT_MOUSEMOVE, (e) => {
    orbitByPointer(e.x, e.y);
  });

  app.touch?.on(pc.EVENT_TOUCHMOVE, (e) => {
    if (e.touches.length === 1) {
      orbitByPointer(e.touches[0].x, e.touches[0].y);
      return;
    }

    if (e.touches.length === 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];

      const dx = t0.x - t1.x;
      const dy = t0.y - t1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (lastPinchDist.current > 0) {
        targetZoom.current += (lastPinchDist.current - dist) * 0.06;
        targetZoom.current = pc.math.clamp(targetZoom.current, 6, 30);
      }
      lastPinchDist.current = dist;

      const center = {
        x: (t0.x + t1.x) / 2,
        y: (t0.y + t1.y) / 2,
      };

      if (lastTwoFingerCenter.current) {
        const moveX = center.x - lastTwoFingerCenter.current.x;
        const moveY = center.y - lastTwoFingerCenter.current.y;

        const panScale = currentZoom.current * 0.0025;
        targetPan.current.x -= moveX * panScale;
        targetPan.current.y += moveY * panScale;
      }

      lastTwoFingerCenter.current = center;
    }
  });

  const onEnd = () => {
    isOrbitDragging.current = false;
    lastTwoFingerCenter.current = null;
  };

  app.mouse?.on(pc.EVENT_MOUSEUP, onEnd);
  app.touch?.on(pc.EVENT_TOUCHEND, onEnd);
  app.touch?.on(pc.EVENT_TOUCHCANCEL, onEnd);

  app.on("update", (dt) => {
    currentYaw.current = pc.math.lerp(currentYaw.current, targetYaw.current, dt * 10);
    currentPitch.current = pc.math.lerp(currentPitch.current, targetPitch.current, dt * 10);
    currentZoom.current = pc.math.lerp(currentZoom.current, targetZoom.current, dt * 10);

    currentPan.current.lerp(currentPan.current, targetPan.current, dt * 10);

    if (cameraRef.current) {
      const yawRad = pc.math.DEG_TO_RAD * currentYaw.current;
      const pitchRad = pc.math.DEG_TO_RAD * currentPitch.current;
      const radius = currentZoom.current;

      const cosPitch = Math.cos(pitchRad);
      const x = Math.sin(yawRad) * cosPitch * radius;
      const y = Math.sin(pitchRad) * radius;
      const z = Math.cos(yawRad) * cosPitch * radius;

      cameraRef.current.setLocalPosition(
        currentPan.current.x + x,
        currentPan.current.y + y,
        currentPan.current.z + z
      );
      cameraRef.current.lookAt(currentPan.current);
    }
  });

  return () => {
    window.removeEventListener("resize", handleResize);
    app.destroy();
    appRef.current = null;
  };
}, []);

  // ------------------------------------------------------------------------
  // 2. メッシュ生成と配置
  // ------------------------------------------------------------------------
  useEffect(() => {
    if (!appRef.current || !standGroupRef.current) return;
    const app = appRef.current;
    const standGroup = standGroupRef.current;
    let isMounted = true;

    const loadTexture = (url: string) =>
      new Promise<pc.Texture>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (!isMounted || !app.graphicsDevice) return reject(new Error("App destroyed"));
          const texture = new pc.Texture(app.graphicsDevice, {
            width: img.width,
            height: img.height,
            format: pc.PIXELFORMAT_R8_G8_B8_A8,
          });
          texture.setSource(img);
          resolve(texture);
        };
        img.onerror = reject;
        img.src = url;
      });

    const buildAcrylicLayer = async (src: string, zOffset: number, effect: string) => {
      const baseHeight = 6;
      const assets: AcrylicAssets = await createAcrylicAssets(src);
      if (!isMounted) return null;

      const [imgTex, meshData] = await Promise.all([
        loadTexture(assets.paddedImageUrl),
        generateAcrylicMeshData(assets.maskImageUrl, baseHeight),
      ]);
      if (!isMounted) return null;

      const layerGroup = new pc.Entity();
      const yOffset = assets.centerOffsetY * baseHeight;
      layerGroup.setLocalPosition(0, yOffset, zOffset);

      // --- アクリル外殻 ---
      const acrylicMesh = new pc.Mesh(app.graphicsDevice);
      acrylicMesh.clear(true, false);
      acrylicMesh.setPositions(meshData.positions);
      acrylicMesh.setNormals(meshData.normals);
      acrylicMesh.setUvs(0, meshData.uvs);
      acrylicMesh.setIndices(meshData.indices);
      acrylicMesh.update(pc.PRIMITIVE_TRIANGLES);

      const acrylicMat = new pc.StandardMaterial();
      acrylicMat.diffuse = new pc.Color(0.85, 0.95, 1.0);
      acrylicMat.opacity = 0.25;
      acrylicMat.blendType = pc.BLEND_NORMAL;
      acrylicMat.depthWrite = false;
      acrylicMat.cull = pc.CULLFACE_NONE;
      acrylicMat.useMetalness = true;
      acrylicMat.metalness = 0.6;
      acrylicMat.gloss = 0.9;
      acrylicMat.update();

      const acrylicEntity = new pc.Entity();
      const acrylicMeshInstance = new pc.MeshInstance(acrylicMesh, acrylicMat, acrylicEntity);
      acrylicEntity.addComponent("render", { meshInstances: [acrylicMeshInstance] });
      layerGroup.addChild(acrylicEntity);

      // --- 画像面 ---
      const targetWidth = baseHeight * assets.aspect;
      const imgMat = new pc.StandardMaterial();
      imgMat.diffuseMap = imgTex;
      imgMat.opacityMap = imgTex;
      imgMat.blendType = pc.BLEND_NONE;
      imgMat.alphaTest = 0.5;
      imgMat.depthWrite = true;
      imgMat.cull = pc.CULLFACE_NONE;
      imgMat.useMetalness = true;
      imgMat.metalness = 0.1;
      imgMat.gloss = 0.5;

      if (effect === "emission") {
        imgMat.emissiveMap = imgTex;
        imgMat.emissiveIntensity = 1.5;
      } else if (effect === "hologram") {
        imgMat.emissive = new pc.Color(0.3, 0.6, 1.0);
        imgMat.emissiveIntensity = 0.4;
      } else if (effect === "glitter") {
        imgMat.metalness = 0.9;
        imgMat.gloss = 1.0;
      }
      imgMat.update();

      const imgPlane = new pc.Entity();
      imgPlane.addComponent("model", { type: "plane" });
      imgPlane.setEulerAngles(90, 0, 0);
      imgPlane.setLocalScale(targetWidth, 1, baseHeight);
      if (imgPlane.model) {
        imgPlane.model.material = imgMat;
      }
      layerGroup.addChild(imgPlane);

      return layerGroup;
    };

    const loadAllLayers = async () => {
      setIsGenerating(true);

      while (standGroup.children.length > 0) {
        const child = standGroup.children[0];
        standGroup.removeChild(child);
        child.destroy();
      }

      try {
        const depthScale = 0.1;
        const offsetZ = (store.styleConfig.depth * depthScale) / 2;

        const promises = [];
        if (bgSrc) promises.push(buildAcrylicLayer(bgSrc, -offsetZ, store.styleConfig.backgroundEffect));
        if (fgSrc) promises.push(buildAcrylicLayer(fgSrc, offsetZ, store.styleConfig.foregroundEffect));

        const layers = await Promise.all(promises);
        if (!isMounted) return;

        layers.forEach((layer) => {
          if (layer) standGroup.addChild(layer);
        });
      } catch (err) {
        console.error("Failed to generate acrylic layers:", err);
      } finally {
        if (isMounted) setIsGenerating(false);
      }
    };

    loadAllLayers();

    return () => {
      isMounted = false;
    };
  }, [
    fgSrc,
    bgSrc,
    store.styleConfig.depth,
    store.styleConfig.foregroundEffect,
    store.styleConfig.backgroundEffect,
  ]);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing bg-transparent">
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none"
        style={{ outline: "none" }}
      />

      {isGenerating && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 backdrop-blur-sm z-10">
          <Loader2 className="animate-spin text-yellow-400" size={32} />
          <span className="text-white text-sm font-bold">Building 3D Scene...</span>
        </div>
      )}

      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-0">
        <span className="bg-black/50 text-white/70 text-[10px] px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
          Drag to rotate / Scroll to zoom
        </span>
      </div>
    </div>
  );
};