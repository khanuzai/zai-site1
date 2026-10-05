// ============================================================================
// SHELF CONTENT  —  edit this file to change what shows on /shelf
// A plain-language guide lives in content/README.md. Covers are fetched
// automatically at build time, so you usually only type titles (and a year).
// ============================================================================

export type ShelfKind = "anime" | "manga";

// One thing on a shelf (an anime/manga, a book, or a movie).
export type ShelfItem = {
  // required — what it's called. also used to search for the cover.
  title: string;
  // optional — release year. helps pick the RIGHT cover when titles repeat
  // (matters most for movies, e.g. two films with the same name).
  year?: number;
  // optional — a short line shown under the title in small muted text.
  note?: string;
  // optional — a manual image URL that overrides the automatic cover lookup.
  cover?: string;
  // anime section only — "anime" (default) or "manga". ignored elsewhere.
  type?: ShelfKind;
  // optional — show this one first in the section's preview on /shelf.
  featured?: boolean;
};

// The sections that can appear on the page.
export type SectionKey = "playlists" | "anime" | "books" | "movies";

// ── SETTINGS ────────────────────────────────────────────────────────────────
// Quick knobs you can change on their own, without touching the content below.
export const settings = {
  // The order sections appear on the page, top to bottom.
  // Delete a key from this list to hide that whole section.
  sectionOrder: ["playlists", "anime", "books", "movies"] as SectionKey[],

  // The heading shown above each section (kept lowercase to match the site).
  headings: {
    playlists: "playlists",
    anime: "anime",
    books: "books",
    movies: "movies",
  } as Record<SectionKey, string>,

  // How many covers per row on desktop. (Tablet is always 3, mobile always 2.)
  coversPerRow: 5,

  // How many items each section shows on /shelf before a "view all →" link.
  // Featured items (featured: true) come first, then the rest in file order.
  previewCount: 5,

  // Covers in grayscale that fade to full color on hover/focus?
  // true = grayscale, false = always full color.
  grayscale: true,

  // The most playlists to show (after any hidden ones are removed).
  maxPlaylists: 12,

  // Playlist names to leave out (case-insensitive, matched on the exact name).
  hidePlaylists: [] as string[],
};

// ── SPOTIFY ───────────────────────────────────────────────────────────────
// Your profile link. Shown as "listening on spotify →" right under the rule.
export const spotifyUrl =
  "https://open.spotify.com/user/2wecein1elktvddp555a3d5t0";

// Playlists.
// The automatic Spotify Web API list is currently blocked: client-credentials
// (app-only) tokens get 403 Forbidden on the "get a user's playlists" endpoint,
// so we use this manual list instead (covers + titles still come from Spotify's
// public oEmbed). If this array is empty, the code will try the automatic list.
// To add/remove a playlist, paste/delete its full URL below.
export const playlists: string[] = [
  "https://open.spotify.com/playlist/0VFAfG6HqMsS2LPFuXw1As",
  "https://open.spotify.com/playlist/0qVA5bIuXeqcJLeTShe7Kb",
  "https://open.spotify.com/playlist/15kwPs7JyGMiJlLkk6MsHm",
  "https://open.spotify.com/playlist/2cYPPBIMI67bCUwzAfpZIt",
  "https://open.spotify.com/playlist/2mxzXUuqrZS5MCFwbzyRCR",
  "https://open.spotify.com/playlist/3ooE9IJX1dgF7w5wtcWyAf",
  "https://open.spotify.com/playlist/4CDG4dLkZxECYBQgAgg7Rb",
  "https://open.spotify.com/playlist/5MuYcUMCHfEtnpOAgAj1iM",
  "https://open.spotify.com/playlist/5r5huRHvKPTPQzDBCPJY8p",
  "https://open.spotify.com/playlist/7MQXChykoCemlaiPwQppde",
];

// ── ANIME & MANGA (covers from AniList) ──────────────────────────────────────
// Set type: "manga" for manga; leave type off for anime.
export const anime: ShelfItem[] = [
  // EXAMPLE — copy a line like this to add your own:
  //   { title: "chainsaw man", year: 2022, note: "rewatching", type: "anime" },
  { title: "berserk" },
  { title: "vagabond", type: "manga" },
  { title: "tokyo ghoul" },
  { title: "solo leveling" },
  { title: "baki" },
  { title: "hellsing" },
  { title: "bleach" },
  { title: "kengan ashura" },
  { title: "black clover"}
];

// ── BOOKS (covers from Open Library) ─────────────────────────────────────────
export const books: ShelfItem[] = [
  // EXAMPLE — copy a line like this to add your own:
  //   { title: "the pragmatic programmer", year: 1999, note: "on the desk" },
  { title: "atomic habits", note: "currently reading" },
];

// ── MOVIES (posters from TMDB — set TMDB_API_KEY to enable) ──────────────────
// Add the year so TMDB picks the right film.
export const movies: ShelfItem[] = [
  // EXAMPLE — copy a line like this to add your own:
  //   { title: "blade runner 2049", year: 2017, note: "favorite" },
  { title: "deliver us from evil", year: 2014, featured: true },
  { title: "the dark knight", year: 2008, featured: true },
  { title: "moneyball", year: 2011, featured: true },
  { title: "21", year: 2008 },
  { title: "limitless", year: 2011 },
  { title: "the wolf of wall street", year: 2013 },
  { title: "the social network", year: 2010, featured: true },
  { title: "interstellar", year: 2014, featured: true },
  { title: "project hail mary", year: 2026 },
  { title: "obsession", year: 2025 },
];
