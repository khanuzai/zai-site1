import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import NotFoundPanel from "@/components/NotFoundPanel";

export const metadata: Metadata = {
  title: "not found · abdullah khan",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="nf">
      <Nav className="page-nav" home />
      <main className="nf-main">
        <div className="nf-panel">
          <NotFoundPanel />
        </div>
        <h1 className="nf-title">nothing here.</h1>
        <Link className="ink-link nf-back" href="/">
          ← back home
        </Link>
      </main>
    </div>
  );
}
