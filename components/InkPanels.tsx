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
 * The homepage canvas: two manga panels split by a slanted gutter, hand-inked
 * borders, self-drawing crosshatch that slowly fades, a clean unhatched moon,
 * soft ink washes, and 9 pixel bats that flock and scatter from the cursor.
 *
 * The art is authored in a fixed 1440x900 coordinate space (ported from
 * reference/home.html) and always drawn uniformly scaled to fit its container
 * (like object-fit: contain) — never stretched, never cropped:
 *   - desktop (>= 1024px): the whole 1440x900 frame is contained, so the panels
 *     keep the reference's position and paper margins on all sides.
 *   - below 1024px: only the panel area (800,40 -> 1400,860) is contained inside
 *     a container that already holds that aspect ratio, so it fits exactly.
 * The backing store is sized to the display size x devicePixelRatio so the
 * hatching stays crisp on high-DPI screens. Shared drawing primitives live in
 * lib/ink.ts. Honors prefers-reduced-motion.
 */
export default function InkPanels() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ---- art coordinate space (from reference) ----
    const W = 1440,
      H = 900;
    const X0 = 800,
      X1 = 1400,
      Y0 = 40,
      Y1 = 860,
      GAP = 8;
    const moon = { x: 1170, y: 190, r: 86 };
    const slant = (x: number) => 540 - (x - X0) * (110 / (X1 - X0));

    // Source rectangles in art space, chosen by mode and always "contained".
    const FULL = { x: 0, y: 0, w: W, h: H };
    const PANEL = { x: X0, y: Y0, w: X1 - X0, h: Y1 - Y0 };
    // Bats stay inside the panel area plus a small margin so they never fly over
    // the text column or the nav.
    const BX0 = 780,
      BX1 = 1420,
      BY0 = 30,
      BY1 = 870;

    const noise = makeNoise();
    let t = 0;

    const paper = paintPaper(W, H);

    // soft ink washes (inside panels only)
    const wash = offscreen(W, H),
      w = wash.getContext("2d")!;
    (
      [
        [1000, 420, 320, 0.22],
        [1300, 760, 300, 0.3],
        [880, 820, 220, 0.25],
      ] as const
    ).forEach(([x, y, r, a]) => {
      const g = w.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(22,19,15,${a})`);
      g.addColorStop(1, "rgba(22,19,15,0)");
      w.fillStyle = g;
      w.fillRect(0, 0, W, H);
    });

    // crosshatch layer
    const ink = offscreen(W, H),
      o = ink.getContext("2d")!;
    const density = (x: number, y: number) => {
      const n = noise(x * 0.005 + t * 0.002, y * 0.005) - 0.5;
      let d;
      if (y < slant(x)) {
        const dm = Math.hypot(x - moon.x, y - moon.y);
        d = 0.5 + (y - Y0) / 900 + n * 0.5;
        if (dm < moon.r) d = 0;
        else if (dm < moon.r + 60) d *= (dm - moon.r) / 60;
      } else d = 0.35 + (y - 500) / 500 + n * 0.6;
      return Math.max(0, Math.min(1, d));
    };
    const stroke = () => {
      const x = X0 + Math.random() * (X1 - X0),
        y = Y0 + Math.random() * (Y1 - Y0);
      hatchStroke(o, x, y, density(x, y));
    };
    for (let i = 0; i < 16000; i++) stroke();

    // panels (clip path) + hand-inked borders
    const panelPath = (c: CanvasRenderingContext2D) => {
      c.beginPath();
      c.moveTo(X0, Y0);
      c.lineTo(X1, Y0);
      c.lineTo(X1, slant(X1) - GAP);
      c.lineTo(X0, slant(X0) - GAP);
      c.closePath();
      c.moveTo(X0, slant(X0) + GAP);
      c.lineTo(X1, slant(X1) + GAP);
      c.lineTo(X1, Y1);
      c.lineTo(X0, Y1);
      c.closePath();
    };
    const edges = inkBorder([
      [
        [X0, Y0],
        [X1, Y0],
        [X1, slant(X1) - GAP],
        [X0, slant(X0) - GAP],
      ],
      [
        [X0, slant(X0) + GAP],
        [X1, slant(X1) + GAP],
        [X1, Y1],
        [X0, Y1],
      ],
    ]);

    // bats (boids)
    const bats: { x: number; y: number; vx: number; vy: number; ph: number }[] =
      [];
    for (let i = 0; i < 9; i++)
      bats.push({
        x: 1080 + Math.random() * 200,
        y: 140 + Math.random() * 120,
        vx: -1 - Math.random(),
        vy: Math.random() - 0.5,
        ph: Math.floor(Math.random() * 10),
      });
    let mx: number | null = null,
      my: number | null = null;

    // ---- responsive presentation ----
    const mqFull = window.matchMedia("(min-width: 1024px)");
    const mqBats = window.matchMedia("(min-width: 640px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mode: "full" | "banner" = mqFull.matches ? "full" : "banner";
    let showBats = mqBats.matches;

    // transform mapping art-space -> CSS pixels within the host box
    let boxW = 0,
      boxH = 0,
      dpr = 1,
      sx = 1,
      sy = 1,
      tx = 0,
      ty = 0;

    const computeTransform = () => {
      const src = mode === "full" ? FULL : PANEL;
      const s = Math.min(boxW / src.w, boxH / src.h);
      sx = sy = s;
      tx = (boxW - src.w * s) / 2 - src.x * s;
      ty = (boxH - src.h * s) / 2 - src.y * s;
    };

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.setTransform(dpr * sx, 0, 0, dpr * sy, dpr * tx, dpr * ty);

      ctx.drawImage(paper, 0, 0);
      ctx.save();
      panelPath(ctx);
      ctx.clip();
      ctx.drawImage(wash, 0, 0);
      ctx.drawImage(ink, 0, 0);
      ctx.restore();

      strokeEdges(ctx, edges);

      if (showBats) {
        bats.forEach((b) => drawBat(ctx, b.x, b.y, Math.floor((t + b.ph) / 5)));
      }
    };

    const step = () => {
      for (let i = 0; i < 40; i++) stroke();
      fadeInk(o, W, H);
      if (!showBats) return;
      for (const b of bats) {
        let ax = 0,
          ay = 0,
          cx = 0,
          cy = 0,
          sxb = 0,
          syb = 0,
          n = 0;
        for (const q of bats) {
          if (q === b) continue;
          const dx = q.x - b.x,
            dy = q.y - b.y,
            d = Math.hypot(dx, dy);
          if (d < 110) {
            ax += q.vx;
            ay += q.vy;
            cx += q.x;
            cy += q.y;
            n++;
          }
          if (d < 42 && d > 0) {
            sxb -= dx / d;
            syb -= dy / d;
          }
        }
        if (n) {
          b.vx += (ax / n - b.vx) * 0.03 + (cx / n - b.x) * 0.0012;
          b.vy += (ay / n - b.vy) * 0.03 + (cy / n - b.y) * 0.0012;
        }
        b.vx += sxb * 0.1 + (Math.random() - 0.5) * 0.08;
        b.vy += syb * 0.1 + (Math.random() - 0.5) * 0.08;
        if (mx !== null && my !== null) {
          const dx = b.x - mx,
            dy = b.y - my,
            d = Math.hypot(dx, dy);
          if (d < 150 && d > 0) {
            const k = (1 - d / 150) * 0.8;
            b.vx += (dx / d) * k;
            b.vy += (dy / d) * k;
          }
        }
        // Smoothly steer back inward as a bat approaches the boundary.
        const M = 60;
        if (b.x < BX0 + M) b.vx += 0.14 * (1 - (b.x - BX0) / M);
        else if (b.x > BX1 - M) b.vx -= 0.14 * (1 - (BX1 - b.x) / M);
        if (b.y < BY0 + M) b.vy += 0.14 * (1 - (b.y - BY0) / M);
        else if (b.y > BY1 - M) b.vy -= 0.14 * (1 - (BY1 - b.y) / M);

        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 2.8) {
          // Ease bursts (the moon-click scatter) back to cruising speed instead
          // of hard-clamping, so the push settles before the flock regroups.
          const target = Math.max(2.8, sp * 0.9);
          b.vx *= target / sp;
          b.vy *= target / sp;
        }
        if (sp < 1 && sp > 0) {
          b.vx /= sp;
          b.vy /= sp;
        }
        b.x += b.vx;
        b.y += b.vy;

        // Hard clamp + reflect so a bat can never leave the panel area.
        if (b.x < BX0) {
          b.x = BX0;
          if (b.vx < 0) b.vx = -b.vx;
        } else if (b.x > BX1) {
          b.x = BX1;
          if (b.vx > 0) b.vx = -b.vx;
        }
        if (b.y < BY0) {
          b.y = BY0;
          if (b.vy < 0) b.vy = -b.vy;
        } else if (b.y > BY1) {
          b.y = BY1;
          if (b.vy > 0) b.vy = -b.vy;
        }
      }
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      boxW = rect.width;
      boxH = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(boxW * dpr));
      canvas.height = Math.max(1, Math.round(boxH * dpr));
      canvas.style.width = boxW + "px";
      canvas.style.height = boxH + "px";
      computeTransform();
      draw();
    };

    const inMoon = (ax: number, ay: number) =>
      Math.hypot(ax - moon.x, ay - moon.y) <= moon.r;

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left - tx) / sx;
      my = (e.clientY - r.top - ty) / sy;
      canvas.style.cursor = inMoon(mx, my) ? "pointer" : "default";
    };
    const onLeave = () => {
      mx = null;
      my = null;
      canvas.style.cursor = "default";
    };

    // Clicking inside the moon blasts every bat away from its center; flocking
    // then pulls them back together.
    const onClick = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const ax = (e.clientX - r.left - tx) / sx;
      const ay = (e.clientY - r.top - ty) / sy;
      if (!inMoon(ax, ay)) return;
      for (const b of bats) {
        const dx = b.x - moon.x,
          dy = b.y - moon.y;
        const dist = Math.hypot(dx, dy) || 1;
        b.vx = (dx / dist) * 11;
        b.vy = (dy / dist) * 11;
      }
    };

    const onFullChange = (e: MediaQueryListEvent) => {
      mode = e.matches ? "full" : "banner";
      computeTransform();
      draw();
    };
    const onBatsChange = (e: MediaQueryListEvent) => {
      showBats = e.matches;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    canvas.addEventListener("click", onClick);
    mqFull.addEventListener("change", onFullChange);
    mqBats.addEventListener("change", onBatsChange);

    resize();

    let id: ReturnType<typeof setInterval> | undefined;
    if (!reduce) {
      id = setInterval(() => {
        t++;
        step();
        draw();
      }, 33);
    }

    return () => {
      if (id) clearInterval(id);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      canvas.removeEventListener("click", onClick);
      mqFull.removeEventListener("change", onFullChange);
      mqBats.removeEventListener("change", onBatsChange);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="ink-panels-canvas" />;
}
