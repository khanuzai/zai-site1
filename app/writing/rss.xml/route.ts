import { getAllPosts } from "@/lib/writing";
import { siteUrl, siteName, siteDescription } from "@/lib/site";

export const dynamic = "force-static";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getAllPosts();
  const feedUrl = `${siteUrl}/writing/rss.xml`;
  const updated = posts[0]
    ? new Date(posts[0].date).toUTCString()
    : new Date().toUTCString();

  const items = posts
    .map((p) => {
      const url = `${siteUrl}/writing/${p.slug}`;
      const description = p.summary ?? p.title;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(description)}</description>${p.tags
        ?.map((t) => `\n      <category>${esc(t)}</category>`)
        .join("") ?? ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(siteName)} — writing</title>
    <link>${esc(`${siteUrl}/writing`)}</link>
    <description>${esc(siteDescription)}</description>
    <language>en</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <atom:link href="${esc(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
