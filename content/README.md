# editing content

Plain-language guide to changing what shows on the site. You mostly edit
`content/*.ts` files — no components. Covers on `/shelf` are fetched
automatically when the site builds, so you usually just type a title.

## the shelf (`content/shelf.ts`)

The file has two parts: a `settings` block at the top, then the content arrays
(`anime`, `books`, `movies`, `playlists`).

### add a movie

Add a line to the `movies` array. Always include the `year` so the poster
lookup (TMDB) picks the right film:

```ts
{ title: "blade runner 2049", year: 2017 },
```

Optional extras: `note: "..."` (small muted line under the title) and
`cover: "https://..."` (a manual image if you don't like the auto one).

> Movie posters need a TMDB key. Set `TMDB_API_KEY` in the environment
> (e.g. in `.env.local`). Without it, movies show a placeholder card.

### add a book

Add a line to the `books` array. `year` is optional:

```ts
{ title: "the pragmatic programmer", year: 1999, note: "on the desk" },
```

Covers come from Open Library.

### add an anime or manga

Add a line to the `anime` array. It's anime by default; set `type: "manga"`
for manga:

```ts
{ title: "chainsaw man", year: 2022 },   // anime
{ title: "berserk", type: "manga" },      // manga
```

Covers come from AniList. Add `year` if a title is ambiguous.

### playlists (currently a manual list — here's why)

Playlists show first (right under the rule) as square tiles — cover, name, and a
link to each playlist — with the "listening on spotify →" link at the end of the
section.

**The active source is the manual `playlists` array in `content/shelf.ts`.** Add
or remove a playlist by pasting/deleting its full URL there:

```ts
export const playlists: string[] = [
  "https://open.spotify.com/playlist/0VFAfG6HqMsS2LPFuXw1As",
  // ...
];
```

Covers and titles for those URLs come from Spotify's public **oEmbed** endpoint
(no keys needed).

**Why manual and not automatic?** The automatic path was meant to pull your
public playlists from the Spotify Web API using client-credentials keys. Spotify
now **refuses that call with `403 Forbidden`** — app-only (client-credentials)
tokens are no longer allowed to read a user's playlists; that endpoint requires a
user-authorized token. So the automatic list can't work with keys alone, and the
manual array is used instead. (The keys still power movie posters via TMDB.)

The automatic code is still in place as a fallback: **if the `playlists` array is
empty**, the site tries the Spotify API (with `SPOTIFY_CLIENT_ID` /
`SPOTIFY_CLIENT_SECRET` from `.env.local`); if that fails or the keys are missing,
the section is hidden and only the "listening on spotify →" link shows. Because of
the 403, that automatic attempt currently just fails and falls through — which is
why we keep real URLs in the array.

Two settings still apply to whatever list is used (see the settings block):

- `maxPlaylists` — the most playlists to show.
- `hidePlaylists` — playlist names to leave out (case-insensitive), e.g.
  `hidePlaylists: ["private mix", "test"]`.

`spotifyUrl` sets the "listening on spotify →" link (and, for the automatic
fallback, whose profile to read). The page revalidates once a day.

> If you ever want auto-updating playlists back, the only supported route now is
> the Spotify **Authorization Code flow** (log in once, store a refresh token)
> instead of client-credentials.

### every item supports the same fields

- `title` — required. Also used to search for the cover.
- `year` — optional. Helps pick the right cover (matters most for movies).
- `note` — optional. Small muted line shown under the title.
- `cover` — optional. A manual image URL that overrides the auto lookup.
- `type` — anime section only: `"anime"` (default) or `"manga"`.
- `featured` — optional. Set `featured: true` to pull an item to the front of
  its section's preview on /shelf (see `previewCount` below).

## previews and full pages

`/shelf` only shows a preview of each section. Each section shows up to
`previewCount` items (default 5): any you marked `featured: true` come first (in
file order), then the rest in file order. If a section has more items than
`previewCount`, a small "view all →" link appears under it.

Every section also has its own full page at `/shelf/<section>` (e.g.
`/shelf/movies`, `/shelf/anime`) listing every item, with the year and note under
each cover. You don't create these — they're generated automatically from the
sections in `sectionOrder`.

## the settings block

At the top of `content/shelf.ts`:

- **`sectionOrder`** — the order sections appear, top to bottom. Remove a key
  to hide that whole section (e.g. drop `"playlists"` to hide playlists).
- **`headings`** — the text shown above each section. Keep it lowercase to
  match the site.
- **`coversPerRow`** — how many covers per row on desktop. (Tablet is always 3,
  mobile always 2.)
- **`previewCount`** — how many items each section shows on /shelf before a
  "view all →" link to its full page.
- **`grayscale`** — `true` shows covers in grayscale that fade to color on
  hover; `false` shows them in full color always.
- **`maxPlaylists`** — the most playlists to show.
- **`hidePlaylists`** — a list of playlist names to leave out (case-insensitive).

## good to know

- Anything with a title starting with `TODO` is hidden in production builds
  (it still shows while developing so you don't lose track of it).
- A section with no visible items is hidden automatically.

## other content

- `content/work.ts` — the work timeline.
- `content/projects/*.mdx` — one file per project.
- `content/writing/*.mdx` — one file per post.
- `content/socials.ts` — social links.
