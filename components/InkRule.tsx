// A thin, hand-inked horizontal rule. The wobble is generated from a fixed seed
// so it is deterministic — the same line every render, "generated once", with no
// client-side JavaScript. Stretches to the width of its container.

const W = 720;
const H = 12;

function makePath(): string {
  // small seeded PRNG for a stable wobble
  let seed = 20260927;
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

const path = makePath();

export default function InkRule() {
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
      <path
        d={path}
        fill="none"
        stroke="var(--ink)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
