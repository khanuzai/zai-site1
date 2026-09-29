"use client";

import { useEffect, useRef, useState } from "react";

// The same hand-inked double border as the homepage panels: two jittered passes
// tracing the box perimeter (a thicker pass + a thin pass), ink on paper. It
// measures its parent (which must be position: relative) and draws in real
// pixels so the wobble never distorts. Deterministic — same box, same wobble.

function rand(seed: number) {
  let s = seed & 0x7fffffff;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function perimeter(
  w: number,
  h: number,
  inset: number,
  jitter: number,
  rnd: () => number
) {
  const corners = [
    [inset, inset],
    [w - inset, inset],
    [w - inset, h - inset],
    [inset, h - inset],
  ];
  let d = "";
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = corners[i];
    const [bx, by] = corners[(i + 1) % 4];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const n = Math.max(2, Math.floor(len / 14));
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const j = (rnd() - 0.5) * jitter;
      const x = ax + (bx - ax) * t + nx * j;
      const y = ay + (by - ay) * t + ny * j;
      d += `${i === 0 && k === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  }
  return d + "Z";
}

export default function InkBorder() {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const ro = new ResizeObserver(() => {
      const r = parent.getBoundingClientRect();
      setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const rnd = rand(9187);
  const passes =
    w && h
      ? [
          { d: perimeter(w, h, 6, 1.6, rnd), width: 2.4 },
          { d: perimeter(w, h, 6, 2.4, rnd), width: 1.1 },
        ]
      : [];

  return (
    <svg
      ref={ref}
      className="ink-border"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
    >
      {passes.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={p.width}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
