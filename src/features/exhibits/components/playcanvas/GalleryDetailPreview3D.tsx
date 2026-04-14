import React, { useEffect, useRef, useState } from "react";
import * as pc from "playcanvas";
import { Loader2 } from "lucide-react";

import { createAcrylicAssets } from "../../utils/acrylicGenerator";
import { generateAcrylicMeshData } from "../../utils/acrylicMeshGenerator";

type Props = {
  slots: any[]; // normalizedExhibits (長さ12の配列)
  isPaused?: boolean; // GPU競合防止用フラグ
};

export const GalleryDetailPreview3D: React.FC<Props> = ({ slots, isPaused }) => {
  if (isPaused) {
    return (
      <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white/40 z-0 border border-white/5 rounded-2xl">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-sm font-bold tracking-wider mb-2">EDITOR OPENED</div>
          <div className="text-[10px]">Gallery 3D View is paused to avoid GPU conflict.</div>
        </div>
      </div>
    );
  }

  return <GalleryDetailPreview3DInner slots={slots} />;
};

const GalleryDetailPreview3DInner: React.FC<{ slots: any[] }> = ({ slots }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<pc.Application | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");

  const galleryGroupRef = useRef<pc.Entity | null>(null);
  const cameraRef = useRef<pc.Entity | null>(null);

  // --- 操作ステート ---
  const isOrbitDragging = useRef(false);
  const isPanning = useRef(false);

  const lastPointerPos = useRef({ x: 0, y: 0 });
  const lastPanPointerPos = useRef({ x: 0, y: 0 });

  const lastPinchDist = useRef(0);
  const lastTwoFingerCenter = useRef<{ x: number; y: number } | null>(null);

  // Orbit
  const targetYaw = useRef(0);
  const currentYaw = useRef(0);

  const targetPitch = useRef(12);
  const currentPitch = useRef(12);

  // Zoom
  const targetZoom = useRef(80);
  const currentZoom = useRef(65);

  // Pan
  const targetPan = useRef({ x: 0, y: 0 });
  const currentPan = useRef({ x: 0, y: 0 });

  // 1. アプリケーション初期化
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
      fov: 40,
    });
    camera.setPosition(0, 12, targetZoom.current);
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
    dirLight.setEulerAngles(30, 45, 0);
    app.root.addChild(dirLight);

    const fillLight = new pc.Entity("fillLight");
    fillLight.addComponent("light", {
      type: "directional",
      color: new pc.Color(0.7, 0.8, 1.0),
      intensity: 0.8,
    });
    fillLight.setEulerAngles(150, -135, 0);
    app.root.addChild(fillLight);


    // --- Gallery Root Group ---
    const galleryGroup = new pc.Entity("galleryGroup");
    app.root.addChild(galleryGroup);
    galleryGroupRef.current = galleryGroup;

    // --- 棚板の生成 (3段) ---
    const shelfMat = new pc.StandardMaterial();
    shelfMat.diffuse = new pc.Color(0.12, 0.12, 0.14);
    shelfMat.useMetalness = true;
    shelfMat.metalness = 0.5;
    shelfMat.gloss = 0.6;
    shelfMat.update();


    for (let r = 0; r < 3; r++) {
      const shelf = new pc.Entity();
      shelf.addComponent("model", { type: "box" });
      const yBase = (1 - r) * 18;
      shelf.setLocalPosition(0, yBase - 0.5, 0);
      shelf.setLocalScale(90, 1, 20);
      if (shelf.model) shelf.model.material = shelfMat;
      galleryGroup.addChild(shelf);
    }

    // --- マウス入力 ---
    app.mouse?.on(pc.EVENT_MOUSEDOWN, (e) => {
      if (e.button === pc.MOUSEBUTTON_LEFT) {
        isOrbitDragging.current = true;
        isPanning.current = false;
        lastPointerPos.current = { x: e.x, y: e.y };
      } else if (e.button === pc.MOUSEBUTTON_RIGHT || e.button === pc.MOUSEBUTTON_MIDDLE) {
        isPanning.current = true;
        isOrbitDragging.current = false;
        lastPanPointerPos.current = { x: e.x, y: e.y };
      }
    });

    app.mouse?.on(pc.EVENT_MOUSEUP, () => {
      isOrbitDragging.current = false;
      isPanning.current = false;
    });

    app.mouse?.on(pc.EVENT_MOUSEMOVE, (e) => {
      if (isOrbitDragging.current) {
        const dx = e.x - lastPointerPos.current.x;
        const dy = e.y - lastPointerPos.current.y;

        targetYaw.current += dx * 0.25;
        targetPitch.current -= dy * 0.18;
        targetPitch.current = pc.math.clamp(targetPitch.current, -25, 35);

        lastPointerPos.current = { x: e.x, y: e.y };
      }

      if (isPanning.current) {
        const panSpeed = currentZoom.current * 0.0015;
        targetPan.current.x -= (e.x - lastPanPointerPos.current.x) * panSpeed;
        targetPan.current.y += (e.y - lastPanPointerPos.current.y) * panSpeed;
        lastPanPointerPos.current = { x: e.x, y: e.y };
      }
    });

    app.mouse?.on(pc.EVENT_MOUSEWHEEL, (e) => {
      targetZoom.current -= e.wheelDelta * 2;
      targetZoom.current = pc.math.clamp(targetZoom.current, 15, 120);
    });

    // --- タッチ入力 ---
    app.touch?.on(pc.EVENT_TOUCHSTART, (e) => {
      if (e.touches.length === 1) {
        isOrbitDragging.current = true;
        isPanning.current = false;
        lastPointerPos.current = {
          x: e.touches[0].x,
          y: e.touches[0].y,
        };
        lastTwoFingerCenter.current = null;
      } else if (e.touches.length === 2) {
        isOrbitDragging.current = false;
        isPanning.current = true;

        const t0 = e.touches[0];
        const t1 = e.touches[1];

        const center = {
          x: (t0.x + t1.x) / 2,
          y: (t0.y + t1.y) / 2,
        };
        lastTwoFingerCenter.current = center;
        lastPanPointerPos.current = center;

        const dx = t0.x - t1.x;
        const dy = t0.y - t1.y;
        lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
      }
    });

    app.touch?.on(pc.EVENT_TOUCHMOVE, (e) => {
      if (e.touches.length === 1 && isOrbitDragging.current) {
        const x = e.touches[0].x;
        const y = e.touches[0].y;

        const dx = x - lastPointerPos.current.x;
        const dy = y - lastPointerPos.current.y;

        targetYaw.current += dx * 0.25;
        targetPitch.current -= dy * 0.18;
        targetPitch.current = pc.math.clamp(targetPitch.current, -25, 35);

        lastPointerPos.current = { x, y };
        return;
      }

      if (e.touches.length === 2) {
        const t0 = e.touches[0];
        const t1 = e.touches[1];

        // pinch zoom
        const dx = t0.x - t1.x;
        const dy = t0.y - t1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (lastPinchDist.current > 0) {
          targetZoom.current += (lastPinchDist.current - dist) * 0.2;
          targetZoom.current = pc.math.clamp(targetZoom.current, 15, 120);
        }
        lastPinchDist.current = dist;

        // two-finger pan
        const center = {
          x: (t0.x + t1.x) / 2,
          y: (t0.y + t1.y) / 2,
        };

        if (lastTwoFingerCenter.current) {
          const panSpeed = currentZoom.current * 0.0015;
          targetPan.current.x -= (center.x - lastTwoFingerCenter.current.x) * panSpeed;
          targetPan.current.y += (center.y - lastTwoFingerCenter.current.y) * panSpeed;
        }

        lastTwoFingerCenter.current = center;
      }
    });

    app.touch?.on(pc.EVENT_TOUCHEND, () => {
      isOrbitDragging.current = false;
      isPanning.current = false;
      lastTwoFingerCenter.current = null;
    });

    app.touch?.on(pc.EVENT_TOUCHCANCEL, () => {
      isOrbitDragging.current = false;
      isPanning.current = false;
      lastTwoFingerCenter.current = null;
    });

    // --- フレーム更新 ---
    app.on("update", (dt) => {
      currentYaw.current = pc.math.lerp(currentYaw.current, targetYaw.current, dt * 8);
      currentPitch.current = pc.math.lerp(currentPitch.current, targetPitch.current, dt * 8);
      currentZoom.current = pc.math.lerp(currentZoom.current, targetZoom.current, dt * 8);

      currentPan.current.x = pc.math.lerp(currentPan.current.x, targetPan.current.x, dt * 8);
      currentPan.current.y = pc.math.lerp(currentPan.current.y, targetPan.current.y, dt * 8);

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
          z
        );
        cameraRef.current.lookAt(currentPan.current.x, currentPan.current.y, 0);
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      app.destroy();
      appRef.current = null;
    };
  }, []);

  // 2. メッシュの逐次生成
  useEffect(() => {
    if (!appRef.current || !galleryGroupRef.current) return;
    const app = appRef.current;
    const galleryGroup = galleryGroupRef.current;
    let isMounted = true;

    const children = galleryGroup.children.slice();
    children.forEach((child) => {
      if (child.name.startsWith("slot_")) {
        galleryGroup.removeChild(child);
        child.destroy();
      }
    });

    const loadTexture = (url: string) =>
      new Promise<pc.Texture>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (!isMounted || !app.graphicsDevice) return reject("App destroyed");
          const tex = new pc.Texture(app.graphicsDevice, {
            width: img.width,
            height: img.height,
            format: pc.PIXELFORMAT_R8_G8_B8_A8,
          });
          tex.setSource(img);
          resolve(tex);
        };
        img.onerror = reject;
        img.src = url;
      });

    const buildLayer = async (src: string, zOffset: number, effect: string, baseHeight: number) => {
      const assets = await createAcrylicAssets(src);
      if (!isMounted) return null;

      const [imgTex, meshData] = await Promise.all([
        loadTexture(assets.paddedImageUrl),
        generateAcrylicMeshData(assets.maskImageUrl, baseHeight),
      ]);
      if (!isMounted) return null;

      const layerGroup = new pc.Entity();
      const yOffset = assets.centerOffsetY * baseHeight;
      layerGroup.setLocalPosition(0, yOffset, zOffset);

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
      const instance = new pc.MeshInstance(acrylicMesh, acrylicMat, acrylicEntity);
      acrylicEntity.addComponent("render", { meshInstances: [instance] });
      layerGroup.addChild(acrylicEntity);

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
      imgPlane.setLocalScale(baseHeight * assets.aspect, 1, baseHeight);
      if (imgPlane.model) imgPlane.model.material = imgMat;
      layerGroup.addChild(imgPlane);

      return layerGroup;
    };

    const buildSlot = async (exhibit: any, index: number) => {
      const slotGroup = new pc.Entity(`slot_${index}`);

      const row = Math.floor(index / 4);
      const col = index % 4;

      const xPos = (col - 1.5) * 22;
      const baseHeight = 12;
      const shelfY = (1 - row) * 18;
      const yPos = shelfY + baseHeight / 2;

      slotGroup.setLocalPosition(xPos, yPos, 0);

      const style = {
        depth: exhibit.styleConfig?.depth ?? 8,
        foregroundEffect: exhibit.styleConfig?.foregroundEffect ?? "none",
        backgroundEffect: exhibit.styleConfig?.backgroundEffect ?? "none",
      };
      const depthScale = 0.15;
      const offsetZ = (style.depth * depthScale) / 2;

      if (exhibit.imageBackgroundUrl) {
        const bg = await buildLayer(
          exhibit.imageBackgroundUrl,
          -offsetZ,
          style.backgroundEffect,
          baseHeight
        );
        if (bg) slotGroup.addChild(bg);
      }

      if (exhibit.imageForegroundUrl) {
        const fg = await buildLayer(
          exhibit.imageForegroundUrl,
          offsetZ,
          style.foregroundEffect,
          baseHeight
        );
        if (fg) slotGroup.addChild(fg);
      }

      return slotGroup;
    };

    const loadAll = async () => {
      setIsGenerating(true);

      for (let i = 0; i < 12; i++) {
        if (!isMounted) break;
        const exhibit = slots[i];
        if (!exhibit) continue;

        setProgressMsg(`Loading Slot ${i + 1}...`);
        try {
          const slotEntity = await buildSlot(exhibit, i);
          if (slotEntity && isMounted) {
            galleryGroup.addChild(slotEntity);
          }
        } catch (e) {
          console.error(`Failed to build slot ${i}:`, e);
        }
      }

      if (isMounted) setIsGenerating(false);
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [slots]);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none"
        style={{ outline: "none", WebkitUserSelect: "none" }}
        onContextMenu={(e) => e.preventDefault()}
      />

      {isGenerating && (
        <div className="absolute top-4 right-4 bg-black/70 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm z-10 border border-white/10 shadow-xl">
          <Loader2 className="animate-spin text-yellow-400" size={16} />
          <span className="text-white text-xs font-bold tracking-wide">{progressMsg}</span>
        </div>
      )}

      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-0 flex flex-col items-center gap-1">
        <span className="bg-black/50 text-white/70 text-[10px] px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 shadow-xl">
          Left Drag: Orbit / Right Drag or 2-Fingers: Pan / Scroll or Pinch: Zoom
        </span>
      </div>
    </div>
  );
};