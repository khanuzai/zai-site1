import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { work } from "@/content/work";

export const metadata: Metadata = {
  title: "work — abdullah khan",
};

// Render **phrases** as highlighted spans; everything else stays plain text.
function renderSummary(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="timeline-hl">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export default function WorkPage() {
  return (
    <PageShell title="work">
      <ol className="timeline">
        {work.map((w) => (
          <li key={`${w.company}-${w.period}`} className="timeline-item">
            <div className="timeline-head">
              <h2 className="timeline-company">{w.company}</h2>
              <span className="timeline-period">{w.period}</span>
            </div>
            <p className="timeline-role">
              {w.role} · {w.location}
            </p>
            {w.summary ? (
              <p className="timeline-summary">{renderSummary(w.summary)}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
