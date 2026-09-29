"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import InkBorder from "@/components/InkBorder";
import { stats } from "@/content/stats";

// Split a value like "$27k+" or "1,500+" into prefix / number / suffix so the
// number can count up while the surrounding characters stay put.
function parse(value: string) {
  const m = value.match(/^(\D*)([\d,]+)(.*)$/);
  if (!m) return { prefix: "", target: 0, suffix: value, hasComma: false };
  return {
    prefix: m[1],
    target: parseInt(m[2].replace(/,/g, ""), 10),
    suffix: m[3],
    hasComma: m[2].includes(","),
  };
}

const DURATION = 1200;
const STAGGER = 130;

// The grid is mounted only while the panel is open, so counts always start at 0
// and animate up on mount (skipped under reduced motion).
function StatsGrid() {
  const parsed = useMemo(() => stats.map((s) => parse(s.value)), []);
  const [counts, setCounts] = useState<number[]>(() => stats.map(() => 0));

  useEffect(() => {
    const targets = parsed.map((p) => p.target);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduce ? 0 : DURATION;
    const stag = reduce ? 0 : STAGGER;
    const end = dur + stag * (targets.length - 1);
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const elapsed = now - start;
      setCounts(
        targets.map((t, i) => {
          const p = dur
            ? Math.min(1, Math.max(0, (elapsed - i * stag) / dur))
            : 1;
          return Math.round(t * (1 - Math.pow(1 - p, 3))); // easeOutCubic
        })
      );
      if (elapsed < end) raf = requestAnimationFrame(tick);
      else setCounts(targets);
    });
    return () => cancelAnimationFrame(raf);
  }, [parsed]);

  return (
    <div className="stats-grid">
      {stats.map((s, i) => {
        const { prefix, suffix, hasComma } = parsed[i];
        const n = counts[i];
        return (
          <div className="stat" key={i}>
            <div className="stat-num">
              {prefix}
              {hasComma ? n.toLocaleString("en-US") : n}
              {suffix}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function StatsEasterEgg() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // close on Escape or a click outside
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div className="stats-egg" ref={rootRef}>
      {open ? (
        <div className="stats-panel" role="dialog" aria-label="a few numbers">
          <InkBorder />
          <StatsGrid />
        </div>
      ) : null}

      <button
        type="button"
        className="ink-link ink-link-muted stats-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        psst.
      </button>
    </div>
  );
}
