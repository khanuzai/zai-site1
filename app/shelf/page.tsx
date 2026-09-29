import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import PageShell from "@/components/PageShell";
import {
  settings,
  spotifyUrl,
  playlists,
  anime,
  books,
  movies,
  type ShelfItem,
} from "@/content/shelf";
import {
  anilistCover,
  bookCover,
  movieCover,
  spotifyOEmbed,
} from "@/lib/covers";
import { getUserPlaylists } from "@/lib/spotify";

// Rebuild the page at most once a day so new playlists appear without a redeploy.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "shelf — abdullah khan",
};

type Resolved = { title: string; note?: string; cover: string | null };
type Playlist = { title: string; cover: string | null; href: string };

const isProd = process.env.NODE_ENV === "production";
const isTodo = (title: string) => /^todo/i.test(title.trim());
const IMG_SIZES = "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px";

function CoverArt({ title, cover }: { title: string; cover: string | null }) {
  if (cover) {
    // unoptimized: the browser loads the cover directly and follows redirects
    // (Open Library covers 302 to the Internet Archive), so nothing looks broken.
    return (
      <Image
        src={cover}
        alt=""
        fill
        sizes={IMG_SIZES}
        className="cover-img"
        unoptimized
      />
    );
  }
  return <div className="cover-ph">{title}</div>;
}

function Caption({ title, note }: { title: string; note?: string }) {
  return (
    <figcaption className="shelf-cap">
      <span className="shelf-cap-title">{title}</span>
      {note ? <span className="shelf-cap-note">{note}</span> : null}
    </figcaption>
  );
}

function CoverCell({ title, note, cover }: Resolved) {
  return (
    <figure className="shelf-cell">
      <div className="cover-frame" tabIndex={0}>
        <CoverArt title={title} cover={cover} />
      </div>
      <Caption title={title} note={note} />
    </figure>
  );
}

function PlaylistCell({ title, cover, href }: Playlist) {
  return (
    <figure className="shelf-cell">
      <a className="cover-a" href={href} target="_blank" rel="noreferrer">
        <div className="cover-frame cover-frame--square">
          <CoverArt title={title} cover={cover} />
        </div>
      </a>
      <Caption title={title} />
    </figure>
  );
}

// Playlist tiles: manual array wins; otherwise fetch from Spotify; then apply the
// hide/limit settings. Failures/missing keys leave the list empty (section hidden).
async function resolvePlaylists(): Promise<Playlist[]> {
  let tiles: Playlist[] = [];

  if (playlists.length > 0) {
    const resolved = await Promise.all(
      playlists.map(async (href) => {
        const data = await spotifyOEmbed(href);
        return data ? { title: data.title, cover: data.thumbnail, href } : null;
      })
    );
    tiles = resolved.filter((t): t is Playlist => t !== null);
  } else {
    const auto = await getUserPlaylists(spotifyUrl);
    if (auto) {
      tiles = auto.map((p) => ({ title: p.name, cover: p.cover, href: p.url }));
    }
  }

  const hidden = new Set(
    settings.hidePlaylists.map((n) => n.trim().toLowerCase())
  );
  tiles = tiles.filter((t) => !hidden.has(t.title.trim().toLowerCase()));
  if (settings.maxPlaylists > 0) tiles = tiles.slice(0, settings.maxPlaylists);
  return tiles;
}

export default async function ShelfPage() {
  // In production, drop TODO placeholders; in development keep showing them.
  const visible = (items: ShelfItem[]) =>
    isProd ? items.filter((it) => !isTodo(it.title)) : items;

  const resolve = async (
    items: ShelfItem[],
    lookup: (item: ShelfItem) => Promise<string | null>
  ): Promise<Resolved[]> =>
    Promise.all(
      visible(items).map(async (item) => ({
        title: item.title,
        note: item.note,
        cover: item.cover ?? (isTodo(item.title) ? null : await lookup(item)),
      }))
    );

  const [animeR, booksR, moviesR, playlistTiles] = await Promise.all([
    resolve(anime, (it) => anilistCover(it.title, it.type ?? "anime", it.year)),
    resolve(books, (it) => bookCover(it.title, it.year)),
    resolve(movies, (it) => movieCover(it.title, it.year)),
    resolvePlaylists(),
  ]);

  const covers: Record<"anime" | "books" | "movies", Resolved[]> = {
    anime: animeR,
    books: booksR,
    movies: moviesR,
  };
  const coverItems = (key: string): Resolved[] =>
    key in covers ? covers[key as keyof typeof covers] : [];

  const spotifyIsUrl = /^https?:\/\//.test(spotifyUrl);
  const showSpotify = spotifyIsUrl || !isProd;
  const gridStyle = { "--cols": settings.coversPerRow } as CSSProperties;

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

  return (
    <PageShell title="shelf" wide>
      <div className={`shelf-root${settings.grayscale ? " is-grayscale" : ""}`}>
        {/* playlists first, right under the rule; spotify link at its end */}
        {playlistTiles.length > 0 ? (
          <section className="shelf-section">
            <h2 className="shelf-h">{settings.headings.playlists}</h2>
            <div className="shelf-grid" style={gridStyle}>
              {playlistTiles.map((p, i) => (
                <PlaylistCell key={i} {...p} />
              ))}
            </div>
            {spotifyLink("shelf-spotify--end")}
          </section>
        ) : (
          spotifyLink()
        )}

        {settings.sectionOrder
          .filter((key) => key !== "playlists")
          .map((key) => {
            const items = coverItems(key);
            if (items.length === 0) return null;
            return (
              <section key={key} className="shelf-section">
                <h2 className="shelf-h">{settings.headings[key]}</h2>
                <div className="shelf-grid" style={gridStyle}>
                  {items.map((it, i) => (
                    <CoverCell key={i} {...it} />
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </PageShell>
  );
}
