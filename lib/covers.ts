import type { ShelfKind } from "@/content/shelf";

// Cover art is fetched at build time. Each distinct key is looked up once per
// build (module-level cache), and every request uses force-cache so results are
// baked into the static page. Any failure resolves to a fallback (null) → the UI
// shows a placeholder, so nothing ever looks broken.

const cache = new Map<string, unknown>();

async function once<T>(
  key: string,
  fallback: T,
  fn: () => Promise<T>
): Promise<T> {
  if (cache.has(key)) return cache.get(key) as T;
  let value = fallback;
  try {
    value = await fn();
  } catch {
    value = fallback;
  }
  cache.set(key, value);
  return value;
}

const CACHED: RequestInit = { cache: "force-cache" };
const enc = encodeURIComponent;

// AniList GraphQL — no API key required. year (optional) narrows by season year.
export async function anilistCover(
  title: string,
  kind: ShelfKind = "anime",
  year?: number
): Promise<string | null> {
  return once(`anilist:${kind}:${title}:${year ?? ""}`, null, async () => {
    const hasYear = typeof year === "number";
    const query = `query ($search: String, $type: MediaType${
      hasYear ? ", $year: Int" : ""
    }) {
      Media(search: $search, type: $type${hasYear ? ", seasonYear: $year" : ""}) {
        coverImage { extraLarge large }
      }
    }`;
    const variables = hasYear
      ? { search: title, type: kind.toUpperCase(), year }
      : { search: title, type: kind.toUpperCase() };
    const res = await fetch("https://graphql.anilist.co", {
      ...CACHED,
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) return null;
    const img = (await res.json())?.data?.Media?.coverImage;
    return img?.extraLarge ?? img?.large ?? null;
  });
}

// Open Library search → covers CDN. year (optional) helps pick the right edition.
export async function bookCover(
  title: string,
  year?: number
): Promise<string | null> {
  return once(`openlibrary:${title}:${year ?? ""}`, null, async () => {
    const yearParam = year ? `&first_publish_year=${year}` : "";
    const res = await fetch(
      `https://openlibrary.org/search.json?title=${enc(
        title
      )}${yearParam}&limit=1&fields=cover_i`,
      CACHED
    );
    if (!res.ok) return null;
    const id = (await res.json())?.docs?.[0]?.cover_i;
    return id ? `https://covers.openlibrary.org/b/id/${id}-L.jpg` : null;
  });
}

// TMDB — requires TMDB_API_KEY; without it we skip the lookup (→ placeholder).
// year (optional) is passed as primary_release_year to disambiguate remakes.
export async function movieCover(
  title: string,
  year?: number
): Promise<string | null> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  return once(`tmdb:${title}:${year ?? ""}`, null, async () => {
    const yearParam = year ? `&primary_release_year=${year}` : "";
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${enc(
        title
      )}${yearParam}`,
      CACHED
    );
    if (!res.ok) return null;
    const path = (await res.json())?.results?.[0]?.poster_path;
    return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
  });
}

// Spotify oEmbed — used for playlist tiles (cover + title).
export async function spotifyOEmbed(
  url: string
): Promise<{ title: string; thumbnail: string | null } | null> {
  if (!/^https?:\/\//.test(url)) return null;
  return once(`oembed:${url}`, null, async () => {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${enc(url)}`,
      CACHED
    );
    if (!res.ok) return null;
    const json = await res.json();
    return { title: json?.title ?? "", thumbnail: json?.thumbnail_url ?? null };
  });
}
