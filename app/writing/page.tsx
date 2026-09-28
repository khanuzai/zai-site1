import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { getAllPosts } from "@/lib/writing";
import { formatDate } from "@/lib/date";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "writing — abdullah khan",
  alternates: {
    types: {
      "application/rss+xml": [
        { url: `${siteUrl}/writing/rss.xml`, title: "abdullah khan — writing" },
      ],
    },
  },
};

export default function WritingPage() {
  const posts = getAllPosts();
  return (
    <PageShell title="writing">
      {posts.length === 0 ? (
        <p className="empty">TODO: nothing published yet.</p>
      ) : (
        <ul className="card-list">
          {posts.map((p) => (
            <li key={p.slug} className="card">
              <p className="post-date">
                {formatDate(p.date)}
                {p.draft ? <span className="draft-tag"> · draft</span> : null}
              </p>
              <h2 className="card-title">
                <Link className="ink-link" href={`/writing/${p.slug}`}>
                  {p.title}
                </Link>
              </h2>
              {p.summary ? <p className="card-summary">{p.summary}</p> : null}
              {p.tags && p.tags.length > 0 ? (
                <p className="card-tech">{p.tags.map((t) => `#${t}`).join(" ")}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
