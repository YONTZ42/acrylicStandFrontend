import type { PlayCanvas } from "./app";

/** PlaycanvasExhibits.tsx から渡す表示データ */
export type SlotView = {
  slotIndex: number; // 0..11
  imageUrl: string | null;
  title: string;
  description: string;
};

export type CaseOptions = {
  caseWidth?: number;   // X
  caseHeight?: number;  // Y
  caseDepth?: number;   // Z
  yawDeg?: number;      // 展示向きの演出（最小）
};

export type PlateOptions = {
  plateMargin?: number;
  plateThickness?: number;
  plateGap?: number;
  canvasPx?: number;
};

export type ShowcaseHandle = { destroy: () => void };

// -----------------------------
// Utils
// -----------------------------
export function quatFromEuler(pc: PlayCanvas, x: number, y: number, z: number) {
  const q = new pc.Quat();
  q.setFromEulerAngles(x, y, z);
  return q;
}

// -----------------------------
// Materials
// -----------------------------
export function createFloorMaterial(pc: PlayCanvas) {
  const m = new pc.StandardMaterial();
  m.useMetalness = true;
  m.metalness = 0;
  m.diffuse = new pc.Color(0.06, 0.06, 0.065);
  m.gloss=0.1;
  m.update();
  return m;
}

export function createAcrylicMaterial(pc: PlayCanvas) {
  const m = new pc.StandardMaterial();
  m.useMetalness = true;
  m.metalness = 0;
  m.diffuse = new pc.Color(1, 1, 1);
  m.gloss=0.9;
  m.opacity = 0.16;
  m.blendType = pc.BLEND_NORMAL;

  // あれば使う（無ければ無視）
  if ("refraction" in m) (m as any).refraction = 0.18;
  if ("clearCoat" in m) (m as any).clearCoat = 1.0;
  if ("clearCoatGloss" in m) (m as any).clearCoatGloss = 0.95;

  m.update();
  return m;
}

export function createPlateMaterial(pc: PlayCanvas, tex: import("playcanvas").Texture) {
  const m = new pc.StandardMaterial();
  m.useMetalness = true;
  m.metalness = 0.7;
  m.gloss=0.8; // 紙っぽく
  m.opacity = 1;
  m.blendType = pc.BLEND_NONE;
  if ("diffuseMap" in m) (m as any).diffuseMap = tex;
  m.update();
  return m;
}

// -----------------------------
// Entities
// -----------------------------
export function createFloor(
  pc: PlayCanvas,
  parent: import("playcanvas").Entity
) {
  const floor = new pc.Entity("floor");
  floor.addComponent("render", { type: "plane" });
  floor.render!.material = createFloorMaterial(pc);
  floor.setLocalScale(10, 1, 10);
  floor.setLocalPosition(0, 0, 0);
  floor.setLocalRotation(quatFromEuler(pc, 0, 0, 0));
  parent.addChild(floor);
  return floor;
}

export function createAcrylicCase(
  pc: PlayCanvas,
  parent: import("playcanvas").Entity,
  opt: CaseOptions = {}
) {
  const w = opt.caseWidth ?? 1.25;
  const h = opt.caseHeight ?? 2.2;
  const d = opt.caseDepth ?? 0.35;

  const e = new pc.Entity("acrylic-case");
  e.addComponent("render", { type: "box" });
  e.render!.material = createAcrylicMaterial(pc);

  e.setLocalScale(w, h, d);
  e.setLocalPosition(0, h * 0.5, 0);
  e.setLocalRotation(quatFromEuler(pc, 0, 0, 0));
  parent.addChild(e);

  return e;
}

export function createPlateEntity(
  pc: PlayCanvas,
  parent: import("playcanvas").Entity,
  tex: import("playcanvas").Texture,
  w: number,
  h: number,
  t: number,
  x: number,
  y: number,
  z: number,
  faceCameraFix: "none" | "flipY180" = "none"
) {
  const plate = new pc.Entity("plate");
  plate.addComponent("render", { type: "box" });
  plate.render!.material = createPlateMaterial(pc, tex);

  plate.setLocalScale(w, h, t);
  plate.setLocalPosition(x, y, z);

  // 重要：Quatで統一。裏向きなら flipY180。
  plate.setLocalRotation(faceCameraFix === "flipY180" ? quatFromEuler(pc, 0, 180, 0) : quatFromEuler(pc, 0, 0, 0));

  parent.addChild(plate);
  return plate;
}

