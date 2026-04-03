// src/features/exhibits/utils/acrylicMeshGenerator.ts
import * as THREE from 'three';
export type AcrylicMeshData = {
positions: Float32Array;
normals: Float32Array;
uvs: Float32Array;
indices: Uint16Array | Uint32Array;
};
// 白黒マスクから外周（輪郭）の座標を抽出する関数
function traceContour(imgData: ImageData, width: number, height: number, threshold = 128): THREE.Vector2[] {
const getAlpha = (x: number, y: number) => {
if (x < 0 || x >= width || y < 0 || y >= height) return 0;
return imgData.data[(y * width + x) * 4 + 3];
};
let startX = -1, startY = -1;
outer: for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        if (getAlpha(x, y) >= threshold) {
            startX = x; startY = y;
            break outer;
        }
    }
}

if (startX === -1) return [];

const contour: THREE.Vector2[] = [];
const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
let dir = 0;
let cx = startX, cy = startY;
let iter = 0;
const maxIter = width * height;

do {
    contour.push(new THREE.Vector2(cx, cy));
    let found = false;
    let startDir = (dir + 5) % 8;
    for (let i = 0; i < 8; i++) {
        const nd = (startDir + i) % 8;
        const nx = cx + dirs[nd][0];
        const ny = cy + dirs[nd][1];
        if (getAlpha(nx, ny) >= threshold) {
            cx = nx; cy = ny;
            dir = nd;
            found = true;
            break;
        }
    }
    if (!found) break;
    iter++;
} while ((cx !== startX || cy !== startY) && iter < maxIter);

return contour;
}
// 直線上の不要な頂点を間引き
function simplifyContour(points: THREE.Vector2[], distSqThreshold = 9.0): THREE.Vector2[] {
if (points.length <= 2) return points;
const simplified = [points[0]];
let last = points[0];
for (let i = 1; i < points.length; i++) {
const pt = points[i];
if (pt.distanceToSquared(last) > distSqThreshold) {
simplified.push(pt);
last = pt;
}
}
return simplified;
}
// Three.jsで押し出しメッシュを作成し、バッファを取り出して返す
export async function generateAcrylicMeshData(
maskUrl: string,
baseHeight: number
): Promise<AcrylicMeshData> {
const img = new Image();
img.crossOrigin = 'anonymous';
await new Promise((resolve, reject) => {
img.onload = resolve;
img.onerror = reject;
img.src = maskUrl;
});
const cvs = document.createElement('canvas');
cvs.width = img.width; cvs.height = img.height;
const ctx = cvs.getContext('2d')!;
ctx.drawImage(img, 0, 0);
const imgData = ctx.getImageData(0, 0, img.width, img.height);

const rawContour = traceContour(imgData, img.width, img.height);
const simplified = simplifyContour(rawContour, 16.0);

const shape = new THREE.Shape();
const scale = baseHeight / img.height; // PlayCanvasの表示サイズにスケールを合わせる

simplified.forEach((p, i) => {
    const x = (p.x - img.width / 2) * scale;
    const y = -(p.y - img.height / 2) * scale; // Y軸はThree.js・PlayCanvas共通で上向き
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
});

const thickness = 0.2; // アクリルの厚み
const extrudeSettings = {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.1,
    bevelThickness: 0.03
};


const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
//geo.center(); // 中心を原点に合わせる
const count = geo.getAttribute('position').count;
const indices = count > 65535 ? new Uint32Array(count) : new Uint16Array(count);
for (let i = 0; i < count; i++) indices[i] = i;
geo.translate(0, 0, -thickness / 2);
geo.setIndex(new THREE.BufferAttribute(indices, 1));

console.log("geo index", geo.index);
return {
    positions: geo.getAttribute('position').array as Float32Array,
    normals: geo.getAttribute('normal').array as Float32Array,
    uvs: geo.getAttribute('uv').array as Float32Array,
    indices: geo.index?.array as Uint16Array | Uint32Array || new Uint16Array()
};
}
