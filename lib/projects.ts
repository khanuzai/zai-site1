import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content", "projects");

export type ProjectLink = { label: string; href: string };

export type ProjectFrontmatter = {
  title: string;
  summary: string;
  order: number; // controls listing order (ascending)
  stack: string[];
  links: ProjectLink[];
};

export type ProjectMeta = ProjectFrontmatter & { slug: string };

export function getProjectSlugs(): string[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getAllProjects(): ProjectMeta[] {
  return getProjectSlugs()
    .map((slug) => {
      const raw = fs.readFileSync(path.join(DIR, `${slug}.mdx`), "utf8");
      const { data } = matter(raw);
      return { slug, ...(data as ProjectFrontmatter) };
    })
    .sort((a, b) => a.order - b.order);
}

export function getProject(
  slug: string
): { meta: ProjectMeta; content: string } | null {
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return { meta: { slug, ...(data as ProjectFrontmatter) }, content };
}
