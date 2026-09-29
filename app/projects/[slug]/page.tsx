import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import PageShell from "@/components/PageShell";
import { getProject, getProjectSlugs } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.meta.title} — abdullah khan`,
    description: project.meta.summary,
  };
}

export default async function ProjectPage(
  props: PageProps<"/projects/[slug]">
) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();
  const { meta, content } = project;

  return (
    <PageShell title={meta.title}>
      <p className="project-meta">{meta.summary}</p>
      <article className="prose">
        <MDXRemote source={content} />
      </article>

      <div className="project-foot">
        <h2 className="project-foot-h">stack</h2>
        <p className="project-foot-p">{meta.stack.join(", ")}</p>

        <h2 className="project-foot-h">links</h2>
        <ul className="project-foot-links">
          {meta.links.map((l) => (
            <li key={l.label}>
              {l.href.startsWith("TODO") ? (
                <span className="project-foot-todo">
                  {l.label} — {l.href}
                </span>
              ) : (
                <a
                  className="ink-link"
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
