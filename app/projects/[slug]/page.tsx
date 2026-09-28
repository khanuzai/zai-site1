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
      {meta.link ? (
        <p className="project-link">
          <a
            className="ink-link"
            href={meta.link}
            target="_blank"
            rel="noreferrer"
          >
            {meta.link.replace(/^https?:\/\//, "")}
          </a>
        </p>
      ) : null}
      <article className="prose">
        <MDXRemote source={content} />
      </article>
    </PageShell>
  );
}
