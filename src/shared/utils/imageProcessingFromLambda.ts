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
  processedUrl?: string; // 表記ゆれ吸収用
  processed_url?: string; // 表記ゆれ吸収用
  error?: string;
};

// --- Constants ---
const SIZE_THRESHOLD = 1 * 1024 * 1024; // 1MB

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

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Failed to encode canvas as ${type}`));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

/**
 * 1MB超の画像を、アップロード前に 1MB 以下へ圧縮する。
 * - まず WebP を優先
 * - だめなら JPEG も試す
 * - quality と scale を段階的に落としていく
 */
async function compressBlobUnderThreshold(
  blob: Blob,
  maxBytes: number = SIZE_THRESHOLD
): Promise<Blob> {
  if (blob.size <= maxBytes) {
    return blob;
  }

  const bitmap = await createImageBitmap(blob);
  try {
    const originalWidth = bitmap.width;
    const originalHeight = bitmap.height;

    const scales = [1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52, 0.44, 0.36, 0.28];
    const qualities = [0.92, 0.86, 0.8, 0.72, 0.64, 0.56, 0.48, 0.4, 0.32];
    const mimeCandidates = ["image/webp", "image/jpeg"];

    let bestCandidate: Blob | null = null;

    for (const mimeType of mimeCandidates) {
      for (const scale of scales) {
        const width = Math.max(1, Math.round(originalWidth * scale));
        const height = Math.max(1, Math.round(originalHeight * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get 2D canvas context");
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(bitmap, 0, 0, width, height);

        for (const quality of qualities) {
          const compressed = await canvasToBlob(canvas, mimeType, quality);

          if (!bestCandidate || compressed.size < bestCandidate.size) {
            bestCandidate = compressed;
          }

          if (compressed.size <= maxBytes) {
            console.log(
              `[imageProcessingFromLambda] compressed ${blob.size} -> ${compressed.size} bytes (${mimeType}, q=${quality}, scale=${scale})`
            );
            return compressed;
          }
        }
      }
    }

    if (bestCandidate && bestCandidate.size <= maxBytes) {
      return bestCandidate;
    }

    throw new Error(
      `Failed to compress image under ${maxBytes} bytes. Best effort size: ${bestCandidate?.size ?? "unknown"}`
    );
  } finally {
    bitmap.close();
  }
}

/**
 * 汎用ペイロードビルダー
 * - 1MB超なら、まず 1MB 以下へ圧縮してから S3アップロード (uploader使用)
 * - 以下ならBase64化
 */
async function buildImagePayload(
  blob: Blob | null,
  uploader?: (b: Blob) => Promise<string>
): Promise<{ image_data?: string; image_url?: string }> {
  if (!blob) return {};

  if (blob.size > SIZE_THRESHOLD && uploader) {
    console.log("Image too large, compressing before S3 upload...");
    const compressedBlob = await compressBlobUnderThreshold(blob, SIZE_THRESHOLD);
    const url = await uploader(compressedBlob);
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

  const resultUrl = res.url || res.processedUrl || res.processed_url;
  if (!resultUrl) {
    throw new Error(res.error || "Nooo image URL returned from Rembg Lambda");
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
    prompt,
    ...imagePayload,
  };

  // Lambda実行
  const res = await invokeLambda<ImageUrlResponse>(GEMINI_GEN_URL, payload);

  const resultUrl = res.url || res.processedUrl || res.processed_url;
  if (!resultUrl) {
    throw new Error(res.error || "No image URL returned from Gemini Lambda");
  }

  return await urlToBlob(resultUrl);
}