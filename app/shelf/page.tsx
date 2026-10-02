import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { CoverCell, PlaylistCell } from "@/components/ShelfCells";
import { settings, spotifyUrl } from "@/content/shelf";
import {
  resolveItems,
  resolvePlaylists,
  preview,
  isItemSection,
} from "@/lib/shelf";

// Rebuild the page at most once a day so new playlists appear without a redeploy.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "shelf — abdullah khan",
};

const isProd = process.env.NODE_ENV === "production";

export default async function ShelfPage() {
  const [animeR, booksR, moviesR, playlistTiles] = await Promise.all([
    resolveItems("anime"),
    resolveItems("books"),
    resolveItems("movies"),
    resolvePlaylists(),
  ]);
  const itemSections = { anime: animeR, books: booksR, movies: moviesR };

  const { previewCount, coversPerRow } = settings;
  const gridStyle = { "--cols": coversPerRow } as CSSProperties;
  const spotifyIsUrl = /^https?:\/\//.test(spotifyUrl);
  const showSpotify = spotifyIsUrl || !isProd;

  const spotifyLink = (extra = "") => {
    if (!showSpotify) return null;
    return spotifyIsUrl ? (
      <a
        className={`ink-link shelf-spotify ${extra}`.trim()}
        href={spotifyUrl}
        target="_blank"
        rel="noreferrer"
      >
        listening on spotify →
      </a>
    ) : (
      <p className={`shelf-spotify shelf-spotify--todo ${extra}`.trim()}>
        listening on spotify → (todo)
      </p>
    );
  };

  const viewAll = (key: string) => (
    <Link className="ink-link shelf-viewall" href={`/shelf/${key}`}>
      view all →
    </Link>
  );

  return (
    <PageShell title="shelf" wide>
      <div className={`shelf-root${settings.grayscale ? " is-grayscale" : ""}`}>
        {settings.sectionOrder.map((key) => {
          const heading = settings.headings[key];

          if (key === "playlists") {
            if (playlistTiles.length === 0) {
              const link = spotifyLink();
              return link ? <div key={key}>{link}</div> : null;
            }
            return (
              <section key={key} className="shelf-section">
                <h2 className="shelf-h">{heading}</h2>
                <div className="shelf-grid" style={gridStyle}>
                  {preview(playlistTiles, previewCount).map((p, i) => (
                    <PlaylistCell key={i} item={p} />
                  ))}
                </div>
                {playlistTiles.length > previewCount ? viewAll("playlists") : null}
                {spotifyLink("shelf-spotify--end")}
              </section>
            );
          }

          if (!isItemSection(key)) return null;
          const full = itemSections[key];
          if (full.length === 0) return null;
          return (
            <section key={key} className="shelf-section">
              <h2 className="shelf-h">{heading}</h2>
              <div className="shelf-grid" style={gridStyle}>
                {preview(full, previewCount, (it) => it.featured).map((it, i) => (
                  <CoverCell key={i} item={it} />
                ))}
              </div>
              {full.length > previewCount ? viewAll(key) : null}
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
