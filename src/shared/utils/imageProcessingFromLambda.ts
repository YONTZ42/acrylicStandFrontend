// src/shared/utils/imageProcessingFromLambda.ts

import { invokeLambda } from "./lambdaClient";

// --- 環境変数 ---
const REMBG_ISNET_URL = import.meta.env.VITE_REMBG_ISNET_FUNCTION_URL || "";
const REMBG_BIREFNET_URL = import.meta.env.VITE_REMBG_BIREFNET_FUNCTION_URL || "";
const REMBG_ANIME_URL = import.meta.env.VITE_REMBG_ANIME_FUNCTION_URL || "";
const GEMINI_GEN_URL = import.meta.env.VITE_GEMINI_GEN_FUNCTION_URL || "";

// --- Types ---
export type RembgModel = "isnet-general-use" | "birefnet-general-lite" | "isnet-anime";

// Lambdaレスポンス型（共通: 画像URLが返ってくる想定）
type ImageUrlResponse = {
  success: boolean;
  url?: string;
  processed_url?: string; // 表記ゆれ吸収用
  error?: string;
};

// --- Constants ---
const SIZE_THRESHOLD = 1 * 1024 * 1024; // 4.5MB

// --- Helpers ---

// Blob -> Base64 String (data:image/png;base64,... 形式)
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to convert blob to base64"));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// URL -> Blob (Lambdaから返ってきた画像をダウンロード)
async function urlToBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image from ${url}`);
  return await res.blob();
}

/**
 * 汎用ペイロードビルダー
 * - 4.5MB超ならS3アップロード (uploader使用)
 * - 以下ならBase64化
 */
async function buildImagePayload(
  blob: Blob | null,
  uploader?: (b: Blob) => Promise<string>
): Promise<{ image_data?: string; image_url?: string }> {
  if (!blob) return {};

  if (blob.size > SIZE_THRESHOLD && uploader) {
    console.log("Image too large, uploading to S3...");
    const url = await uploader(blob);
    return { image_url: url };
  } else {
    const b64 = await blobToBase64(blob);
    // lambdaClient側でプレフィックス除去するためそのまま渡す
    return { image_data: b64 };
  }
}

/**
 * Rembgによる背景削除
 * @param blob 元画像Blob
 * @param modelName 使用するモデル名
 * @param uploader S3アップロード関数（大サイズ画像用）
 */
export async function runRembg(
  blob: Blob,
  modelName: RembgModel,
  uploader?: (b: Blob) => Promise<string>
): Promise<Blob> {
  let functionUrl = "";
  switch (modelName) {
    case "isnet-general-use":
      functionUrl = REMBG_ISNET_URL;
      break;
    case "birefnet-general-lite":
      functionUrl = REMBG_BIREFNET_URL;
      break;
    case "isnet-anime":
      functionUrl = REMBG_ANIME_URL;
      break;
  }

  if (!functionUrl) {
    throw new Error(`Function URL for model ${modelName} is not defined.`);
  }

  // ペイロード作成
  const payload = await buildImagePayload(blob, uploader);

  // Lambda実行
  const res = await invokeLambda<ImageUrlResponse>(functionUrl, payload);
  
  const resultUrl = res.url || res.processed_url;
  if (!resultUrl) {
    throw new Error(res.error || "No image URL returned from Rembg Lambda");
  }

  // 画像ダウンロードしてBlobで返す
  return await urlToBlob(resultUrl);
}

/**
 * Geminiによる画像生成 (背景生成など)
 * @param prompt 生成プロンプト
 * @param refBlob (任意) 参照画像。i2i的な使い方をする場合
 * @param uploader (任意) 参照画像が大サイズの場合のアップローダー
 */
export async function runGemini(
  prompt: string,
  refBlob?: Blob,
  uploader?: (b: Blob) => Promise<string>
): Promise<Blob> {
  if (!GEMINI_GEN_URL) {
    throw new Error("VITE_GEMINI_GEN_FUNCTION_URL is not defined.");
  }

  // 参照画像がある場合はペイロードに追加
  const imagePayload = refBlob ? await buildImagePayload(refBlob, uploader) : {};

  const payload = {
    prompt: prompt,
    ...imagePayload,
  };

  // Lambda実行
  const res = await invokeLambda<ImageUrlResponse>(GEMINI_GEN_URL, payload);

  const resultUrl = res.url || res.processed_url;
  if (!resultUrl) {
    throw new Error(res.error || "No image URL returned from Gemini Lambda");
  }

  return await urlToBlob(resultUrl);
}