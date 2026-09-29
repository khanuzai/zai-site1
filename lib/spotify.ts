// Server-only. Fetches a user's public playlists via the Spotify Web API using
// the client-credentials flow. Reads SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET,
// which are never exposed to the client (no NEXT_PUBLIC_ prefix). Returns null
// when the keys are missing or the API fails, so callers can fall back.

import "server-only";

export type SpotifyPlaylist = {
  name: string;
  url: string;
  cover: string | null;
};

// Pull the user id out of an open.spotify.com/user/<id> profile URL.
export function spotifyUserId(profileUrl: string): string | null {
  const m = profileUrl.match(/open\.spotify\.com\/user\/([^/?#]+)/);
  return m ? m[1] : null;
}

async function getAppToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  // no-store: never cache the token response, so a failed auth is never reused.
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn(`[spotify] token request failed: ${res.status} ${body}`);
    return null;
  }
  return (await res.json())?.access_token ?? null;
}

export async function getUserPlaylists(
  profileUrl: string
): Promise<SpotifyPlaylist[] | null> {
  const userId = spotifyUserId(profileUrl);
  if (!userId) return null;

  const token = await getAppToken();
  if (!token) return null;

  const out: SpotifyPlaylist[] = [];
  let url: string | null = `https://api.spotify.com/v1/users/${userId}/playlists?limit=50`;

  try {
    // paginate through every page (guard against runaway loops)
    for (let page = 0; url && page < 40; page++) {
      // no-store: failures (e.g. a 403 from app restrictions) are never cached.
      const res: Response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        // surface the real reason instead of hiding it, then fall back
        console.warn(`[spotify] playlists request failed: ${res.status} ${body}`);
        return out.length ? out : null;
      }
      const json = await res.json();
      for (const p of json?.items ?? []) {
        if (!p?.external_urls?.spotify) continue;
        out.push({
          name: p.name ?? "",
          url: p.external_urls.spotify,
          cover: p.images?.[0]?.url ?? null,
        });
      }
      url = json?.next ?? null;
    }
  } catch (err) {
    console.warn(`[spotify] playlists request errored: ${String(err)}`);
    return out.length ? out : null;
  }

  return out;
}
