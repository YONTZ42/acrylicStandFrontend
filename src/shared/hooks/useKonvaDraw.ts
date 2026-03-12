import { useState } from 'react';
import Konva from 'konva';

export type ToolMode = 'cut' | 'erase' | 'view';

export const useKonvaDraw = () => {
  const [mode, setMode] = useState<ToolMode>('view');
  
  // 描画中のパス
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // 座標変換ヘルパー
  const getRelativePos = (node: Konva.Node) => {
    const transform = node.getAbsoluteTransform().copy();
    transform.invert();
    const pos = node.getStage()?.getPointerPosition();
    return pos ? transform.point(pos) : null;
  };

  const handleMouseDown = (e: any) => {
    if (mode === 'view') return;
    
    // Stage全体、または画像レイヤーを基準にする
    const stage = e.target.getStage();
    // Imageコンポーネントにrefをつけて、そのtransformを使うのが最も正確だが、
    // ここではシンプルにLayer(またはStage)のscaleを考慮した座標を取得
    const layer = stage.findOne('Layer');
    const pos = getRelativePos(layer);
    
    if (!pos) return;

    setIsDrawing(true);
    setCurrentPoints([pos.x, pos.y]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || mode === 'view') return;
    
    const stage = e.target.getStage();
    const layer = stage.findOne('Layer');
    const pos = getRelativePos(layer);
    
    if (!pos) return;
    setCurrentPoints(prev => [...prev, pos.x, pos.y]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    // ここで自動確定するか、ボタンで確定するかはUI次第
    // 今回は「切り抜き」はボタン確定、「消しゴム」はドラッグ終了で確定などの制御が可能
  };

  const resetDraw = () => {
    setCurrentPoints([]);
    setIsDrawing(false);
  };

  return {
    mode, setMode,
    currentPoints, // 現在描いている線
    isDrawing,
    handleMouseDown, handleMouseMove, handleMouseUp,
    resetDraw
  };
};