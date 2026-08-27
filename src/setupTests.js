import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement matchMedia, but GSAP's ScrollTrigger calls it at
// module-registration time (see the Gallery stage components) — stub it so
// importing those modules doesn't crash in tests.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
