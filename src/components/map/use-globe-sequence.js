import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lerp = (a, b, t) => a + (b - a) * t;

// Width the configured zooms are written for — the narrowest the two-column
// globe frame gets, at the breakpoint where the layout splits.
const FIT_BASE_W = 440;                  // adjust: frame width the zooms assume

// How far to turn, in degrees of longitude.
//   'short' (default) takes the shorter arc
//   'west'  forces a negative delta (spin westward, across the Pacific)
//   'east'  forces a positive delta
const spinDelta = (from, to, spin = 'short') => {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  if (spin === 'west' && d > 0) d -= 360;
  if (spin === 'east' && d < 0) d += 360;
  return d;
};

/**
 * Scroll-scrubbed globe.
 *
 * Every chapter carrying a `globe` block is a keyframe. As the reader scrolls
 * from one keyframe chapter to the next, the camera interpolates between them
 * continuously — the globe tracks the scroll rather than easing toward a
 * target after arrival, so stopping mid-way leaves it mid-rotation.
 *
 * In config.js:
 *   globe: {
 *     center: [lon, lat],
 *     zoom: 2,
 *     pitch: 0,              // optional: camera tilt
 *     bearing: 0,            // optional: camera rotation
 *     layers: { centroids: 1, 'centroids-label': 0 },  // optional opacities
 *     legend: 'What the dots are',                     // optional caption
 *     start: 'top bottom',   // optional: when this move begins
 *     end: 'top center',     // optional: when it has arrived
 *   }
 */
