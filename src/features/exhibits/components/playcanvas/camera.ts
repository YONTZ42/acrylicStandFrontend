import type { PlayCanvas } from "./app";
import { clamp } from "./utils";

type CameraOptions = {
  clearColor?: import("playcanvas").Color;
  fov?: number;
  /**
   * WebGPU安定化のためデフォルトOFF。
   * （SceneColorMap は内部で追加のレンダーターゲットを作るので、
   *  使わないなら作らないほうが安全）
   */
  enableSceneColorMap?: boolean;
};

export function setupOrbitCamera(
  pc: PlayCanvas,
  app: import("playcanvas").AppBase,
  canvas: HTMLCanvasElement,
  opt: CameraOptions = {}
) {
  const camera = new pc.Entity("camera");
  camera.addComponent("camera", {
    clearColor: opt.clearColor ?? new pc.Color(0.05, 0.05, 0.06),
    toneMapping: pc.TONEMAP_ACES,
    gammaCorrection:pc.GAMMA_SRGB,
    fov: opt.fov ?? 30,
  });

  // 必要な場合のみ有効化（屈折/ポストFXなど）
  if (opt.enableSceneColorMap) {
    try {
      camera.camera?.requestSceneColorMap(true);
    } catch {
      // noop
    }
  }

  app.root.addChild(camera);

  // Orbit state
  const target = new pc.Vec3(0, 0.75, 0);
  let yaw = 35;
  let pitch = -15;
  let distance = 3.2;

  const pointers = new Map<number, { x: number; y: number }>();
  let lastX = 0;
  let lastY = 0;
  let lastPinch = 0;

  const getDistance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

  const onDown = (e: PointerEvent) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lastX = e.clientX;
    lastY = e.clientY;
    if (pointers.size >= 2) {
      const [p1, p2] = Array.from(pointers.values());
      lastPinch = getDistance(p1, p2);
    }
  };

  const onUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) lastPinch = 0;
  };

  const onMove = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      yaw += dx * 0.25;
      pitch = clamp(pitch + dy * 0.25, -70, 70);
      return;
    }

    if (pointers.size >= 2) {
      const [p1, p2] = Array.from(pointers.values());
      const pinch = getDistance(p1, p2);
      if (lastPinch > 0) {
        const delta = pinch - lastPinch;
        distance = clamp(distance - delta * 0.005, 0.5, 10);
      }
      lastPinch = pinch;
    }
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    distance = clamp(distance + e.deltaY * 0.002, 1.2, 10);
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  const update = () => {
    const q = new pc.Quat().setFromEulerAngles(pitch, yaw, 0);
    const forward = q.transformVector(pc.Vec3.FORWARD).mulScalar(-distance);
    const pos = target.clone().add(forward);
    camera.setPosition(pos);
    camera.lookAt(target);
  };

  const destroy = () => {
    canvas.removeEventListener("pointerdown", onDown as any);
    canvas.removeEventListener("pointerup", onUp as any);
    canvas.removeEventListener("pointercancel", onUp as any);
    canvas.removeEventListener("pointermove", onMove as any);
    canvas.removeEventListener("wheel", onWheel as any);

    // 使っていた場合は戻す
    if (opt.enableSceneColorMap) {
      try {
        camera.camera?.requestSceneColorMap(false);
      } catch {
        // noop
      }
    }

    try {
      camera.destroy();
    } catch {
      // noop
    }
  };

  return { camera, update, destroy };
}