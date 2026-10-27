# Embedding this scrolly in a Mongabay post

`embed-shortcode.txt` holds the shortcode. `shortcode-test.html` is a stand-in
article page for checking it, built from the live theme's CSS.

## Before this can go in a post

**The piece has no public URL yet.** Vercel is building it — the latest
production deployment is current — but every deployment URL redirects to
`vercel.com/sso-api`, and no project alias is assigned:

| URL | |
|---|---|
| `scrollymap2026isolatedpeoplestop10loss-305bhpj3k.vercel.app` | 302 → Vercel SSO |
| `scrollymap2026isolatedpeoplestop10loss.vercel.app` | 404, no alias |

Compare the published CCZ map, which serves fine at
`map-usa-vs-isa.vercel.app`. So two things are needed in the Vercel dashboard,
both of them Andrés's to do:

1. assign a production domain to the project;
2. set Deployment Protection so that domain is public.

Then put that domain in the shortcode. **Never paste a per-deployment URL
into a post** — it changes on every push and the embed dies.

## What was measured

Checked in `shortcode-test.html`, which reproduces the theme: `html {
box-sizing: border-box }`, `body { overflow-x: hidden }`, the `.container`
1280 px flex wrapper, `.ph--40` padding and the 780 px `.inner` column.

| | desktop 1024 | phone 390 |
|---|---|---|
| frame | 1024 x 768 | 390 x 844 |
| gap left / right | 0 / 0 | 0 / 0 |
| horizontal scrollbar | none | none |
| text column beside it | 780 | 349 |

The piece inside measures **37,031 px of scroll at a 768 px viewport — 49.2
screens**. Scrolling past its end chains out into the article as it should:
with the frame's content at its end, one wheel gesture took the parent page
from 0 to its own maximum. The reader cannot get stuck in it.

## The thing to know about embedding a scrolly

A browser gives the wheel to whichever scrollable thing is under the pointer.
The moment the frame's top edge passes the pointer, the frame starts consuming
the scroll and **the article behind it stops moving** — so the frame sits
wherever it happened to be, usually with its lower edge below the fold, for
the whole 49 screens.

Three ways to take that:

1. **As it stands.** Put the embed as near the top of the post as the layout
   allows, so there is little above it to push it down. What is above it is
   what hangs below the fold.
2. **Give it room.** Change `height:100dvh` to `height:88dvh`. The frame then
   fits the window from almost any starting position, and the strip of article
   above and below reads as a frame around the embed rather than as a mistake.
3. **Don't embed it.** A 49-screen scrolly is a destination, not a figure in a
   story. Mongabay's own long scrollies run as standalone pages. A teaser card
   linking out gives the reader the piece at full height with no nested
   scrolling, which on touch devices is the one case where chaining out is
   genuinely unreliable.

(1) is what the shortcode does, since that is what was asked for. (3) is what
the piece actually wants.

## Still to check in a real post

- Whether the theme has a sticky header. If it does it will cover the top of a
  100dvh frame, and the height wants reducing by its height.
- On Windows with classic scrollbars the rightmost ~17 px of a 100vw child is
  clipped by `body { overflow-x: hidden }`. Nothing of this piece's furniture
  sits that close to the right edge, but worth a look in the test post.

## Running the harness

Two local servers, both configured in the GitHub folder's `.claude/launch.json`:

- `isolated-top10-dist` — port 3004, serves `dist/` (the built piece)
- `isolated-top10-embed` — port 3005, serves `dev/`

Then open `http://localhost:3005/shortcode-test.html`. The readout bottom-right
gives window and frame size, the side gaps and whether a horizontal scrollbar
appeared; the red rules sit on the window edges for the bleed to be read
against. For anything needing to script the frame, copy the harness into
`dist/` first so the two are same-origin.
