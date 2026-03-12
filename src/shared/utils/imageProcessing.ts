// ダミーAPI
const fetchAutoCutout = async (blob: Blob): Promise<Blob> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(blob), 1000); // 実際はAPIで加工されたBlobが返る
  });
};

/**
 * 手動切り抜き (Keep Inner Area)
 */
export const applyManualCutout = async (
  img: HTMLImageElement,
  points: number[] // [x1, y1, x2, y2...]
): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (points.length > 4) {
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      ctx.lineTo(points[i], points[i + 1]);
    }
    ctx.closePath();
    ctx.clip(); // 内側を残す
  }
  ctx.drawImage(img, 0, 0);
  
  return new Promise(r => canvas.toBlob(r, 'image/png'));
};

/**
 * 消しゴム (Erase Area)
 */
export const applyEraser = async (
  img: HTMLImageElement,
  lines: { points: number[]; width: number }[]
): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 元画像を描画
  ctx.drawImage(img, 0, 0);

  // 消しゴム適用
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  lines.forEach(line => {
    ctx.lineWidth = line.width;
    ctx.beginPath();
    ctx.moveTo(line.points[0], line.points[1]);
    for (let i = 2; i < line.points.length; i += 2) {
      ctx.lineTo(line.points[i], line.points[i + 1]);
    }
    ctx.stroke();
  });

  return new Promise(r => canvas.toBlob(r, 'image/png'));
};

/**
 * 自動切り抜き (API)
 */
export const applyAutoCutout = async (blob: Blob): Promise<Blob> => {
  // 本番はここで formData を送信
  return fetchAutoCutout(blob);
};

/**
 * テキスト抽出 (Filter)
 */
export const applyTextExtract = async (img: HTMLImageElement): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // 簡易2値化 & 白透過
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const val = avg < 128 ? 0 : 255;
    data[i] = val;
    data[i+1] = val;
    data[i+2] = val;
    data[i+3] = val === 255 ? 0 : 255; 
  }
  ctx.putImageData(imageData, 0, 0);

  return new Promise(r => canvas.toBlob(r, 'image/png'));
};


// ... (existing imports and functions)

export interface StickerStyleConfig {
  borderWidth: number;
  borderColor: string;
  borderRoughness: number; // 0-10
  shadowBlur: number;
  shadowOpacity: number;
  shadowOffset: { x: number, y: number };
  textureType: 'none' | 'glossy' | 'paper';
}

/**
 * ステッカー加工処理 (枠線・影・質感の合成)
 * 保存時に呼び出し、一枚のPNG画像を生成する
 */
export interface StickerStyleConfig {
  borderWidth: number;
  borderColor: string;
  borderRoughness: number; 
  shadowBlur: number;
  shadowOpacity: number;
  shadowOffset: { x: number, y: number };
  textureType: 'none' | 'glossy' | 'paper';
}

/**
 * ユーティリティ: 画像URLからHTMLImageElementをロード
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * ステッカー加工処理 (枠線・影・質感の合成)
 */
export const processStickerStyle = async (
  img: HTMLImageElement,
  config: StickerStyleConfig,
  manualPoints?: number[]
): Promise<Blob | null> => {
  
  // キャンバスサイズ計算（余白確保）
  const padding = Math.max(config.borderWidth, config.shadowBlur) * 2 + 50;
  const width = img.naturalWidth + padding * 2;
  const height = img.naturalHeight + padding * 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 中央配置オフセット
  const dx = (width - img.naturalWidth) / 2;
  const dy = (height - img.naturalHeight) / 2;

  // パスの座標をキャンバス中央に合わせる関数
  const getPath = (points: number[], offsetX: number = 0, offsetY: number = 0) => {
    const path = new Path2D();
    if (points.length > 1) {
      path.moveTo(points[0] + dx + offsetX, points[1] + dy + offsetY);
      for (let i = 2; i < points.length; i += 2) {
        // Roughness (簡易実装: ランダムオフセット)
        // 厳密なラフネスはパスのリサンプリングが必要だが、ここでは描画時に揺らす
        const r = config.borderRoughness;
        const rx = r > 0 ? (Math.random() - 0.5) * r * 2 : 0;
        const ry = r > 0 ? (Math.random() - 0.5) * r * 2 : 0;
        path.lineTo(points[i] + dx + offsetX + rx, points[i + 1] + dy + offsetY + ry);
      }
      path.closePath();
    }
    return path;
  };

  // --- 1. 影 (Shadow) ---
  ctx.save();
  ctx.shadowColor = `rgba(0, 0, 0, ${config.shadowOpacity})`;
  ctx.shadowBlur = config.shadowBlur;
  ctx.shadowOffsetX = config.shadowOffset.x;
  ctx.shadowOffsetY = config.shadowOffset.y;

  if (manualPoints && manualPoints.length > 0) {
    const path = getPath(manualPoints);
    // 枠線の分だけ太らせたシルエットで影を落とす
    ctx.lineWidth = config.borderWidth; 
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black'; // 色は影色になるので何でも良い
    ctx.fillStyle = 'black';
    ctx.stroke(path);
    ctx.fill(path);
  } else {
    // パスがない場合は画像の矩形（またはアルファ値）で影を落とす
    // アルファ値を考慮して影を落とすには drawImage するだけで良い
    // ただし枠線分の拡大はできないため、元の大きさの影になる
    ctx.drawImage(img, dx, dy);
  }
  ctx.restore();

  // --- 2. 枠線 (Border) ---
  // 影の上に描画（影と重ならないようにクリアはしない、上に乗せる）
  if (manualPoints && manualPoints.length > 0 && config.borderWidth > 0) {
    ctx.save();
    const path = getPath(manualPoints);
    ctx.lineWidth = config.borderWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = config.borderColor;
    ctx.fillStyle = config.borderColor; // 中も塗りつぶして「下地」にする
    ctx.stroke(path);
    ctx.fill(path);
    ctx.restore();
  }

  // --- 3. 本体画像 (Image) ---
  ctx.drawImage(img, dx, dy);

  // --- 4. 質感 (Texture) ---
  if (config.textureType !== 'none') {
    try {
      // テクスチャ画像のロード
      // publicフォルダにある画像をfetchして描画する
      const textureSrc = config.textureType === 'paper' ? '/textures/paper.png' : '/textures/glossy.png';
      
      // 注意: Next.jsのpublicフォルダへのパスは、ブラウザ上での実行なら通るが、
      // 画像処理ロジック内でロードするには絶対パスか、適当なホスティングが必要。
      // ここでは相対パスでトライする。
      const textureImg = await loadImage(textureSrc);

      ctx.save();
      // 合成モード設定
      ctx.globalCompositeOperation = config.textureType === 'paper' ? 'multiply' : 'screen';
      ctx.globalAlpha = config.textureType === 'paper' ? 0.3 : 0.4;
      
      // 画像部分にのみテクスチャを適用したい場合:
      // globalCompositeOperation = 'source-atop' を使う手があるが、
      // 既に影や枠線が描かれているので、それら全体に乗る形になる（それでOK）
      
      // テクスチャをタイル状に描画するか、全体に引き伸ばすか
      // ここでは全体に引き伸ばして描画 (cover)
      ctx.drawImage(textureImg, 0, 0, width, height);
      
      ctx.restore();
    } catch (e) {
      console.warn("Failed to load texture image", e);
      // フォールバック: ノイズ描画など（省略）
    }
  }

  return new Promise(r => canvas.toBlob(r, 'image/png'));
};
