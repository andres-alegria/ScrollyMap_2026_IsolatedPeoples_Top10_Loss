// Tiny pub/sub between the AreaReveal stages and the single shared map.
//
// Each area panel owns its scroll choreography but does NOT own a map: there
// is exactly one Mapbox instance for the whole story, and it is positioned to
// sit inside whichever panel is currently pinned. This bus carries that
// handoff without threading props through Story -> Chapter -> Stage.
const listeners = new Set();

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const publish = (state) => {
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.warn('[area-reveal] listener failed', e);
    }
  });
};
