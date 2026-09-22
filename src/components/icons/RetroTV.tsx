"use client";

import { useEffect, useRef } from "react";

export default function RetroTV() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;

    function drawStatic() {
      const img = ctx!.createImageData(canvas!.width, canvas!.height);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 200) | 0;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx!.putImageData(img, 0, 0);
      raf = requestAnimationFrame(drawStatic);
    }

    drawStatic();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="tv-wrap" aria-hidden="true">
      <div className="ant-base">
        <div className="ant-l">
          <div className="ant-ball" />
        </div>
        <div className="ant-r">
          <div className="ant-ball" />
        </div>
      </div>
      <div className="tv-body">
        <div className="tv-screen-area">
          <div className="tv-screen-inner">
            <canvas ref={canvasRef} width={100} height={74} />
            <div className="scanlines" />
            <div className="tv-glare" />
            <div className="signal-sweep" />
          </div>
        </div>
        <div className="tv-controls">
          <div className="tv-knob" />
          <div className="tv-knob" />
          <div className="tv-speaker">
            <div className="speaker-line" />
            <div className="speaker-line" />
            <div className="speaker-line" />
            <div className="speaker-line" />
          </div>
        </div>
      </div>
    </div>
  );
}
