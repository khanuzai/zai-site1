import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content", "writing");

export type PostFrontmatter = {
  title: string;
  date: string; // ISO date
  tags?: string[];
  draft?: boolean;
  summary?: string;
};

export type PostMeta = PostFrontmatter & { slug: string };

// Drafts are shown in development but hidden from listings, feeds, and static
// generation in production.
const showDrafts = process.env.NODE_ENV !== "production";

function readAll(): { meta: PostMeta; content: string }[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(DIR, f), "utf8");
      const { data, content } = matter(raw);
      return { meta: { slug, ...(data as PostFrontmatter) }, content };
    });
}

export function getAllPosts(): PostMeta[] {
  return readAll()
    .map((p) => p.meta)
    .filter((m) => showDrafts || !m.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostSlugs(): string[] {
  return getAllPosts().map((m) => m.slug);
}

export function getPost(
  slug: string
): { meta: PostMeta; content: string } | null {
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const meta: PostMeta = { slug, ...(data as PostFrontmatter) };
  if (!showDrafts && meta.draft) return null;
  return { meta, content };
}
