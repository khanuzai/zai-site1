"use client";

import { useEffect, useRef } from "react";
import {
  PAPER,
  offscreen,
  makeNoise,
  paintPaper,
  hatchStroke,
  fadeInk,
  inkBorder,
  strokeEdges,
  drawBat,
} from "@/lib/ink";

/**
 * A single manga panel for the 404 page: the same hand-inked double border and
 * self-drawing crosshatch as the homepage (via lib/ink.ts), a clean unhatched
 * moon near the top, and two pixel bats hovering in front of it — flapping
 * slowly and drifting a few pixels up and down, with no flocking or cursor
 * reaction. Under reduced motion it draws one finished frame with the bats still.
 */
export default function NotFoundPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ---- art coordinate space ----
    const W = 360,
      H = 460;
    // panel interior (hatching is clipped to this); border sits just outside it
    const IX0 = 10,
      IY0 = 10,
      IX1 = 350,
      IY1 = 450;
    const moon = { x: 182, y: 134, r: 56 };

    const noise = makeNoise();
    let t = 0;

    const paper = paintPaper(W, H);

    // crosshatch layer
    const ink = offscreen(W, H),
      o = ink.getContext("2d")!;
    const density = (x: number, y: number) => {
      const n = noise(x * 0.02 + t * 0.003, y * 0.02) - 0.5;
      let d = 0.42 + (y / H) * 0.62 + n * 0.5;
      const dm = Math.hypot(x - moon.x, y - moon.y);
      if (dm < moon.r) d = 0;
      else if (dm < moon.r + 44) d *= (dm - moon.r) / 44;
      return Math.max(0, Math.min(1, d));
    };
    const stroke = () => {
      const x = IX0 + Math.random() * (IX1 - IX0),
        y = IY0 + Math.random() * (IY1 - IY0);
      hatchStroke(o, x, y, density(x, y));
    };
    // base fill = the "finished" frame (also what reduced motion shows)
    for (let i = 0; i < 2200; i++) stroke();

    const panelRect = (c: CanvasRenderingContext2D) => {
      c.beginPath();
      c.rect(IX0, IY0, IX1 - IX0, IY1 - IY0);
    };
    const edges = inkBorder([
      [
        [8, 8],
        [W - 8, 8],
        [W - 8, H - 8],
        [8, H - 8],
      ],
    ]);

    // two bats hovering in front of the moon (no flocking, no cursor)
    const bats = [
      { x: 150, baseY: 118, phase: 0 },
      { x: 206, baseY: 140, phase: 5 },
    ];

    let s = 1,
      tx = 0,
      ty = 0,
      dpr = 1;

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * tx, dpr * ty);

      ctx.drawImage(paper, 0, 0);
      ctx.save();
      panelRect(ctx);
      ctx.clip();
      ctx.drawImage(ink, 0, 0);

      // bats hover in place: slow flap + a few px of vertical drift
      bats.forEach((b) => {
        const y = b.baseY + Math.sin((t + b.phase) * 0.08) * 4;
        drawBat(ctx, b.x, y, Math.floor((t + b.phase) / 9));
      });
      ctx.restore();

      strokeEdges(ctx, edges);
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const boxW = rect.width,
        boxH = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(boxW * dpr));
      canvas.height = Math.max(1, Math.round(boxH * dpr));
      canvas.style.width = boxW + "px";
      canvas.style.height = boxH + "px";
      s = Math.min(boxW / W, boxH / H); // contain (box already holds the aspect)
      tx = (boxW - W * s) / 2;
      ty = (boxH - H * s) / 2;
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let id: ReturnType<typeof setInterval> | undefined;
    if (!reduce) {
      id = setInterval(() => {
        t++;
        for (let i = 0; i < 16; i++) stroke(); // keep drawing itself in
        fadeInk(o, W, H);
        draw();
      }, 33);
    }

    return () => {
      if (id) clearInterval(id);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="ink-panels-canvas" />;
}
