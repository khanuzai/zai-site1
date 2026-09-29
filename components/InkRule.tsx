"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

// A thin, hand-inked horizontal rule under page titles. The stroke, thickness,
// and style are identical everywhere, but each route gets its own wobble: the
// hills come from a seeded PRNG keyed to the current pathname, so a given page
// always draws the same line while different pages differ. On load it draws
// itself left-to-right via stroke-dashoffset (see .ink-rule in globals.css,
// which also skips the animation under prefers-reduced-motion).

const W = 720;
const H = 12;

// FNV-1a hash → a stable 32-bit seed from the route string.
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makePath(seed0: number): string {
  let seed = seed0 & 0x7fffffff;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const mid = H / 2;
  const n = Math.floor(W / 26);
  let prevX = 0;
  let prevY = mid;
  let d = `M 0 ${mid.toFixed(2)}`;
  for (let i = 1; i <= n; i++) {
    const x = (W * i) / n;
    const y = mid + (rnd() - 0.5) * (H - 3);
    const cx = (prevX + x) / 2 + (rnd() - 0.5) * 6;
    const cy = (prevY + y) / 2 + (rnd() - 0.5) * 4;
    d += ` Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
    prevX = x;
    prevY = y;
  }
  return d;
}

export default function InkRule() {
  const pathname = usePathname();
  const d = useMemo(() => makePath(hashSeed(pathname || "/")), [pathname]);
  return (
    <svg
      className="ink-rule"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      aria-hidden="true"
      role="presentation"
    >
      {/* pathLength normalizes the length to 1 so the draw animation in CSS can
          use dasharray/dashoffset of 1 without measuring the real length. The
          pathname key remounts the path on route change so the draw replays. */}
      <path
        key={pathname}
        d={d}
        pathLength={1}
        fill="none"
        stroke="var(--ink)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
