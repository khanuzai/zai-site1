import type { Metadata } from "next";
import type { ComponentPropsWithoutRef } from "react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import PageShell from "@/components/PageShell";
import FindMe from "@/components/FindMe";
import { getPost, getPostSlugs } from "@/lib/writing";
import { formatDate } from "@/lib/date";

// Links to other sites open in a new tab; internal links navigate in place.
function MdxLink(props: ComponentPropsWithoutRef<"a">) {
  const external = /^https?:\/\//.test(props.href ?? "");
  return external ? (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ) : (
    <a {...props} />
  );
}

// Components available to any post's MDX.
const mdxComponents = { FindMe, a: MdxLink };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/writing/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.meta.title} — abdullah khan`,
    description: post.meta.summary,
  };
}

export default async function PostPage(props: PageProps<"/writing/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();
  const { meta, content } = post;

  return (
    <PageShell title={meta.title}>
      <p className="post-date">
        {formatDate(meta.date)}
        {meta.draft ? <span className="draft-tag"> · draft</span> : null}
      </p>
      {meta.tags && meta.tags.length > 0 ? (
        <p className="card-tech post-tags">
          {meta.tags.map((t) => `#${t}`).join(" ")}
        </p>
      ) : null}
      <article className="prose">
        <MDXRemote source={content} components={mdxComponents} />
      </article>
    </PageShell>
  );
}
