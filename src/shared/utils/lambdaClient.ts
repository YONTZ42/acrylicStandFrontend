// src/shared/utils/lambdaClient.ts
//import { http } from "@/shared/api/http"; // 既存のaxios/fetchラッパーなど

type LambdaPayload = {
  image_data?: string; // Base64 (prefixなし)
  image_url?: string;  // S3 URL
  prompt?: string;     // Gemini用
  model?: string;      // Rembgモデル指定用 (isnet, birefnet, etc)
  config?: any;        // その他パラメータ
};

/**
 * 汎用Lambda呼び出し関数
 * Base64のヘッダー除去などを自動化
 */
export async function invokeLambda<T>(functionUrl: string, payload: LambdaPayload): Promise<T> {
  // Base64の前処理（data:image/png;base64, の除去）
  if (payload.image_data && payload.image_data.includes(',')) {
    payload.image_data = payload.image_data.split(',')[1];
  }

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lambda Error ${response.status}: ${errorText}`);
  }

  // Function URLのレスポンス形式(bodyが文字列化されている場合)に対応
  const raw = await response.json();
  const data = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;
  
  return data as T;
}