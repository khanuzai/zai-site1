import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "projects — abdullah khan",
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  return (
    <PageShell title="projects">
      <ul className="card-list">
        {projects.map((p) => (
          <li key={p.slug} className="card">
            <h2 className="card-title">
              <Link className="ink-link" href={`/projects/${p.slug}`}>
                {p.title}
              </Link>
            </h2>
            <p className="card-summary">{p.summary}</p>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
