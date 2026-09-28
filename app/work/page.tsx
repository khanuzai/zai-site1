import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { work } from "@/content/work";

export const metadata: Metadata = {
  title: "work — abdullah khan",
};

export default function WorkPage() {
  return (
    <PageShell title="work">
      <ol className="timeline">
        {work.map((w) => (
          <li key={`${w.company}-${w.period}`} className="timeline-item">
            <div className="timeline-head">
              <h2 className="timeline-role">{w.role}</h2>
              <span className="timeline-period">{w.period}</span>
            </div>
            <p className="timeline-company">
              {w.company} · {w.location}
            </p>
            {w.summary ? (
              <p className="timeline-summary">{w.summary}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
