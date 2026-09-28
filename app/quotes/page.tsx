import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { quotes } from "@/content/quotes";

export const metadata: Metadata = {
  title: "quotes — abdullah khan",
};

export default function QuotesPage() {
  return (
    <PageShell title="quotes">
      <ul className="quote-list">
        {quotes.map((q, i) => (
          <li key={i} className="quote">
            <p className="quote-ur" lang="ur" dir="rtl">
              {q.ur.split("\n").map((line, j) => (
                <span key={j} className="quote-line">
                  {line}
                </span>
              ))}
            </p>
            <div className="quote-en">
              <p>
                {q.en.split("\n").map((line, j) => (
                  <span key={j} className="quote-line">
                    {line}
                  </span>
                ))}
              </p>
              {q.author ? <p className="quote-author">— {q.author}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
