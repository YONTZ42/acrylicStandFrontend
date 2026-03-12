// src/shared/utils/imageCropMultiObjects.ts

import { invokeLambda } from "./lambdaClient";

export type MaskLayer = {
  id: string;
  url: string;
  blob: Blob;
  image: HTMLImageElement; // Konva overlay 用
  visible: boolean;
};

// uploaderのみ外部から注入する形を維持（S3アップロードロジックはLambda外のため）
type DetectOptions = {
  blob: Blob;
  /**
   * 4.5MBを超える場合にS3へアップロードしてURLを返す関数
   * useExhibitImageUpload の uploadImageAndGetUrl を想定
   */
  uploader: (blob: Blob) => Promise<string>;
};

// 環境変数からFunction URLを取得
const MULTI_MASK_FUNCTION_URL = import.meta.env.VITE_MULTI_MASK_FUNCTION_URL || "";

// Lambdaのペイロード上限(6MB)とBase64化(約1.3倍)を考慮した安全な閾値
const SIZE_THRESHOLD = 4.5 * 1024 * 1024; // 4.5MB

function randomId(): string {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

// Helper: Blob -> Image Element
async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(e);
  });

  URL.revokeObjectURL(url);
  return img;
}

// Helper: Blob -> Base64 (DataURL string)
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * YOLOマスク検出のメイン関数
 */
export async function runDetectObjectMasks({
  blob,
  uploader,
}: DetectOptions): Promise<MaskLayer[]> {
  if (!MULTI_MASK_FUNCTION_URL) {
    throw new Error("VITE_MULTI_MASK_FUNCTION_URL is not defined");
  }

  // 1. ペイロードの準備 (サイズ分岐)
  let payload: { image_data?: string; image_url?: string } = {};

  if (blob.size > SIZE_THRESHOLD) {
    console.log("Image too large, switching to S3 upload flow...");
    try {
      const imageUrl = await uploader(blob);
      payload = { image_url: imageUrl };
    } catch (e) {
      console.error("Upload failed during detection:", e);
      throw new Error("Failed to upload large image for detection.");
    }
  } else {
    // Base64 flow
    // lambdaClient側でプレフィックス除去を行うため、ここではそのまま渡す
    const base64Data = await blobToBase64(blob);
    payload = { image_data: base64Data };
  }

  // 2. Lambda呼び出し (lambdaClient使用)
  type YoloResponse = {
    detected_count: number;
    mask_urls: string[];
  };

  try {
    const data = await invokeLambda<YoloResponse>(MULTI_MASK_FUNCTION_URL, payload);
    
    const maskUrls = Array.isArray(data?.mask_urls) ? data.mask_urls : [];
    if (maskUrls.length === 0) return [];

    // 3. マスク画像のダウンロードとオブジェクト化
    return await downloadMaskLayers(maskUrls);

  } catch (error) {
    console.error("YOLO Detection Error:", error);
    throw error;
  }
}

async function downloadMaskLayers(maskUrls: string[]): Promise<MaskLayer[]> {
  const layers: MaskLayer[] = [];
  
  // 並列ダウンロード
  await Promise.all(
    maskUrls.map(async (url) => {
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`mask download failed: ${r.status}`);
        const blob = await r.blob();
        const image = await blobToImage(blob);
        layers.push({ id: randomId(), url, blob, image, visible: true });
      } catch (e) {
        console.warn("Failed to load mask layer:", url, e);
      }
    })
  );
  
  return layers;
}

/**
 * 選択されたマスク(visible=true)を合成して元画像を切り抜く
 */
export async function cutoutWithUnionMasks(params: {
  sourceImage: HTMLImageElement;
  maskImages: HTMLImageElement[];
}): Promise<Blob> {
  const { sourceImage, maskImages } = params;
  const w = sourceImage.naturalWidth || sourceImage.width;
  const h = sourceImage.naturalHeight || sourceImage.height;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");

  // 1. 元画像を描画してピクセルデータを取得
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(sourceImage, 0, 0, w, h);
  const srcData = ctx.getImageData(0, 0, w, h);

  // 2. マスクのAlpha合成 (Union: 最大値をとる)
  const maxAlpha = new Uint8ClampedArray(w * h); // 0埋め

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = w;
  maskCanvas.height = h;
  const mCtx = maskCanvas.getContext("2d");
  if (!mCtx) throw new Error("mask context unavailable");

  for (const maskImg of maskImages) {
    mCtx.clearRect(0, 0, w, h);
    mCtx.drawImage(maskImg, 0, 0, w, h);
    const mData = mCtx.getImageData(0, 0, w, h).data;

    for (let i = 0; i < w * h; i++) {
      // マスク画像はグレースケール想定。R値をAlpha値として採用
      // 複数のマスクがある場合は、一番白い(不透明な)値を採用
      const val = mData[i * 4]; 
      if (val > maxAlpha[i]) {
        maxAlpha[i] = val;
      }
    }
  }

  // 3. 元画像のAlphaチャンネルを書き換え
  const output = srcData.data;
  for (let i = 0; i < w * h; i++) {
    // RGBはそのまま、Alphaだけマスク合成値にする
    output[i * 4 + 3] = maxAlpha[i];
  }

  ctx.putImageData(srcData, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
}