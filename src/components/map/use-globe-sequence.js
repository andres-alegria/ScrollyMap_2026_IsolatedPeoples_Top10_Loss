import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lerp = (a, b, t) => a + (b - a) * t;

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
export const useGlobeSequence = ({ map, loaded, chapters, atmosphere, containerRef, legendRef }) => {
  const applied = useRef(null);

  useEffect(() => {
    if (!loaded || !map) return undefined;

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

    const opacityProp = (id) => {
      const layer = map.getLayer(id);
      if (!layer) return null;
      return { circle: 'circle-opacity', symbol: 'text-opacity', fill: 'fill-opacity',
               line: 'line-opacity', raster: 'raster-opacity' }[layer.type] || null;
    };

    // A layer id that isn't in the published style fails silently otherwise:
    // getLayer returns undefined, nothing is set, and the layer simply never
    // appears. Warn once per id so a typo — or a style that hasn't been
    // published yet — is visible rather than mysterious.
    const warned = new Set();
    const setLayers = (spec) => {
      if (!spec) return;
      Object.entries(spec).forEach(([id, v]) => {
        const prop = opacityProp(id);
        if (prop) {
          map.setPaintProperty(id, prop, v);
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
      const zoom = lerp(from.zoom ?? 2, to.zoom ?? 2, t);
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

    // Land on the first keyframe before any scrolling happens.
    apply(keys[0].globe, keys[0].globe, 1);
    ScrollTrigger.refresh();

    return () => {
      triggers.forEach((t) => t.kill());
      if (applyFog) map.off('style.load', applyFog);
    };
  }, [map, loaded, chapters, atmosphere, legendRef]);
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
export const useGlobeVisibility = ({ containerRef, chapters, reveal, fadeOut }) => {
  useEffect(() => {
    const el = containerRef && containerRef.current;
    const keys = (chapters || []).filter((c) => c && c.globe && c.id);
    if (!el || keys.length === 0) return undefined;

    const paint = (o) => {
      el.style.opacity = String(o);
      // stop compositing the canvas entirely once it is invisible
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    };

    // Two independent triggers have an opinion about visibility — the reveal
    // on the way in, the fade on the way out — and both fire on every scroll.
    // Writing straight to the element let whichever ran last win, which at the
    // top of the page meant the fade's "nothing to fade yet, so show it"
    // overwrote the reveal's "not yet". Each keeps its own value and the
    // lower one is painted, so neither can show what the other is hiding.
    const vis = { reveal: reveal && reveal.trigger ? 0 : 1, fade: 1 };
    const commit = () => paint(Math.min(vis.reveal, vis.fade));
    const setVis = (o) => { vis.reveal = o; commit(); };

    const triggers = [];

    const revealEl = reveal && reveal.trigger && document.getElementById(reveal.trigger);

    commit();

    if (revealEl) {
      triggers.push(ScrollTrigger.create({
        trigger: revealEl,
        start: reveal.start || 'top bottom',   // adjust: when the globe starts arriving
        end: reveal.end || 'top center',       // adjust: when it is fully there
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => setVis(self.progress),
      }));
    }

    // Defaults to the last keyframe, but a keyframe added purely for a camera
    // move — one that fires after the globe should already be leaving — would
    // otherwise drag the fade along with it. Naming the chapter keeps the two
    // independent.
    const fade = fadeOut || {};
    const lastEl = document.getElementById(fade.trigger || keys[keys.length - 1].id);
    if (lastEl) {
      triggers.push(ScrollTrigger.create({
        trigger: lastEl,
        start: fade.start || 'bottom center',   // adjust: when the fade begins
        end: fade.end || 'bottom top',          // adjust: when it is fully gone
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => { vis.fade = 1 - self.progress; commit(); },
      }));
    }

    return () => {
      triggers.forEach((t) => t.kill());
      el.style.opacity = '1';
      el.style.visibility = 'visible';
    };
  }, [containerRef, chapters, reveal, fadeOut]);
};
