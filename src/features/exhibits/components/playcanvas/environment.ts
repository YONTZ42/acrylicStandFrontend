import type { PlayCanvas } from "./app";

type EnvOptions = {
  envAtlasUrl: string;
  skyboxRotationY?: number;
  skyboxIntensity?: number;
  exposure?: number;
};

export function setupEnvironment(pc: PlayCanvas, app: import("playcanvas").AppBase, opt: EnvOptions) {
  const skyRotY = opt.skyboxRotationY ?? 70;
  const skyIntensity = opt.skyboxIntensity ?? 1.25;

  // ✅ gammaCorrection は Scene では設定しない（削除された）
  // exposure は Scene に残っていることが多いので存在チェックで安全に
  const scene: any = app.scene as any;
  if ("exposure" in scene) scene.exposure = opt.exposure ?? 1.05;

  const asset = new pc.Asset("env-atlas", "texture", { url: opt.envAtlasUrl }, { type: pc.TEXTURETYPE_RGBP, mipmaps: false });
  app.assets.add(asset);

  const onReady = () => {
    app.scene.envAtlas = asset.resource as any;
    app.scene.skyboxRotation = new pc.Quat().setFromEulerAngles(0, skyRotY, 0);
    app.scene.skyboxIntensity = skyIntensity;
  };

  const onError = (err: any) => {
    console.warn("envAtlas load failed -> fallback (no envAtlas)", err);
    app.scene.envAtlas = null as any;
    app.scene.skyboxIntensity = 0.0;
  };

  asset.ready(onReady);
  asset.on("error", onError);

  app.assets.load(asset);

  const destroy = () => {
    asset.off("error", onError);
    if (app.scene.envAtlas === (asset.resource as any)) {
      app.scene.envAtlas = null as any;
    }
    try {
      app.assets.remove(asset);
    } catch {}
  };

  return { destroy };
}