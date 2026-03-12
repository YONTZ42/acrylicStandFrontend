export type PlayCanvas = typeof import("playcanvas");

type CreateAppOptions = {
  deviceTypes?: Array<"webgpu" | "webgl2" | "webgl1">;
  maxPixelRatio?: number;
  inputElement?: HTMLElement;
};

export type PlayCanvasAppHandle = {
  app: import("playcanvas").AppBase;
  start: () => void; // 1回だけ
  resize: () => void;
  destroy: () => void;
};

const CACHE = new WeakMap<HTMLCanvasElement, PlayCanvasAppHandle>();

export async function createPlayCanvasApp(
  pc: PlayCanvas,
  canvas: HTMLCanvasElement,
  opt: CreateAppOptions = {}
): Promise<PlayCanvasAppHandle> {
  const cached = CACHE.get(canvas);
  if (cached) return cached; // ★同じcanvasは必ず同じapp/device

  canvas.style.touchAction = "none";

  const deviceTypes = opt.deviceTypes ?? ["webgpu", "webgl2", "webgl1"];
  const maxPixelRatio = opt.maxPixelRatio ?? 2;
  const inputElement = opt.inputElement ?? canvas;

  // 0x0 canvas だと WebGPU が不安定になるので、先に最低サイズを保証
  const ensureNonZeroCanvas = () => {
    const parent = canvas.parentElement;
    const w = Math.max(1, parent?.clientWidth ?? canvas.clientWidth ?? 1);
    const h = Math.max(1, parent?.clientHeight ?? canvas.clientHeight ?? 1);
    // attribute 側を更新（CSS サイズは親が決める）
    canvas.width = w;
    canvas.height = h;
  };
  ensureNonZeroCanvas();

  const gfxOptions: any = { deviceTypes };
  const device = await pc.createGraphicsDevice(canvas, gfxOptions);
  device.maxPixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);

  const app = new pc.AppBase(canvas);

  const mouse = new pc.Mouse(inputElement);
  const touch = new pc.TouchDevice(inputElement);
  const keyboard = new pc.Keyboard(inputElement);

  const createOptions = new pc.AppOptions();
  createOptions.graphicsDevice = device;
  createOptions.mouse = mouse;
  createOptions.touch = touch;
  createOptions.keyboard = keyboard;

  createOptions.componentSystems = [pc.RenderComponentSystem, pc.CameraComponentSystem, pc.LightComponentSystem];
  createOptions.resourceHandlers = [pc.TextureHandler];

  app.init(createOptions);

  // CSS 側でレイアウトする（React/Tailwind前提）
  app.setCanvasFillMode(pc.FILLMODE_NONE);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  const resize = () => {
    const parent = canvas.parentElement;
    const w = Math.max(1, parent?.clientWidth ?? canvas.clientWidth ?? 1);
    const h = Math.max(1, parent?.clientHeight ?? canvas.clientHeight ?? 1);
    app.resizeCanvas(w, h);
  };

  // canvas 自体ではなく「親」のリサイズを監視（canvas の width/height 変更でループしやすい）
  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas.parentElement ?? canvas);

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    app.start();
    resize();
  };

  const destroy = () => {
    // ★キャッシュから先に外す（再初期化が起きても別device混在しないため）
    CACHE.delete(canvas);

    ro.disconnect();

    // 先に入力を外す（destroy 時にイベントが飛ぶ環境がある）
    try {
      (mouse as any).detach?.();
      (mouse as any).destroy?.();
    } catch {}
    try {
      (touch as any).detach?.();
      (touch as any).destroy?.();
    } catch {}
    try {
      (keyboard as any).detach?.();
      (keyboard as any).destroy?.();
    } catch {}

    // ★PlayCanvas 側のフレームバッファ/レンダーパスをきちんと破棄（WebGPU安定化の要）
    try {
      (app as any).destroy?.();
    } catch {}

    // 最後に device を破棄
    try {
      (device as any).destroy?.();
    } catch {}
  };

  const handle: PlayCanvasAppHandle = { app, start, resize, destroy };
  CACHE.set(canvas, handle);
  return handle;
}