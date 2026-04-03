// src/features/exhibits/components/ExhibitEditorModal/LayerPreview3D.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as pc from 'playcanvas';
import { createAcrylicAssets, type AcrylicAssets } from '../../utils/acrylicGenerator';
import { generateAcrylicMeshData } from '../../utils/acrylicMeshGenerator';
import { Loader2 } from 'lucide-react';
type Props = {
previewSrc: string;
};
export const LayerPreview3D: React.FC<Props> = ({ previewSrc }) => {

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
    clearColor: new pc.Color(0.04, 0.04, 0.04, 0),
    projection: pc.PROJECTION_PERSPECTIVE,
    fov: 30,
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
  dirLight.setEulerAngles(45, 45, 0);
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
// 2. メッシュ生成とマテリアル適用
// ------------------------------------------------------------------------
useEffect(() => {
    if (!appRef.current || !previewSrc || !standGroupRef.current) return;

    const app = appRef.current;
    const standGroup = standGroupRef.current;
    let isMounted = true;

    const loadAssets = async () => {
        setIsGenerating(true);

        // 既存の子要素をクリーンアップ
        while (standGroup.children.length > 0) {
            const child = standGroup.children[0];
            standGroup.removeChild(child);
            child.destroy();
        }

        try {
            const baseHeight = 6;

            // 1. 画像の分析とテクスチャ作成
            const assets: AcrylicAssets = await createAcrylicAssets(previewSrc);
            
            if (!isMounted) return;
            // ★修正箇所：PlayCanvasのローダーを使わず、Imageオブジェクトから直接テクスチャを生成
            const loadTexture = (url: string) => new Promise<pc.Texture>((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    if (!isMounted || !app.graphicsDevice){
                        reject(new Error("Application destroyed."));
                        return;
                    }
                    const texture = new pc.Texture(app.graphicsDevice, {
                        width: img.width,
                        height: img.height,
                        format: pc.PIXELFORMAT_R8_G8_B8_A8
                    });
                    texture.setSource(img);
                    resolve(texture);
                };
                img.onerror = reject;
                img.src = url;
            });

            const [imgTex] = await Promise.all([
                loadTexture(assets.paddedImageUrl)
            ]);

            if (!isMounted) return;

            // センタリングのオフセット適用
            const yOffset = assets.centerOffsetY * baseHeight;
            standGroup.setLocalPosition(0, yOffset, 0);

            // 2. Three.js を使って押し出しメッシュデータを生成 (バックグラウンド処理)
            const meshData = await generateAcrylicMeshData(assets.maskImageUrl, baseHeight);
            console.log('meshData', meshData);
            // 3. PlayCanvas の メッシュ(pc.Mesh) に頂点データを流し込む
            const acrylicMesh = new pc.Mesh(app.graphicsDevice);
            acrylicMesh.clear(true, false);
            acrylicMesh.setPositions(meshData.positions);
            acrylicMesh.setNormals(meshData.normals);
            acrylicMesh.setUvs(0, meshData.uvs);
            acrylicMesh.setIndices(meshData.indices);
            acrylicMesh.update(pc.PRIMITIVE_TRIANGLES);

            // --- マテリアルA: アクリル外殻 (半透明ガラス) ---
            const acrylicMat = new pc.StandardMaterial();
            acrylicMat.diffuse = new pc.Color(0.85, 0.95, 1.0); // ほんのり青白い
            acrylicMat.opacity = 0.25; // 透け感
            acrylicMat.blendType = pc.BLEND_NORMAL;
            acrylicMat.depthWrite = false; // 透明描画のためDepthWriteオフ
            acrylicMat.cull = pc.CULLFACE_NONE; // 両面描画
            acrylicMat.useMetalness = true;
            acrylicMat.metalness = 0.6;
            acrylicMat.gloss = 0.9;
            acrylicMat.update();

            // ★修正箇所：専用のEntityを作り、MeshInstanceにそのEntity自身を渡す
            const acrylicEntity = new pc.Entity('acrylicShell');
            const acrylicMeshInstance = new pc.MeshInstance(acrylicMesh, acrylicMat, acrylicEntity);
            acrylicEntity.addComponent('render', {
                meshInstances: [acrylicMeshInstance]
            });
            standGroup.addChild(acrylicEntity);
            console.log("acrylic", acrylicEntity);

            // --- マテリアルB: 中心の画像層 ---
            const targetWidth = baseHeight * assets.aspect;
            const imgMat = new pc.StandardMaterial();
            imgMat.diffuseMap = imgTex;
            imgMat.opacityMap = imgTex; // 画像のアルファをそのまま使用
            imgMat.blendType = pc.BLEND_NONE; 
            imgMat.alphaTest = 0.5; // アルファが0.5以下のピクセルを切り抜く
            imgMat.depthWrite = true;
            imgMat.cull = pc.CULLFACE_NONE; // 裏面からも見えるように
            imgMat.useMetalness = true;
            imgMat.metalness = 0.1;
            imgMat.gloss = 0.5;
            imgMat.update();

            // PlayCanvas標準のPlaneに画像を貼り、Z=0(アクリルの中心)に配置
            const imgPlane = new pc.Entity('imagePlane');
            imgPlane.addComponent('model', { type: 'plane' });
            imgPlane.setEulerAngles(90, 0, 0); // PlayCanvasのPlaneを立てる
            imgPlane.setLocalScale(targetWidth, 1, baseHeight);
            if (imgPlane.model) {
                imgPlane.model.material = imgMat;
            }
            standGroup.addChild(imgPlane);

        } catch (err) {
            console.error("Failed to generate acrylic mesh or load textures:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    loadAssets();
    return () => {
        isMounted = false;
    };

}, [previewSrc]);

return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
        <canvas 
            ref={canvasRef} 
            className="w-full h-full block touch-none"
            style={{ outline: 'none' }}
        />
        
        {isGenerating && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 backdrop-blur-sm z-10">
                <Loader2 className="animate-spin text-yellow-400" size={32} />
                <span className="text-white text-sm font-bold">Generating 3D Acrylic Stand...</span>
            </div>
        )}

        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-0">
            <span className="bg-black/50 text-white/70 text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
                Drag to rotate / Scroll to zoom
            </span>
        </div>
    </div>
);
};