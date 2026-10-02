// Shared manga-panel drawing primitives, used by both the homepage canvas
// (components/InkPanels.tsx) and the 404 panel (components/NotFoundPanel.tsx).
// Plain Canvas 2D; these run only in the browser (called from client effects).

export const INK = "#16130f";
export const PAPER = "#ebe5d8";

export function offscreen(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

// Value-noise sampler (smooth pseudo-random field) used to vary hatch density.
export function makeNoise(size = 256): (x: number, y: number) => number {
  const tbl = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) tbl[i] = Math.random();
  const g = (a: number, b: number) =>
    tbl[(a & (size - 1)) * size + (b & (size - 1))];
  return (x: number, y: number) => {
    const xi = Math.floor(x),
      yi = Math.floor(y),
      xf = x - xi,
      yf = y - yi;
    const u = xf * xf * (3 - 2 * xf),
      v = yf * yf * (3 - 2 * yf);
    const a = g(xi, yi),
      b = g(xi + 1, yi),
      c = g(xi, yi + 1),
      d = g(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

// Offscreen paper with faint grain.
export function paintPaper(w: number, h: number): HTMLCanvasElement {
  const paper = offscreen(w, h);
  const p = paper.getContext("2d")!;
  p.fillStyle = PAPER;
  p.fillRect(0, 0, w, h);
  const grains = Math.round((w * h) / 144); // ~9000 at 1440x900
  for (let i = 0; i < grains; i++) {
    p.fillStyle =
      Math.random() < 0.5 ? "rgba(90,78,60,0.05)" : "rgba(255,255,255,0.25)";
    p.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1);
  }
  return paper;
}

// One crosshatch stroke into `o` at (x, y). `d` (0..1) is the local density:
// the stroke is skipped with probability (1 - d), and denser areas add more
// crossing layers. Identical to the homepage's stroke.
export function hatchStroke(
  o: CanvasRenderingContext2D,
  x: number,
  y: number,
  d: number
): void {
  if (Math.random() > d) return;
  const layer = d > 0.8 ? 2 : d > 0.45 ? 1 : 0;
  const ang = [Math.PI / 4, -Math.PI / 4, 0.1][
    Math.floor(Math.random() * (layer + 1))
  ];
  const len = 12 + Math.random() * 40 * (0.5 + d),
    dx = (Math.cos(ang) * len) / 2,
    dy = (Math.sin(ang) * len) / 2;
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
}

// Very slightly erase the ink layer so older strokes fade (self-redrawing look).
export function fadeInk(
  o: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount = 0.006
): void {
  o.globalCompositeOperation = "destination-out";
  o.fillStyle = `rgba(0,0,0,${amount})`;
  o.fillRect(0, 0, w, h);
  o.globalCompositeOperation = "source-over";
}

export type InkEdge = { pts: number[][]; w: number };

// Hand-inked double border for one or more polygons (each an array of [x,y]
// corners): two jittered passes per polygon, a thick one and a thin one.
export function inkBorder(polys: number[][][]): InkEdge[] {
  const edges: InkEdge[] = [];
  polys.forEach((pl) => {
    for (let pass = 0; pass < 2; pass++) {
      const pts: number[][] = [];
      for (let i = 0; i < pl.length; i++) {
        const [ax, ay] = pl[i],
          [bx, by] = pl[(i + 1) % pl.length],
          len = Math.hypot(bx - ax, by - ay) || 1,
          n = Math.max(2, Math.floor(len / 14)),
          nx = -(by - ay) / len,
          ny = (bx - ax) / len;
        for (let k = 0; k < n; k++) {
          const tt = k / n,
            j = (Math.random() - 0.5) * (pass ? 1.6 : 1.1);
          pts.push([ax + (bx - ax) * tt + nx * j, ay + (by - ay) * tt + ny * j]);
        }
      }
      edges.push({ pts, w: pass ? 1.1 : 2.6 });
    }
  });
  return edges;
}

export function strokeEdges(
  ctx: CanvasRenderingContext2D,
  edges: InkEdge[]
): void {
  ctx.strokeStyle = INK;
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
}

// The pixel-bat sprite (two wing frames), same as the homepage.
export const BAT_UP = ["X.....X", "XX.X.XX", ".XXXXX.", "...X..."];
export const BAT_DOWN = [".......", ".X.X.X.", "XXXXXXX", "X..X..X"];

export function drawBat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  P = 4
): void {
  const sh = frame % 2 ? BAT_UP : BAT_DOWN;
  const bx = Math.round(x / P) * P,
    by = Math.round(y / P) * P;
  ctx.fillStyle = INK;
  sh.forEach((row, ry) => {
    for (let rx = 0; rx < 7; rx++)
      if (row[rx] === "X") ctx.fillRect(bx + rx * P, by + ry * P, P, P);
  });
}