export const useGlobeSequence = ({ map, loaded, chapters, atmosphere, containerRef, legendRef, finale }) => {
  const applied = useRef(null);

  useEffect(() => {
    if (!loaded || !map) return undefined;

    // The sphere's size on screen follows 2^zoom and takes no account of the
    // element it is drawn in, so one fixed zoom leaves a wide frame mostly
    // empty and overflows a narrow one. Adding log2(width / FIT_BASE_W) keeps
    // it the same fraction of the frame at every width — the configured zooms
    // then describe a proportion rather than a pixel size.
    const fit = { z: 0 };
    // The camera the sequence last set. A frame that changes size needs it
    // again — see measureFit.
    const last = { from: null, to: null, t: 1 };
    let lastW = 0;
    const measureFit = () => {
      const node = containerRef && containerRef.current;
      if (!node) return;
      const w = node.getBoundingClientRect().width;
      if (!w || Math.abs(w - lastW) < 0.5) return;
      lastW = w;
      fit.z = Math.log2(w / FIT_BASE_W);
      // Tell the map its frame changed. mapbox-gl measures its container when
      // it is created and after that only watches the WINDOW, so a frame that
      // resizes on its own — which is exactly what the finale class does —
      // keeps a canvas of the old size. The sphere is drawn into that canvas
      // and whatever falls outside it is simply not drawn: the globe loses
      // its left and right limb on the closing screen.
      if (map && typeof map.resize === 'function') map.resize();
      // Then set the camera again. The zoom carries fit.z, but it is only
      // written from the scrubbed triggers, and they fire on scroll — so a
      // frame that resized while the reader was still would hold the zoom the
      // old frame asked for, which is a globe sized for a box it is no longer
      // in. ScrollTrigger.update() is no help here: with the scroll position
      // unchanged it has nothing to report. Replaying the last keyframe is
      // exact and costs one jumpTo.
      if (last.to) apply(last.from, last.to, last.t);
    };
    measureFit();
    // Observing the element rather than the window: the frame also changes
    // size when the finale class is applied, which no window resize reports.
    const fitRO = new ResizeObserver(measureFit);
    if (containerRef && containerRef.current) fitRO.observe(containerRef.current);

    // Replace Mapbox's black starfield with the paper tone, so the globe sits
    // on the same ground as the rest of the page.
    //
    // Applied again on every style load, not just once. Fog is style state:
    // any reload drops it and Mapbox's default — black space, stars — comes
    // back. Safari has been seen showing exactly that, which is the signature
    // of a one-shot setFog landing before the style was really ready.
    let applyFog = null;
    if (atmosphere) {
      applyFog = () => {
        try {
          map.setFog(atmosphere);
        } catch (e) {
          console.warn('[globe] setFog failed', e);
        }
      };
      applyFog();
      map.on('style.load', applyFog);
    }

    const keys = (chapters || []).filter((c) => c && c.globe && c.id);
    if (keys.length === 0) return undefined;

    // Which paint properties carry a layer's opacity — plural, because a
    // circle has two. Setting only circle-opacity empties the dot but leaves
    // its stroke at full strength, so every hidden dot stayed on the globe as
    // a pale ring. Nothing in the piece ever wants the ring without the dot.
    const opacityProps = (id) => {
      const layer = map.getLayer(id);
      if (!layer) return null;
      return { circle: ['circle-opacity', 'circle-stroke-opacity'],
               symbol: ['text-opacity', 'icon-opacity'],
               fill: ['fill-opacity'],
               line: ['line-opacity'],
               raster: ['raster-opacity'] }[layer.type] || null;
    };

    // A layer id that isn't in the published style fails silently otherwise:
    // getLayer returns undefined, nothing is set, and the layer simply never
    // appears. Warn once per id so a typo — or a style that hasn't been
    // published yet — is visible rather than mysterious.
    const warned = new Set();
    const setLayers = (spec) => {
      if (!spec) return;
      Object.entries(spec).forEach(([id, v]) => {
        const props = opacityProps(id);
        if (props) {
          props.forEach((prop) => map.setPaintProperty(id, prop, v));
        } else if (!warned.has(id)) {
          warned.add(id);
          console.warn(`[globe] no layer "${id}" in this style — check the id, `
            + 'and that the style has been published in Mapbox Studio');
        }
      });
    };

    const apply = (from, to, t) => {
      const [flon, flat] = from.center;
      const [tlon, tlat] = to.center;
      const lon = flon + spinDelta(flon, tlon, to.spin) * t;
      const lat = lerp(flat, tlat, t);
      const zoom = lerp(from.zoom ?? 2, to.zoom ?? 2, t) + fit.z;
      const pitch = lerp(from.pitch ?? 0, to.pitch ?? 0, t);
      // bearing wraps like longitude, so take the shorter way round rather
      // than spinning the long way through 0
      const fbear = from.bearing ?? 0;
      const bearing = fbear + spinDelta(fbear, to.bearing ?? 0) * t;
      map.jumpTo({ center: [lon, lat], zoom, pitch, bearing });
      // Layer opacities snap at the midpoint rather than crossfading, so the
      // dots don't ghost while the globe is spinning.
      setLayers(t < 0.5 ? from.layers : to.layers);
      // The caption names whatever the dots currently are, so it has to change
      // on the same frame they do — anything else leaves it briefly lying.
      // Written only when the text actually differs, so the fade is a real
      // transition rather than something restarted sixty times a second.
      const el = legendRef && legendRef.current;
      if (el) {
        const next = (t < 0.5 ? from.legend : to.legend) || '';
        if (el.textContent !== next) {
          el.textContent = next;
          // `hidden`, not opacity: opacity belongs to useGlobeVisibility, and
          // writing it here on every text change overwrote the reveal and the
          // fade — the caption stayed at full strength while the globe it
          // names was gone. This only takes the bar out when a keyframe has no
          // caption at all, so an empty paper strip is never drawn.
          el.hidden = !next;
        }
      }
      applied.current = to.id;
      last.from = from;
      last.to = to;
      last.t = t;
    };

    const triggers = keys.map((c, i) => {
      const el = document.getElementById(c.id);
      if (!el) return null;
      const prev = i === 0 ? c.globe : keys[i - 1].globe;
      return ScrollTrigger.create({
        trigger: el,
        // a keyframe can widen or shift its own window; useful when a move has
        // to be under way before its chapter arrives, or has to land early
        start: c.globe.start || 'top bottom',
        end: c.globe.end || 'top center',
        scrub: true,
        onUpdate: (self) => apply(prev, c.globe, self.progress),
      });
    }).filter(Boolean);

    // The finale frame: bigger and centred, for the beat where the globe comes
    // back under the hand-off line to show the ranked ten. Toggled a little
    // before the globe is revealed, so the frame has already resized by the
    // time anything is visible.
    if (finale && finale.trigger) {
      const fEl = document.getElementById(finale.trigger);
      const node = containerRef && containerRef.current;
      if (fEl && node) {
        triggers.push(ScrollTrigger.create({
          trigger: fEl,
          start: finale.start || 'top bottom',
          end: finale.end || 'bottom top',
          onToggle: (self) => node.classList.toggle('map-container--finale', self.isActive),
        }));
      }
    }

    // Land on the first keyframe before any scrolling happens.
    apply(keys[0].globe, keys[0].globe, 1);
    ScrollTrigger.refresh();

    return () => {
      triggers.forEach((t) => t.kill());
      fitRO.disconnect();
      if (applyFog) map.off('style.load', applyFog);
    };
  }, [map, loaded, chapters, atmosphere, legendRef, finale]);
};


