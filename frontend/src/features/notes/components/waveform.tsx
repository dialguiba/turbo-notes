"use client";

import { useEffect, useRef } from "react";

// --- Constants ---------------------------------------------------------------

const CANVAS_WIDTH = 60;
const CANVAS_HEIGHT = 24;
const BAR_COUNT = 5;
const BAR_GAP = 2;
const BAR_WIDTH = (CANVAS_WIDTH - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;
const BAR_COLOR = "currentColor";
const MIN_BAR_HEIGHT = 3;

// --- Component ---------------------------------------------------------------

interface WaveformProps {
  analyserNode: AnalyserNode | null;
}

export function Waveform({ analyserNode }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;

    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return;

    const ctx = maybeCtx;
    const node = analyserNode;
    const dataArray = new Uint8Array(node.frequencyBinCount);
    const binSize = Math.floor(node.frequencyBinCount / BAR_COUNT);

    function draw() {
      node.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = BAR_COLOR;

      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0;
        for (let j = 0; j < binSize; j++) {
          sum += dataArray[i * binSize + j];
        }
        const avg = sum / binSize;
        const barHeight = Math.max(
          MIN_BAR_HEIGHT,
          (avg / 255) * CANVAS_HEIGHT
        );
        const x = i * (BAR_WIDTH + BAR_GAP);
        const y = (CANVAS_HEIGHT - barHeight) / 2;

        ctx.fillRect(x, y, BAR_WIDTH, barHeight);
      }

      rafIdRef.current = requestAnimationFrame(draw);
    }

    rafIdRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [analyserNode]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      aria-hidden="true"
    />
  );
}
