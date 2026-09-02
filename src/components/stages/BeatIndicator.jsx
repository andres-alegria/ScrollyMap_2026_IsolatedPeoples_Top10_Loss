import React, {
  forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import './BeatIndicator.css';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;

// Blend two #rrggbb values, so the swatch changes meaning as the bar arrives
// rather than snapping between two unrelated colours.
const hexToRgb = (h) => {
  const n = parseInt(String(h || '').replace('#', ''), 16);
  return Number.isNaN(n) ? [0, 0, 0] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mixHex = (a, b, t) => {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const c = (x, y) => Math.round(lerp(x, y, clamp01(t)));
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`;
};

/**
 * Legend and beat indicator in one: a heading naming what the colour means,
 * the three time spans below it, and a bar that slides to sit under whichever
 * span is currently on screen.
 *
 * It owns no scroll logic. AreaReveal already runs the pinned ScrollTrigger for
 * the section and pushes progress in through setProgress() — a second trigger
 * on the same element would bring back the reflow that the pinSpacing:false
 * rebuild removed.
 *
 * Progress arrives in label units: 0 = first label, 1 = second, 2 = third, and
 * fractions in between, so the bar travels in step with the image crossfade
 * instead of snapping between beats.
 */
const BeatIndicator = forwardRef(({ beats = [], note }, ref) => {
  const { t } = useTranslation();
  const headingRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const itemRefs = useRef([]);
  const slots = useRef([]);
  const lastP = useRef(0);
  const lastIdx = useRef(-1);

  // Position the bar for a given progress. Called on every scroll frame, so it
  // writes straight to style rather than going through React.
  const apply = useCallback((p) => {
    lastP.current = p;
    const s = slots.current;
    const bar = barRef.current;
    if (!bar || s.length < 2) return;
    const max = s.length - 1;
    const q = Math.min(Math.max(p, 0), max);
    const i = Math.min(Math.floor(q), max - 1);
    const f = q - i;
    const a = s[i];
    const b = s[i + 1];
    // scaleX on a 1px-wide bar, so this is transform-only — no layout per frame
    bar.style.transform =
      `translateX(${lerp(a.x, b.x, f)}px) scaleX(${lerp(a.w, b.w, f)})`;
    // The swatch is the legend, so it has to say what THIS beat means: the
    // extent beats are bare earth, only the loss beat is pink. Colour blends
    // as the bar travels; the heading swaps at the nearer beat.
    const ca = beats[i] || {};
    const cb = beats[Math.min(i + 1, max)] || {};
    bar.style.background = mixHex(ca.color, cb.color, f);
    const nearest = Math.round(q);
    if (nearest !== lastIdx.current) {
      lastIdx.current = nearest;
      const h = headingRef.current;
      const txt = (beats[nearest] || {}).heading;
      if (h && txt) h.textContent = txt;
    }
    // the label the bar is under reads at full strength, its neighbours fade
    itemRefs.current.forEach((el, k) => {
      if (el) el.style.opacity = String(0.4 + 0.6 * clamp01(1 - Math.abs(q - k)));
    });
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const t0 = track.getBoundingClientRect();
    slots.current = itemRefs.current.filter(Boolean).map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - t0.left, w: r.width };
    });
    apply(lastP.current);
  }, [apply]);

  useImperativeHandle(ref, () => ({ setProgress: apply }), [apply]);

  useLayoutEffect(() => {
    measure();
    // Label widths move with the viewport, and again when the web font lands —
    // observing the items themselves catches both.
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    itemRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [measure, beats.length]);

  return (
    <div className="beatind">
      <div className="beatind__heading" ref={headingRef}>
        {t((beats[0] || {}).heading || '')}
      </div>
      <div className="beatind__track" ref={trackRef}>
        {beats.map((b, i) => (
          <span
            key={b.label}
            className="beatind__item"
            ref={(el) => { itemRefs.current[i] = el; }}
          >
            {t(b.label)}
          </span>
        ))}
        <span
          className="beatind__bar"
          ref={barRef}
          style={{ background: (beats[0] || {}).color }}
        />
      </div>
      {note && <p className="beatind__note">{t(note)}</p>}
    </div>
  );
});

export default BeatIndicator;
