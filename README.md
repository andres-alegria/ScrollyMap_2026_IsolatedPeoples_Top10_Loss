# ScrollyMap Template

A **clean, minimal scrollytelling map template** built with **React**, **Mapbox GL JS**, **react-map-gl**, and **GSAP**, bundled with **Vite**.

## Core Concepts

### Chapters (config.js)
The story is driven by `src/config.js`.
Each chapter defines:

- Map position (center, zoom, pitch, bearing)
- How the map should animate to that position
- Optional callbacks triggered on chapter enter / exit
- Optional media (images, captions)

Example:

```js
{
  id: "chapter-01",
  alignment: "right",
  title: "Tracking a vessel",
  description: "An animated track.",

  location: {
    center: [-158.067, -18.252],
    zoom: 4.2,
    pitch: 0,
    bearing: 0,
  },
  mapAnimation: "flyTo", // 'flyTo' | 'easeTo' | 'jumpTo'

  onChapterEnter: [
    {
      callback: "trackAnimation.start",
      options: {
        trackFile: "/data/tracks/example.geojson",
        speed: 5,
        flyToStart: true
      }
    }
  ]
}
```

### Map Animations

Each chapter can control **how** the map moves using `mapAnimation`:

- `flyTo` – cinematic, animated movement (default)
- `easeTo` – smoother, less dramatic motion
- `jumpTo` – immediate jump (no animation)

These are implemented in `src/components/map/map-hooks.js`. Comments in that file explain exactly where to tweak behavior.

## Stages (Non-Map Sections)

In addition to map chapters, the template supports **Stages**: full-width sections that are not tied to map movement. Set `type: "stage"` and `stage: "<StageName>"` on a chapter to render one.

Stages are registered in `src/components/stages/stage-registry.js`. Currently included:

- `GalleryHorizontalScroll` — GSAP ScrollTrigger horizontal image strip. Takes an `items` prop (`[{ src, alt }]`).
- `GalleryFilter` — GSAP Flip-based filterable gallery. Takes `filters` (`[{ id, label }]`) and `items` (`[{ id, category }]`).
- `GalleryFlipImage` — horizontal gallery of flip-on-hover cards. Takes an `items` prop (`[{ title, image, body, href }]`).
- `PlainText` — simple text block, no map interaction. Takes `html` (or `content`).
- `PlainImage` — full-width (or constrained) image, with an optional `caption`.

Each stage is self-contained (JS + CSS) and can use GSAP or any other animation logic internally. Stages are ideal for image sequences, data explanations, or visual breaks between map sections.

Stage chapters get a shorter, tighter layout than map chapters automatically (`.step-stage` in `chapter.scss`) — pass `tight: true` on a stage chapter for an even more compact one.

## Track Animation (Optional)

The template includes an **optional animated track engine**, implemented inline in `src/components/map/map-component.jsx` (not a separate file). It:

- Loads a GeoJSON LineString
- Draws the line progressively
- Moves a marker along the track — either a plain circle (default) or a rotating SVG icon
- Optionally moves the camera

The public API is exposed as:

```js
trackAnimation.start(options)
trackAnimation.pause()
trackAnimation.resume()
trackAnimation.reset()
```

`start(options)` accepts:

| Option | Type | Description |
|---|---|---|
| `trackFile` (or `vesselFile`) | string | Path to a GeoJSON file with LineString feature(s). Required. |
| `speed` | number | How many points to advance per animation frame. |
| `camera` | `"chapter"` \| `"static"` \| `"start"` \| `"fit"` | Who controls the camera while the track plays. `"chapter"` (default) leaves it to the chapter's own `location`. |
| `cameraPadding` | number | Padding (px) used by `camera: "fit"`. |
| `flyToStart` | boolean | Override for the `"start"` camera behavior. |
| `restart` | boolean | Force reloading and restarting from the beginning. |
| `line` | `{ color, width, opacity }` | Styles the drawn track line. |
| `marker` | `{ type: "svg", svg, size, color, borderColor, borderWidth, rotate }` | If provided, the track head renders as a rotating SVG marker instead of the default circle. `svg` is a path to an `.svg` file; `rotate` is a static degree offset added to the computed heading of travel. |

If you don't need track animation for a given chapter, just don't call `trackAnimation.start` from it — the engine is inert until invoked.

## External Layers (Optional)

External vector or raster layers (e.g. Resource Watch datasets) can be defined in `src/components/map/map-external-layers.js`. This is intentionally kept simple and empty by default — only enable it when you actually need external data sources.

## Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.template .env
   ```

2. Add your Mapbox access token:
   ```
   VITE_MAPBOX_ACCESS_TOKEN=your_token_here
   ```

3. Install dependencies:
   ```bash
   yarn install
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

5. Build for production:
   ```bash
   yarn build
   yarn preview   # serve the production build locally
   ```

## Stack notes

- **React 18** — deliberately not React 19 yet: `react-waypoint` (used for chapter enter/leave detection) relies on `findDOMNode`, which React 19 removes. A future cleanup could replace `react-waypoint` with a small custom `IntersectionObserver` hook to unblock a React 19 upgrade.
- **Tailwind v4** — configured CSS-first via `@theme` in `src/index.css` rather than `tailwind.config.js`.
- Every component file is `.jsx` — if you add a new component, use the `.jsx` extension so Vite's default JSX handling picks it up.