// -----------------------------
// Texture (Canvas)
// -----------------------------
export function createPlateTexture(
  pc: PlayCanvas,
  app: import("playcanvas").AppBase,
  s: SlotView,
  size: number
) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f6f4f0";
  ctx.fillRect(0, 0, size, size);

  const pad = Math.floor(size * 0.08);

  const imgX = pad;
  const imgY = pad;
  const imgW = size - pad * 2;
  const imgH = Math.floor(size * 0.62);

  ctx.fillStyle = "rgba(0,0,0,0.03)";
  ctx.fillRect(imgX, imgY, imgW, imgH);

  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = Math.max(2, Math.floor(size * 0.006));
  ctx.strokeRect(imgX, imgY, imgW, imgH);

  // title
  ctx.fillStyle = "#111";
  ctx.font = `700 ${Math.floor(size * 0.06)}px ui-sans-serif, system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText((s.title || `Slot ${s.slotIndex}`).trim(), size / 2, Math.floor(size * 0.80));

  // desc (1〜2行)
  const desc = (s.description || "").trim();
  if (desc) {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.font = `500 ${Math.floor(size * 0.04)}px ui-sans-serif, system-ui`;
    wrapText(ctx, desc, size / 2, Math.floor(size * 0.86), Math.floor(size * 0.78), Math.floor(size * 0.05), 2);
  }

  const tex = new pc.Texture(app.graphicsDevice, {
    width: size,
    height: size,
    format: pc.PIXELFORMAT_R8_G8_B8_A8,
  });

  tex.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
  tex.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
  tex.minFilter = pc.FILTER_LINEAR_MIPMAP_LINEAR;
  tex.magFilter = pc.FILTER_LINEAR;
  tex.setSource(canvas);

  if (s.imageUrl) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const srcAspect = img.width / img.height;
      const dstAspect = imgW / imgH;

      let cropW = img.width;
      let cropH = img.height;
      let cropX = 0;
      let cropY = 0;

      if (srcAspect > dstAspect) {
        cropW = Math.floor(img.height * dstAspect);
        cropX = Math.floor((img.width - cropW) / 2);
      } else {
        cropH = Math.floor(img.width / dstAspect);
        cropY = Math.floor((img.height - cropH) / 2);
      }

      ctx.drawImage(img, cropX, cropY, cropW, cropH, imgX, imgY, imgW, imgH);
      tex.setSource(canvas);
    };
    img.src = s.imageUrl;
  }

  return tex;
}

// -----------------------------
// Main: build showcase
// -----------------------------
export function createAcrylicShowcase(
  pc: PlayCanvas,
  app: import("playcanvas").AppBase,
  slots: SlotView[],
  caseOpt: CaseOptions = {},
  plateOpt: PlateOptions = {}
): ShowcaseHandle {
  const root = new pc.Entity("acrylic-showcase-root");
  app.root.addChild(root);

  createFloor(pc,root);

  const caseW = caseOpt.caseWidth ?? 1.25;
  const caseH = caseOpt.caseHeight ?? 2.2;
  const caseD = caseOpt.caseDepth ?? 0.35;

  createAcrylicCase(pc, root, caseOpt);

  const platesRoot = new pc.Entity("plates");
  platesRoot.setLocalPosition(0, 0, 0);
  platesRoot.setLocalRotation(quatFromEuler(pc, 0, 0, 0));
  root.addChild(platesRoot);

  const margin = plateOpt.plateMargin ?? 0.12;
  const plateT = plateOpt.plateThickness ?? 0.01;
  const gap = plateOpt.plateGap ?? 0.03;
  const canvasPx = plateOpt.canvasPx ?? 128;

  const filled = slots.filter((s) => !!s.imageUrl);

  if (filled.length > 0) {
    const w = caseW - margin * 2;
    const usableH = caseH - margin * 2;
    const h = (usableH - gap * (filled.length - 1)) / filled.length;

    for (let i = 0; i < filled.length; i++) {
      const s = filled[i];
      const tex = createPlateTexture(pc, app, s, canvasPx);

      const yTop = caseH - margin - h * 0.5;
      const y = yTop - i * (h + gap);

      // カメラから見やすいよう少し手前
      const z = -caseD * 0.12;

      createPlateEntity(pc, platesRoot, tex, w/2, h, plateT, 0, y, z, "none");
    }
  }

  // 展示向き：少しだけ振る（不要なら 0）
  root.setLocalRotation(quatFromEuler(pc, 0, caseOpt.yawDeg ?? 10, 0));

  return {
    destroy: () => {
      try {
        root.destroy();
      } catch {}
    },
  };
}

// -----------------------------
// text wrap
// -----------------------------
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(/\s+/);
  let line = "";
  let y = startY;
  let lines = 0;

  ctx.textAlign = "center";

  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    const w = ctx.measureText(test).width;

    if (w > maxWidth && line) {
      ctx.fillText(line, centerX, y);
      line = words[i];
      y += lineHeight;
      lines++;
      if (lines >= maxLines) return;
    } else {
      line = test;
    }
  }

  if (lines < maxLines) ctx.fillText(line, centerX, y);
}