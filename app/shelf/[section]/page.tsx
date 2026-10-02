import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { CoverCell, PlaylistCell } from "@/components/ShelfCells";
import { settings, type SectionKey } from "@/content/shelf";
import { resolveItems, resolvePlaylists, isItemSection } from "@/lib/shelf";

// Same daily revalidation as /shelf; one static page per section.
export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return settings.sectionOrder.map((section) => ({ section }));
}

function validSection(section: string): section is SectionKey {
  return (settings.sectionOrder as string[]).includes(section);
}

export async function generateMetadata(
  props: PageProps<"/shelf/[section]">
): Promise<Metadata> {
  const { section } = await props.params;
  if (!validSection(section)) return {};
  return { title: `${settings.headings[section]} · shelf · abdullah khan` };
}

export default async function ShelfSectionPage(
  props: PageProps<"/shelf/[section]">
) {
  const { section } = await props.params;
  if (!validSection(section)) notFound();

  const heading = settings.headings[section];
  const gridStyle = { "--cols": settings.coversPerRow } as CSSProperties;

  let cells;
  if (section === "playlists") {
    const tiles = await resolvePlaylists();
    cells = tiles.map((p, i) => <PlaylistCell key={i} item={p} />);
  } else if (isItemSection(section)) {
    const items = await resolveItems(section);
    cells = items.map((it, i) => <CoverCell key={i} item={it} showYear />);
  }

  return (
    <PageShell title={heading} wide>
      <div className={`shelf-root${settings.grayscale ? " is-grayscale" : ""}`}>
        <Link className="ink-link shelf-back" href="/shelf">
          ← shelf
        </Link>
        <div className="shelf-grid" style={gridStyle}>
          {cells}
        </div>
      </div>
    </PageShell>
  );
}
