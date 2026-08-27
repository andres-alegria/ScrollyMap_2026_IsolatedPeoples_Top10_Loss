import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Reveals a block of copy line by line as it scrolls into view, each line
 * rising out from behind a mask.
 *
 * The split has to be redone whenever the lines rewrap — a resize, or the web
 * font landing and changing the metrics — which is what `autoSplit` handles:
 * it re-splits and re-runs `onSplit`, and because the tween is returned from
 * there, GSAP disposes of the previous one for us.
 *
 * The element starts at opacity 0 in CSS so unsplit text never flashes; this
 * hook is what turns it on, including when it bails out.
 */
export default function useLineSplit(ref, enabled) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return undefined;

    const reveal = () => gsap.set(el, { opacity: 1 });

    // Motion here is decorative; without it the copy should simply be present.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal();
      return undefined;
    }

    let split;
    let cancelled = false;

    // Splitting before the font loads measures the fallback's line breaks.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      reveal();
      try {
        split = SplitText.create(el, {
          type: 'words,lines',
          mask: 'lines',
          linesClass: 'line',
          autoSplit: true,
          onSplit: (self) => gsap.from(self.lines, {
            yPercent: 120,
            stagger: 0.1,                    // adjust line-to-line offset
            scrollTrigger: {
              trigger: el,
              scrub: true,
              // clamp() keeps the start from landing above the top of the page
              start: 'clamp(top 80%)',       // adjust when the reveal begins
              end: 'clamp(bottom center)',   // adjust when it completes
            },
          }),
        });
      } catch {
        reveal();                            // copy stays readable regardless
      }
    });

    return () => { cancelled = true; if (split) split.revert(); };
  }, [ref, enabled]);
}