/**
 * Owns the map container's visibility from both ends: held back until the
 * story is ready for it, then faded out once the last keyframe is past.
 *
 * Both live in one hook because both write `style.opacity` on the same element
 * — split across two hooks they would race on mount, and whichever set its
 * initial value last would win.
 *
 * Deliberately independent of the map instance: if Mapbox is slow, errors, or
 * never fires onLoad, the canvas would otherwise stay fully visible behind the
 * whole countdown. Visibility is a DOM concern, so it must not depend on the
 * map having loaded.
 *
 * In config.js:
 *   globeReveal:  { trigger: 'chapter 02', start: 'top bottom+=66%', end: '...' }
 *   globeFadeOut: { trigger: 'chapter 03' }   // defaults to the last keyframe
 *
 * Anchor the reveal to the same chapter that drives the rotation it appears
 * during, and phrase the offsets in the same terms. Measuring from the
 * preceding chapter's card instead looks more natural in config but couples
 * the timing to that card's height, which the template shifts by a whole
 * `my-40` once it has measured it — enough to move the fade past the moment
 * it was tuned for.
 */
export const useGlobeVisibility = ({ containerRef, chapters, windows }) => {
  useEffect(() => {
    const el = containerRef && containerRef.current;
    const keys = (chapters || []).filter((c) => c && c.globe && c.id);
    if (!el || keys.length === 0 || !windows || windows.length === 0) return undefined;

    const paint = (o) => {
      el.style.opacity = String(o);
      // stop compositing the canvas entirely once it is invisible
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    };

    // The globe can leave and come back — out after the last map chapter, in
    // again under the hand-off line — so visibility is a set of windows
    // rather than one reveal and one fade. Each window keeps its own pair of
    // values and the page shows the most visible of them; within a window the
    // lower of the two wins, so neither end can show what the other is
    // hiding. Writing straight to the element instead let whichever trigger
    // ran last win, which at the top of the page meant the fade's "nothing to
    // fade yet, so show it" overwrote the reveal's "not yet".
    const state = windows.map((w) => ({ in: w.reveal && w.reveal.trigger ? 0 : 1, out: 1 }));
    const commit = () => paint(Math.max(...state.map((v) => Math.min(v.in, v.out))));

    const triggers = [];
    windows.forEach((w, i) => {
      const revealEl = w.reveal && w.reveal.trigger && document.getElementById(w.reveal.trigger);
      if (revealEl) {
        triggers.push(ScrollTrigger.create({
          trigger: revealEl,
          start: w.reveal.start || 'top bottom',   // adjust: when the globe starts arriving
          end: w.reveal.end || 'top center',       // adjust: when it is fully there
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => { state[i].in = self.progress; commit(); },
        }));
      }
      const fade = w.fadeOut || {};
      const lastEl = document.getElementById(fade.trigger || keys[keys.length - 1].id);
      if (lastEl) {
        triggers.push(ScrollTrigger.create({
          trigger: lastEl,
          start: fade.start || 'bottom center',   // adjust: when the fade begins
          end: fade.end || 'bottom top',          // adjust: when it is fully gone
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => { state[i].out = 1 - self.progress; commit(); },
        }));
      }
    });

    commit();

    return () => {
      triggers.forEach((t) => t.kill());
      el.style.opacity = '1';
      el.style.visibility = 'visible';
    };
  }, [containerRef, chapters, windows]);
};
