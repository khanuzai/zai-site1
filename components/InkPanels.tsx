"use client";

import { useEffect, useRef } from "react";

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
 * hatching stays crisp on high-DPI screens. Plain Canvas 2D, no libraries.
 * Honors prefers-reduced-motion.
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
    // FULL: the whole reference frame (desktop). PANEL: just the two panels
    // (800,40 -> 1400,860) for the small-screen banner.
    const FULL = { x: 0, y: 0, w: W, h: H };
    const PANEL = { x: X0, y: Y0, w: X1 - X0, h: Y1 - Y0 };
    // Bats stay inside the panel area plus a small margin so they never fly over
    // the text column or the nav.
    const BX0 = 780,
      BX1 = 1420,
      BY0 = 30,
      BY1 = 870;

    const mk = () => {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      return c;
    };

    // value noise
    const NN = 256,
      tbl = new Float32Array(NN * NN);
    for (let i = 0; i < NN * NN; i++) tbl[i] = Math.random();
    const noise = (x: number, y: number) => {
      const xi = Math.floor(x),
        yi = Math.floor(y),
        xf = x - xi,
        yf = y - yi;
      const u = xf * xf * (3 - 2 * xf),
        v = yf * yf * (3 - 2 * yf),
        g = (a: number, b: number) => tbl[(a & 255) * NN + (b & 255)];
      const a = g(xi, yi),
        b = g(xi + 1, yi),
        c = g(xi, yi + 1),
        d = g(xi + 1, yi + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
    let t = 0;

    // paper grain
    const paper = mk(),
      p = paper.getContext("2d")!;
    p.fillStyle = "#ebe5d8";
    p.fillRect(0, 0, W, H);
    for (let i = 0; i < 9000; i++) {
      p.fillStyle =
        Math.random() < 0.5 ? "rgba(90,78,60,0.05)" : "rgba(255,255,255,0.25)";
      p.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 2, 1);
    }

    // soft ink washes (inside panels only)
    const wash = mk(),
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
    const ink = mk(),
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
        y = Y0 + Math.random() * (Y1 - Y0),
        d = density(x, y);
      if (Math.random() > d) return;
      const layer = d > 0.8 ? 2 : d > 0.45 ? 1 : 0;
      const ang = [Math.PI / 4, -Math.PI / 4, 0.1][
        Math.floor(Math.random() * (layer + 1))
      ];
      const len = 12 + Math.random() * 40 * (0.5 + d),
        dx = Math.cos(ang) * len / 2,
        dy = Math.sin(ang) * len / 2;
      o.strokeStyle = `rgba(22,19,15,${(0.5 + Math.random() * 0.45).toFixed(2)})`;
      o.lineWidth = 0.6 + Math.random() * 0.9;
      o.lineCap = "round";
      o.beginPath();
      o.moveTo(x - dx, y - dy);
      o.quadraticCurveTo(
        x + (Math.random() - 0.5) * 3,
        y + (Math.random() - 0.5) * 3,
        x + dx,
        y + dy
      );
      o.stroke();
    };
    for (let i = 0; i < 16000; i++) stroke();

    // panels + hand-inked borders
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
    const polys = [
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
    ];
    const edges: { pts: number[][]; w: number }[] = [];
    polys.forEach((pl) => {
      for (let pass = 0; pass < 2; pass++) {
        const pts: number[][] = [];
        for (let i = 0; i < 4; i++) {
          const [ax, ay] = pl[i],
            [bx, by] = pl[(i + 1) % 4],
            len = Math.hypot(bx - ax, by - ay),
            n = Math.max(2, Math.floor(len / 14)),
            nx = -(by - ay) / len,
            ny = (bx - ax) / len;
          for (let k = 0; k < n; k++) {
            const tt = k / n,
              j = (Math.random() - 0.5) * (pass ? 1.6 : 1.1);
            pts.push([
              ax + (bx - ax) * tt + nx * j,
              ay + (by - ay) * tt + ny * j,
            ]);
          }
        }
        edges.push({ pts, w: pass ? 1.1 : 2.6 });
      }
    });

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
      // Uniform "contain" scale — fit the source rect fully, never crop/stretch.
      const s = Math.min(boxW / src.w, boxH / src.h);
      sx = sy = s;
      // Center the source rect within the box.
      tx = (boxW - src.w * s) / 2 - src.x * s;
      ty = (boxH - src.h * s) / 2 - src.y * s;
    };

    const draw = () => {
      // paper fills the whole visible surface first (covers areas outside the art)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = "#ebe5d8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // switch into art space (with device-pixel scaling baked in)
      ctx.setTransform(dpr * sx, 0, 0, dpr * sy, dpr * tx, dpr * ty);

      ctx.drawImage(paper, 0, 0);
      ctx.save();
      panelPath(ctx);
      ctx.clip();
      ctx.drawImage(wash, 0, 0);
      ctx.drawImage(ink, 0, 0);
      ctx.restore();

      ctx.strokeStyle = "#16130f";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      edges.forEach((e) => {
        ctx.lineWidth = e.w;
        ctx.beginPath();
        e.pts.forEach((pt, i) =>
          i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])
        );
        ctx.closePath();
        ctx.stroke();
      });

      if (showBats) {
        const P = 4;
        ctx.fillStyle = "#16130f";
        bats.forEach((b) => {
          const sh = Math.floor((t + b.ph) / 5) % 2 ? up : down;
          const bx = Math.round(b.x / P) * P,
            by = Math.round(b.y / P) * P;
          sh.forEach((row, ry) => {
            for (let rx = 0; rx < 7; rx++)
              if (row[rx] === "X") ctx.fillRect(bx + rx * P, by + ry * P, P, P);
          });
        });
      }
    };

    const step = () => {
      for (let i = 0; i < 40; i++) stroke();
      o.globalCompositeOperation = "destination-out";
      o.fillStyle = "rgba(0,0,0,0.006)";
      o.fillRect(0, 0, W, H);
      o.globalCompositeOperation = "source-over";
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
          b.vx *= 2.8 / sp;
          b.vy *= 2.8 / sp;
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

    const up = ["X.....X", "XX.X.XX", ".XXXXX.", "...X..."];
    const down = [".......", ".X.X.X.", "XXXXXXX", "X..X..X"];

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

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left - tx) / sx;
      my = (e.clientY - r.top - ty) / sy;
    };
    const onLeave = () => {
      mx = null;
      my = null;
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
      mqFull.removeEventListener("change", onFullChange);
      mqBats.removeEventListener("change", onBatsChange);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="ink-panels-canvas" />;
}
