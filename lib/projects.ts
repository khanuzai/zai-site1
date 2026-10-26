import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content", "projects");

export type ProjectLink = { label: string; href: string };
export type ProjectStat = { value: string; label: string };

export type ProjectFrontmatter = {
  title: string;
  summary: string;
  order: number; // controls listing order (ascending)
  stack: string[];
  links: ProjectLink[];
  stats?: ProjectStat[]; // optional headline numbers shown under the title
  status?: string; // optional small muted label under the title (e.g. "in progress")
  draft?: boolean;
};

export type ProjectMeta = ProjectFrontmatter & { slug: string };

// Drafts are shown in development but hidden from listings and static
// generation in production.
const showDrafts = process.env.NODE_ENV !== "production";

export function getAllProjects(): ProjectMeta[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(DIR, f), "utf8");
      const { data } = matter(raw);
      return { slug, ...(data as ProjectFrontmatter) };
    })
    .filter((m) => showDrafts || !m.draft)
    .sort((a, b) => a.order - b.order);
}

export function getProjectSlugs(): string[] {
  return getAllProjects().map((m) => m.slug);
}

export function getProject(
  slug: string
): { meta: ProjectMeta; content: string } | null {
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const meta: ProjectMeta = { slug, ...(data as ProjectFrontmatter) };
  if (!showDrafts && meta.draft) return null;
  return { meta, content };
}
