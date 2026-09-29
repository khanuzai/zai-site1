"use client";

import { useEffect, useState } from "react";

/**
 * Intro screen shown the moment someone first opens the site (once per tab
 * session). It's a real full-screen button so click, tap, keyboard and screen
 * readers all work. The page renders underneath in the SSR HTML — the overlay
 * only sits on top — so nothing is hidden from search engines.
 *
 * An inline script in the root layout sets data-intro="seen" before paint when
 * the session already saw it, and CSS hides this overlay in that case, so there
 * is no flash when navigating between pages within a session.
 *
 * This is the one deliberate exception to the "no loading screens" rule; see
 * CLAUDE.md.
 */
type Phase = "open" | "closing" | "closed";

export default function IntroOverlay() {
  const [phase, setPhase] = useState<Phase>("open");

  // If this session already dismissed it, close immediately (CSS already hid it).
  // We must render "open" on the server (sessionStorage is client-only) and reconcile
  // after mount, so the setState here is intentional and can't be a lazy initializer.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (sessionStorage.getItem("intro-seen")) setPhase("closed");
    } catch {
      /* sessionStorage unavailable — just show it */
    }
  }, []);

  // Any key dismisses too (not only the button's Enter/Space).
  useEffect(() => {
    if (phase !== "open") return;
    const onKey = () => dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  function dismiss() {
    setPhase((current) => {
      if (current !== "open") return current;
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {
        /* ignore */
      }
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return "closed";
      window.setTimeout(() => setPhase("closed"), 400);
      return "closing";
    });
  }

  if (phase === "closed") return null;

  return (
    <button
      type="button"
      className={`intro-overlay${phase === "closing" ? " is-closing" : ""}`}
      onClick={dismiss}
      autoFocus
    >
      <span className="intro-title">
        open on a laptop or a pc hamna not ur phone, theek hai na
      </span>
      <span className="intro-hint">press anywhere to continue</span>
    </button>
  );
}
