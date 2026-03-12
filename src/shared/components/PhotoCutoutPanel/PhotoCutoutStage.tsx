
import React, { useEffect, useMemo, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Line } from "react-konva";
import type { ToolMode } from "@/shared/hooks/useKonvaDraw";
import type { MaskLayer } from "@/shared/utils/imageCropMultiObjects";

type StageSize = { w: number; h: number; scale: number };

type Props = {
  blob: Blob | null; // null許容にしておくほうが安全
  isLoading: boolean;
  maskLayers?: MaskLayer[];

  mode: ToolMode;
  currentPoints: number[];

  // pointer events
  onMouseDown: (e: any) => void;
  onMouseMove: (e: any) => void;
  onMouseUp: (e: any) => void;

  // callbacks
  onImageReady: (img: HTMLImageElement, stageScale: number) => void;
  onImageCleared: () => void;
};

export const PhotoCutoutStage: React.FC<Props> = (props) => {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState<StageSize>({ w: 0, h: 0, scale: 1 });

  // 画像ロード処理
  useEffect(() => {
    if (!props.blob) {
      setImageObj(null);
      props.onImageCleared();
      return;
    }

    const url = URL.createObjectURL(props.blob);
    const img = new window.Image();
    img.src = url;

    img.onload = () => {
      // 画像ロード完了後にサイズ計算
      setImageObj(img);

      const maxWidth = window.innerWidth * 0.9;  // 画面幅の90%
      const maxHeight = window.innerHeight * 0.7; // 画面高さの70%
      
      // アスペクト比を維持して収まるスケールを計算
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1); // 拡大はしない(1以下)

      const w = img.width * scale;
      const h = img.height * scale;

      setStageSize({ w, h, scale });
      props.onImageReady(img, scale);
    };

    // クリーンアップ
    return () => {
      URL.revokeObjectURL(url);
      setImageObj(null);
      // ここで onImageCleared を呼ぶと、親の状態更新と競合する場合があるので注意が必要ですが、基本はOK
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.blob]);

  // 線のスタイル定義
  const stroke = useMemo(() => {
    if (props.mode === "erase") return "rgba(255, 50, 50, 0.8)"; // 消しゴムは見やすい赤に
    return "rgba(255, 255, 0, 0.9)"; // カットは黄色
  }, [props.mode]);

  const strokeWidth = useMemo(() => {
    // スケールに合わせて線の太さを調整
    if (props.mode === "erase") return 20 / stageSize.scale;
    return 3 / stageSize.scale;
  }, [props.mode, stageSize.scale]);

  if (!imageObj) return <div className="w-full h-full bg-[#111]" />;

  return (
    <Stage
      width={stageSize.w}
      height={stageSize.h}
      scaleX={stageSize.scale}
      scaleY={stageSize.scale}
      onMouseDown={props.onMouseDown}
      onMouseMove={props.onMouseMove}
      onMouseUp={props.onMouseUp}
      onTouchStart={props.onMouseDown}
      onTouchMove={props.onMouseMove}
      onTouchEnd={props.onMouseUp}
      className="shadow-2xl border border-gray-800 bg-[url('https://placehold.co/20x20/222/333/png')] bg-repeat"
      style={{ cursor: props.mode === "cut" ? "crosshair" : "default" }}
    >
      <Layer>
        {/* 1. 最背面: 元画像 */}
        <KonvaImage image={imageObj} />

        {/* 2. 中間層: マスクオーバーレイ (検出されたオブジェクト) */}
        {props.maskLayers
          ?.filter((m) => m.visible)
          .map((m) => (
            <KonvaImage
              key={m.id}
              image={m.image}
              opacity={0.5} // 半透明
              globalCompositeOperation="screen" // 黒を透過・白を加算 (YOLOマスクが見やすくなる)
              listening={false} // マウスイベントを透過させる（下の画像で描画できるように）
            />
          ))}

        {/* 3. 最前面: 手動描画の線 */}
        {props.mode !== "view" && props.currentPoints.length > 0 && (
          <Line
            points={props.currentPoints}
            stroke={stroke}
            strokeWidth={strokeWidth}
            lineCap="round"
            lineJoin="round"
            tension={0} // 直線的に描画
            closed={props.mode === "cut" && props.currentPoints.length > 2} // カットモードなら閉じる
            fill={props.mode === "cut" ? "rgba(255, 255, 0, 0.2)" : undefined} // カット範囲を薄く塗る
          />
        )}
      </Layer>
    </Stage>
  );
};