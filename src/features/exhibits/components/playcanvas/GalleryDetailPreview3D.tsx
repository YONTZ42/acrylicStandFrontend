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
 console.log("slots", slots);
  return <GalleryDetailPreview3DInner slots={slots} />;
};


const GalleryDetailPreview3DInner: React.FC<{ slots: any[] }> = ({ slots }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<pc.Application | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");

  const galleryGroupRef = useRef<pc.Entity | null>(null);
  const cameraRef = useRef<pc.Entity | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- カメラ操作ステート ---
  const isDragging = useRef(false);   // 回転(オービット)
  const isPanning = useRef(false);    // 平行移動(パン)
  const lastMouseX = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(0);

  // 回転
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  // ズーム
  const targetZoom = useRef(65);
  const currentZoom = useRef(65);
  // パン(XY移動)
  const targetPan = useRef({ x: 0, y: 0 });
  const currentPan = useRef({ x: 0, y: 0 });



  // --- ブラウザのデフォルトタッチ挙動（スクロール・ズーム等）を強制ブロック ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefault = (e: TouchEvent | WheelEvent) => {
      if (e.cancelable) e.preventDefault();

    };
    // ------------------------------------------------------------------------
    // 生のDOMイベントでタッチ操作を直接処理する (ラグをなくすため)
    // ------------------------------------------------------------------------
    const handleTouchStart = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (e.touches.length === 1) {
        isDragging.current = true;
        lastMouseX.current = e.touches[0].clientX;
      } else if (e.touches.length === 2) {
        isDragging.current = false;
        isPanning.current = true;
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        lastMousePos.current = { x: cx, y: cy };
        
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (e.touches.length === 1 && isDragging.current) {
        targetRotation.current += (e.touches[0].clientX - lastMouseX.current) * 0.3;
        lastMouseX.current = e.touches[0].clientX;
      } else if (e.touches.length === 2) {
        // パン処理
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const panSpeed = currentZoom.current * 0.0015;
        targetPan.current.x -= (cx - lastMousePos.current.x) * panSpeed;
        targetPan.current.y += (cy - lastMousePos.current.y) * panSpeed;
        lastMousePos.current = { x: cx, y: cy };

        // ズーム処理
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        targetZoom.current += (lastPinchDist.current - dist) * 0.1;
        targetZoom.current = pc.math.clamp(targetZoom.current, 15, 120);
        lastPinchDist.current = dist;
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      isPanning.current = false;
     };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    container.addEventListener("wheel", preventDefault, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
       container.removeEventListener("wheel", preventDefault);
    };
  }, []);


  // 1. アプリケーション初期化
  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new pc.Application(canvasRef.current, {
      mouse: new pc.Mouse(canvasRef.current),
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
      clearColor: new pc.Color(0.05, 0.05, 0.06, 1),
      projection: pc.PROJECTION_PERSPECTIVE,
      fov: 90,
    });
    camera.setPosition(currentPan.current.x, currentPan.current.y, targetZoom.current);
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
      const yBase = (1 - r) * 18; // 18間隔で棚を配置
      shelf.setLocalPosition(0, yBase - 0.5, 0); // 板の厚みの分だけ下げる
      shelf.setLocalScale(90, 1, 20); // 幅80、厚み1、奥行20
      if (shelf.model) shelf.model.material = shelfMat;
      galleryGroup.addChild(shelf);
    }

    // --- 入力イベント (マウス) ---
    app.mouse?.on(pc.EVENT_MOUSEDOWN, (e) => {
      if (e.button === pc.MOUSEBUTTON_LEFT) {
        // 左クリック: 回転
        isDragging.current = true;
        lastMouseX.current = e.x;
      } else if (e.button === pc.MOUSEBUTTON_RIGHT || e.button === pc.MOUSEBUTTON_MIDDLE) {
        // 右・中クリック: パン
        isPanning.current = true;
        lastMousePos.current = { x: e.x, y: e.y };
      }
    });

    app.mouse?.on(pc.EVENT_MOUSEUP, () => {
      isDragging.current = false;
      isPanning.current = false;
    });

    app.mouse?.on(pc.EVENT_MOUSEMOVE, (e) => {
      if (isDragging.current) {
        targetRotation.current += (e.x - lastMouseX.current) * 0.3;
        lastMouseX.current = e.x;
      }
      if (isPanning.current) {
        const panSpeed = currentZoom.current * 0.0015; // ズームに応じたパン速度
        targetPan.current.x -= (e.x - lastMousePos.current.x) * panSpeed;
        targetPan.current.y += (e.y - lastMousePos.current.y) * panSpeed; // Y軸はマウスと逆
        lastMousePos.current = { x: e.x, y: e.y };
      }
    });

    app.mouse?.on(pc.EVENT_MOUSEWHEEL, (e) => {
      targetZoom.current -= e.wheelDelta * 2;
      targetZoom.current = pc.math.clamp(targetZoom.current, 15, 120);
    });

    // --- フレーム更新 ---
    app.on("update", (dt) => {
      if (galleryGroupRef.current) {
        // 全体の回転
        currentRotation.current = pc.math.lerp(currentRotation.current, targetRotation.current, dt * 8);
        galleryGroupRef.current.setLocalEulerAngles(0, currentRotation.current, 0);
      }
      if (cameraRef.current) {
        // カメラのパンとズーム
        currentZoom.current = pc.math.lerp(currentZoom.current, targetZoom.current, dt * 8);
        currentPan.current.x = pc.math.lerp(currentPan.current.x, targetPan.current.x, dt * 8);
        currentPan.current.y = pc.math.lerp(currentPan.current.y, targetPan.current.y, dt * 8);
        cameraRef.current.setLocalPosition(currentPan.current.x, currentPan.current.y, currentZoom.current);
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

    // 既存のアクスタ要素(棚以外)をクリア
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
          const tex = new pc.Texture(app.graphicsDevice, { width: img.width, height: img.height, format: pc.PIXELFORMAT_R8_G8_B8_A8 });
          tex.setSource(img);
          resolve(tex);
        };
        img.onerror = reject;
        img.src = url;
      });

    // 単一レイヤー生成 (Background / Foreground 共通)
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

      // 外殻アクリル
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

      // 画像面
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

    // 1スロット分を生成する
    const buildSlot = async (exhibit: any, index: number) => {
      const slotGroup = new pc.Entity(`slot_${index}`);
      
      const row = Math.floor(index / 4); // 0, 1, 2
      const col = index % 4; // 0, 1, 2, 3
      
      // X: 中心から左右に分散 (幅18間隔)
      const xPos = (col - 1.5) * 22;
      // Y: 棚板が y=18, 0, -18 なので、そこにアクスタの高さの半分(6)を足して立たせる
      const baseHeight = 12;
      const shelfY = (1 - row) * 18;
      const yPos = shelfY + (baseHeight / 2);
      
      slotGroup.setLocalPosition(xPos, yPos, 0);

      const style = {
        depth: exhibit.styleConfig?.depth ?? 5,
        foregroundEffect: exhibit.styleConfig?.foregroundEffect ?? "none",
        backgroundEffect: exhibit.styleConfig?.backgroundEffect ?? "none",
      };
      const depthScale = 0.15;
      const offsetZ = (style.depth * depthScale) / 2;

      // バックグラウンド (奥側)
      if (exhibit.imageBackgroundUrl ) {
        const bg = await buildLayer(exhibit.imageBackgroundUrl, -offsetZ, style.backgroundEffect, baseHeight);
        if (bg) slotGroup.addChild(bg);
      }
      // フォアグラウンド (手前側)
      if (exhibit.imageForegroundUrl) {
        const fg = await buildLayer(exhibit.imageForegroundUrl, offsetZ, style.foregroundEffect, baseHeight);
        if (fg) slotGroup.addChild(fg);
      }

      return slotGroup;
    };

    // 直列で12スロットを順番に生成
    const loadAll = async () => {
      setIsGenerating(true);
      for (let i = 0; i < 12; i++) {
        if (!isMounted) break;
        const exhibit = slots[i];
        if (!exhibit) continue;

        setProgressMsg(`Loading Slot ${i + 1}...`);
        try {
          const slotEntity = await buildSlot(exhibit, i);
          console.log("slotEntity", i,slotEntity);
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

    return () => { isMounted = false; };
  }, [slots]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden"
    >
      {/* onContextMenu を preventDefault し、右クリックメニューを出させない */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block touch-none " 
        style={{ outline: "none" , WebkitUserSelect: "none"}} 
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
          Left Drag: Rotate / Right Drag or 2-Fingers: Pan / Scroll: Zoom
        </span>
      </div>
    </div>
  );
};