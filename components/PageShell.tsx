import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import InkRule from "@/components/InkRule";

// Shared inner-page layout: the same nav at the top, then a single left-aligned
// column (max-width 720px) with a Cormorant title and a hand-inked rule under it.
// No canvas animation on inner pages.
export default function PageShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="page">
      <Nav className="page-nav" />
      <main className="page-main">
        <h1 className="page-title">{title}</h1>
        <InkRule />
        <div className="page-body">{children}</div>
      </main>
    </div>
  );
}
