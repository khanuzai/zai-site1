# CLAUDE.md — abdullah khan's site

Personal site for Abdullah Khan (CS at UWaterloo, BBA at Laurier). Simple shell, deep content. The look is a manga page: warm paper, black ink, hand-drawn crosshatching inside panels.

The approved homepage design is in `reference/home.html`. Open it in a browser before building anything. Match it exactly on desktop.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS. pnpm. Deployed on Vercel. Fonts via `next/font/google`. MDX via `next-mdx-remote/rsc` + `gray-matter`. No animation libraries: the homepage canvas is plain Canvas 2D, and hover effects are CSS.

## Design system

Colors (define once as CSS variables and Tailwind theme colors, never hardcode elsewhere):

| token     | hex       | use                                  |
|-----------|-----------|--------------------------------------|
| paper     | `#ebe5d8` | page background                      |
| ink       | `#16130f` | text, panel borders, crosshatching   |
| ink-soft  | `#3d3831` | body text, Urdu signature            |
| muted     | `#5c554b` | secondary links (socials), meta text |

Fonts:

- Cormorant Garamond 600: the name and page titles only.
- Hanken Grotesk 400/500: everything else (nav, body, links).
- Noto Nastaliq Urdu 400: all Urdu, always `lang="ur" dir="rtl"`, line-height 2 or more so it never clips.

Links: no underline by default; on hover and keyboard focus, a 1.5px ink line draws in from the left (animated `background-size`, 350ms). Same effect everywhere.

Do not add: cursors, loading screens, page transitions, grain overlays, scroll-reveal animations, gradients, shadows, rounded cards, or new colors.

## Homepage (`/`)

Copy the layout and behavior from `reference/home.html`:

- Left column: primary nav at top (work, projects, writing, quotes, contact), name "abdullah / khan" stacked, Urdu signature عبداللہ خان, two lines of text, socials at the bottom (github, linkedin, x, email).
- Right side: one canvas with two manga panels split by a slanted gutter, hand-inked borders, crosshatching that keeps drawing itself and slowly fades, a clean moon left unhatched in the top panel, soft ink washes, and 9 pixel bats that flock and scatter from the cursor.
- Put the canvas in its own client component (`components/InkPanels.tsx`). Clean up the interval on unmount. If `prefers-reduced-motion` is set, draw one frame and stop.

Responsive:

- 1440 and up: exactly like the reference.
- 1024 to 1439: same layout, scale the canvas to fit the right half, name scales down with `clamp()`.
- Below 1024: single column. Nav, name, Urdu, text, socials stacked. The panels become one banner under the text, full width, about 45vh tall, still animated. No bats below 640px.

## Inner pages

Same paper, ink, and fonts. Single column, max-width 720px, left-aligned, with the same nav at the top. Page title in Cormorant Garamond at about 64px. Under the title, one hand-inked horizontal rule (a thin wobbly SVG line, generated once). No canvas animation on inner pages.

## Pages and content

All content lives in `content/`. Pages only render data; adding something never means editing a component.

| route               | source                                 |
|---------------------|----------------------------------------|
| `/work`             | `content/work.ts` (timeline, newest first) |
| `/projects`         | `content/projects/*.mdx`               |
| `/projects/[slug]`  | one MDX file each: what it is, why, how it works, what broke, what was learned, links |
| `/writing`          | `content/writing/*.mdx`, frontmatter: title, date, tags, draft. RSS at `/writing/rss.xml` |
| `/quotes`           | `content/quotes.ts`, English and Urdu side by side |
| `/contact`          | email, socials, a simple form (Resend) later |

Later pages, same rules: `/shelf` (anime, music, films, books with one-line takes), `/lifts` (PRs and log), `/garage`, `/problems` (KaTeX), `/now`, `/friends`, `/gallery`.

Real data:

- Work: LeapAP Inc., Software Engineering Intern, May–Aug 2026, Aurora ON. PixelsBoost, Software Engineering Intern, Sep–Dec 2025, Milton ON. Fast Webs, Software Engineering Intern, May–Aug 2024, remote.
- Projects: Solar System (Three.js space simulation, spacewebsite-seven.vercel.app), BookPulse (real-time book price intelligence, AWS), ASGS (attack surface risk modeling).
- Use placeholder text for anything else and mark it with `TODO:` so it's easy to find.

## How to work

- Build one phase at a time and stop for review after each.
- Run `pnpm build` before saying a phase is done; fix every error and warning.
- Keep components small. Keep all colors and fonts in the theme.
- Never commit secrets. `.env.local` stays in `.gitignore`.
