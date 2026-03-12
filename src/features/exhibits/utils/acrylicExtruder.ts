import earcut from 'earcut';
import * as pc from 'playcanvas';

/**
 * 画像データから外周の境界座標を抽出する (簡易 Moore-Neighbor Tracing)
 */
function traceBoundary(imageData: ImageData): { x: number, y: number }[] {
    const { width, height, data } = imageData;
    const isInside = (x: number, y: number) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return false;
        return data[(y * width + x) * 4 + 3] > 128; // アルファが128以上のピクセル
    };

    // 最初のピクセルを探す
    let startX = -1, startY = -1;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (isInside(x, y)) {
                startX = x; startY = y; break;
            }
        }
        if (startX !== -1) break;
    }
    if (startX === -1) return [];

    const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    const points: { x: number, y: number }[] = [];
    let currX = startX, currY = startY;
    let currDir = 0;
    let iter = 0;
    const maxIter = width * height;

    do {
        points.push({ x: currX, y: currY });
        let found = false;
        let searchDir = (currDir - 2 + 8) % 8; // 左手沿いに探索

        for (let i = 0; i < 8; i++) {
            const nx = currX + dirs[searchDir][0];
            const ny = currY + dirs[searchDir][1];
            if (isInside(nx, ny)) {
                currX = nx; currY = ny;
                currDir = searchDir;
                found = true; break;
            }
            searchDir = (searchDir + 1) % 8;
        }

        if (!found) break;
        iter++;
    } while ((currX !== startX || currY !== startY) && iter < maxIter);

    return points;
}

/**
 * 頂点数を減らす（単純な距離ベースの間引き）
 */
function simplifyPoints(points: { x: number, y: number }[], tolerance: number) {
    if (points.length < 3) return points;
    const result = [points[0]];
    let lastPoint = points[0];
    for (let i = 1; i < points.length; i++) {
        const pt = points[i];
        const distSq = (pt.x - lastPoint.x) ** 2 + (pt.y - lastPoint.y) ** 2;
        if (distSq >= tolerance * tolerance) {
            result.push(pt);
            lastPoint = pt;
        }
    }
    return result;
}

/**
 * PlayCanvasのMeshを作成するヘルパー
 */
function createPcMesh(app: pc.Application, positions: number[], normals: number[], uvs: number[], indices: number[]) {
    const mesh = new pc.Mesh(app.graphicsDevice);
    mesh.clear(true, false);
    mesh.setPositions(positions);
    mesh.setNormals(normals);
    mesh.setUvs(0, uvs);
    mesh.setIndices(indices);
    mesh.update();
    return mesh;
}

/**
 * マスク画像から押し出し(Extrude)メッシュを生成する
 */
export async function buildAcrylicMeshes(
    app: pc.Application,
    maskImageUrl: string,
    thickness: number,
    baseHeight: number
): Promise<{ frontBackMesh: pc.Mesh, sideMesh: pc.Mesh, targetWidth: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            // 1. キャンバスに描画してImageDataを取得
            const cvs = document.createElement('canvas');
            const w = img.width; const h = img.height;
            cvs.width = w; cvs.height = h;
            const ctx = cvs.getContext('2d')!;
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, w, h);

            // 2. 境界トレースと単純化
            const rawPoints = traceBoundary(imgData);
            // 解像度に合わせて間引き係数を調整 (画像サイズが大きいほど間引く)
            const simplifyTolerance = Math.max(1, w / 200); 
            const points = simplifyPoints(rawPoints, simplifyTolerance);

            if (points.length < 3) return reject(new Error("Boundary detection failed."));

            // 3. 3D空間へのスケーリング計算
            const aspect = w / h;
            const targetWidth = baseHeight * aspect;
            const scaleX = targetWidth / w;
            const scaleY = baseHeight / h;

            // earcut用のフラット配列作成
            const flatCoords: number[] = [];
            const pcPositions: { x: number, y: number, u: number, v: number }[] = [];

            points.forEach(p => {
                flatCoords.push(p.x, p.y);
                pcPositions.push({
                    x: (p.x - w / 2) * scaleX, // 中央を原点に
                    y: -(p.y - h / 2) * scaleY, // CanvasのYは下向きなので反転
                    u: p.x / w,
                    v: 1.0 - (p.y / h)
                });
            });

            // 4. 前面・背面のTriangulation
            const triangulatedIndices = earcut(flatCoords);

            // --- Mesh 1: 前面と背面 ---
            const fbPos: number[] = [];
            const fbNorm: number[] = [];
            const fbUv: number[] = [];
            const fbInd: number[] = [];
            const numPts = pcPositions.length;
            const zHalf = thickness / 2;

            // 前面 (Z = +zHalf)
            pcPositions.forEach(p => {
                fbPos.push(p.x, p.y, zHalf);
                fbNorm.push(0, 0, 1);
                fbUv.push(p.u, p.v);
            });
            triangulatedIndices.forEach(idx => fbInd.push(idx));

            // 背面 (Z = -zHalf)
            const offset = numPts;
            pcPositions.forEach(p => {
                fbPos.push(p.x, p.y, -zHalf);
                fbNorm.push(0, 0, -1);
                // 裏面はUVのXを反転させないと鏡文字になる
                fbUv.push(1.0 - p.u, p.v); 
            });
            // 背面はインデックスの順序を逆にして面を裏返す
            for (let i = 0; i < triangulatedIndices.length; i += 3) {
                fbInd.push(offset + triangulatedIndices[i + 2]);
                fbInd.push(offset + triangulatedIndices[i + 1]);
                fbInd.push(offset + triangulatedIndices[i]);
            }
            
            const frontBackMesh = createPcMesh(app, fbPos, fbNorm, fbUv, fbInd);

            // --- Mesh 2: 側面 (アクリルの断面) ---
            const sPos: number[] = [];
            const sNorm: number[] = [];
            const sUv: number[] = [];
            const sInd: number[] = [];
            let sIdx = 0;

            for (let i = 0; i < numPts; i++) {
                const nextI = (i + 1) % numPts;
                const p1 = pcPositions[i];
                const p2 = pcPositions[nextI];

                // 辺の法線を計算（2D方向ベクトルの垂直ベクトル）
                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                dx /= len; dy /= len;
                const nx = dy; // 左手系の外向き法線
                const ny = -dx;

                // 4つの頂点 (前面p1, 前面p2, 背面p2, 背面p1)
                sPos.push(p1.x, p1.y, zHalf);  sNorm.push(nx, ny, 0); sUv.push(0, 0);
                sPos.push(p2.x, p2.y, zHalf);  sNorm.push(nx, ny, 0); sUv.push(1, 0);
                sPos.push(p2.x, p2.y, -zHalf); sNorm.push(nx, ny, 0); sUv.push(1, 1);
                sPos.push(p1.x, p1.y, -zHalf); sNorm.push(nx, ny, 0); sUv.push(0, 1);

                // 2つの三角形
                sInd.push(sIdx, sIdx + 1, sIdx + 2);
                sInd.push(sIdx, sIdx + 2, sIdx + 3);
                sIdx += 4;
            }

            const sideMesh = createPcMesh(app, sPos, sNorm, sUv, sInd);

            resolve({ frontBackMesh, sideMesh, targetWidth });
        };
        img.onerror = reject;
        img.src = maskImageUrl;
    });
}