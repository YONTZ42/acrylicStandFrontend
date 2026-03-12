// src/features/exhibits/utils/acrylicGenerator.ts
export type AcrylicAssets = {
paddedImageUrl: string; // 余白とタブ領域を確保した元画像
maskImageUrl: string; // 膨張＋タブ付きの白黒マスク画像
aspect: number; // 最終的な画像のアスペクト比
centerOffsetY: number; // キャラクター中心を原点に合わせるためのYオフセット割合
};
export async function createAcrylicAssets(srcUrl: string): Promise<AcrylicAssets> {
return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
        // 1. サイズと余白の設定
        const blurAmount = Math.ceil(img.width/2000)+2; // 膨張させるピクセル数（アクリルの余白）
        const margin = blurAmount + 5; // 見切れ防止の余白
        const tabHeight = 30; // 台座差し込みタブの高さ
        const tabWidth = Math.max(img.width * 0.2, 50); // タブの幅（最小50px）
        const width = img.width + margin * 2;
        const height = img.height + margin * 2 + tabHeight;

        // --- A. Padded Image (余白付き元画像) の作成 ---
        const imgCanvas = document.createElement('canvas');
        imgCanvas.width = width;
        imgCanvas.height = height;
        const imgCtx = imgCanvas.getContext('2d')!;
        
        // 画像を中央(上寄り)に描画
        const drawX = margin;
        const drawY = margin;
        imgCtx.drawImage(img, drawX, drawY);
        
        const paddedImageUrl = imgCanvas.toDataURL('image/png');

        // --- B. Mask Image (アクリル形状マスク) の作成 ---
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d')!;

        // B-1. シルエットの作成 (真っ白に塗りつぶす)
        maskCtx.drawImage(img, drawX, drawY);
        maskCtx.globalCompositeOperation = 'source-in';
        maskCtx.fillStyle = 'white';
        maskCtx.fillRect(0, 0, width, height);

        // B-2. ブラー(ぼかし)をかけて膨張させる
        maskCtx.globalCompositeOperation = 'source-over';
        // 別のキャンバスにコピーしてからブラーをかけて戻す
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width; tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.drawImage(maskCanvas, 0, 0);

        maskCtx.clearRect(0, 0, width, height);
        maskCtx.filter = `blur(${blurAmount}px)`;
        maskCtx.drawImage(tempCanvas, 0, 0);
        maskCtx.filter = 'none';

        // B-3. しきい値処理 (アルファ値がある部分を完全な白、それ以外を透明にする)
        const imgData = maskCtx.getImageData(0, 0, width, height);
        const data = imgData.data;
        
        // 画像の最も下にあるピクセルのY座標を探す (タブ配置用)
        let maxY = 0;

        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha > 20) { // しきい値 (5/255以上の透明度ならアクリルとみなす)
                data[i] = 255;     // R
                data[i + 1] = 255; // G
                data[i + 2] = 255; // B
                data[i + 3] = 255; // A
                
                const y = Math.floor((i / 4) / width);
                if (y > maxY) maxY = y;
            } else {
                data[i + 3] = 0; // 完全透明
            }
        }
        maskCtx.putImageData(imgData, 0, 0);

        // B-4. 台座用タブ（凸部分）の追加
        // 輪郭の最下端(maxY)から下に向かって矩形を描画
        maskCtx.fillStyle = 'white';
        // 少し角を丸くするために roundRect を使用 (対応ブラウザのみ、非対応ならfillRect)
        if (maskCtx.roundRect) {
            maskCtx.beginPath();
            maskCtx.roundRect(width / 2 - tabWidth / 2, maxY - 5, tabWidth, tabHeight + 5, [0, 0, 5, 5]);
            maskCtx.fill();
        } else {
            maskCtx.fillRect(width / 2 - tabWidth / 2, maxY - 5, tabWidth, tabHeight + 5);
        }

        const maskImageUrl = maskCanvas.toDataURL('image/png');

        // --- C. センタリング用オフセットの計算 ---
        const origCenterY = margin + img.height / 2; // 元画像のY中心
        const totalCenterY = height / 2;             // アクリル全体のY中心
        // キャンバスは上がY=0なので、3D空間(上がYプラス)に適用するための補正割合
        const centerOffsetY = (origCenterY - totalCenterY) / height;

        resolve({
            paddedImageUrl,
            maskImageUrl,
            aspect: width / height,
            centerOffsetY
        });
    };
    img.onerror = reject;
    img.src = srcUrl;
});
};