// Shared shelf data resolution, used by /shelf and /shelf/[section]. Covers are
// fetched at build time (lib/covers, lib/spotify). Resolved shapes carry what the
// UI needs: title, year, note, cover url (or null), and whether it's featured.

import {
  settings,
  spotifyUrl,
  playlists,
  anime,
  books,
  movies,
  type ShelfItem,
} from "@/content/shelf";
import { anilistCover, bookCover, movieCover, spotifyOEmbed } from "@/lib/covers";
import { getUserPlaylists } from "@/lib/spotify";

export type ResolvedItem = {
  title: string;
  year?: number;
  note?: string;
  cover: string | null;
  featured: boolean;
};

export type ResolvedPlaylist = {
  title: string;
  cover: string | null;
  href: string;
};

const isProd = process.env.NODE_ENV === "production";
const isTodo = (title: string) => /^todo/i.test(title.trim());

// The cover-grid sections (ShelfItem lists). Playlists are handled separately.
const ITEM_SECTIONS = { anime, books, movies } as const;
export type ItemSectionKey = keyof typeof ITEM_SECTIONS;

export function isItemSection(key: string): key is ItemSectionKey {
  return key in ITEM_SECTIONS;
}

function lookupFor(key: ItemSectionKey): (it: ShelfItem) => Promise<string | null> {
  if (key === "anime")
    return (it) => anilistCover(it.title, it.type ?? "anime", it.year);
  if (key === "books") return (it) => bookCover(it.title, it.year);
  return (it) => movieCover(it.title, it.year);
}

export async function resolveItems(key: ItemSectionKey): Promise<ResolvedItem[]> {
  const lookup = lookupFor(key);
  // In production, drop TODO placeholders; in development keep showing them.
  const items = isProd
    ? ITEM_SECTIONS[key].filter((it) => !isTodo(it.title))
    : ITEM_SECTIONS[key];
  return Promise.all(
    items.map(async (item) => ({
      title: item.title,
      year: item.year,
      note: item.note,
      featured: item.featured === true,
      cover: item.cover ?? (isTodo(item.title) ? null : await lookup(item)),
    }))
  );
}

// Playlist tiles: manual array wins; otherwise fetch from Spotify; then apply the
// hide/limit settings. Failures/missing keys leave the list empty.
export async function resolvePlaylists(): Promise<ResolvedPlaylist[]> {
  let tiles: ResolvedPlaylist[] = [];

  if (playlists.length > 0) {
    const resolved = await Promise.all(
      playlists.map(async (href) => {
        const data = await spotifyOEmbed(href);
        return data ? { title: data.title, cover: data.thumbnail, href } : null;
      })
    );
    tiles = resolved.filter((t): t is ResolvedPlaylist => t !== null);
  } else {
    const auto = await getUserPlaylists(spotifyUrl);
    if (auto) tiles = auto.map((p) => ({ title: p.name, cover: p.cover, href: p.url }));
  }

  const hidden = new Set(
    settings.hidePlaylists.map((n) => n.trim().toLowerCase())
  );
  tiles = tiles.filter((t) => !hidden.has(t.title.trim().toLowerCase()));
  if (settings.maxPlaylists > 0) tiles = tiles.slice(0, settings.maxPlaylists);
  return tiles;
}

// Preview order: featured first (file order within each group), then the rest,
// sliced to `count`. `isFeatured` defaults to "nothing featured" (e.g. playlists).
export function preview<T>(
  items: T[],
  count: number,
  isFeatured: (item: T) => boolean = () => false
): T[] {
  const featured = items.filter(isFeatured);
  const rest = items.filter((i) => !isFeatured(i));
  return [...featured, ...rest].slice(0, count);
}
