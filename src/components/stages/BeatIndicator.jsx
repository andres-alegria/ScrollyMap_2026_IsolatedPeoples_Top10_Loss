import React, {
  forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import './BeatIndicator.css';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;

// Blend two #rrggbb values, so the box changes meaning as it arrives rather
// than snapping between two unrelated colours.
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
 * Legend and beat indicator in one: each beat names the quantity its panel is
 * showing, and a filled box travels between them, taking the colour that
 * panel paints with. The box is the swatch — there is no separate key to pair
 * up — so the reader is told what the image means in the image's own colour.
 *
 * It owns no scroll logic. AreaReveal already runs the pinned ScrollTrigger for
 * the section and pushes progress in through setProgress() — a second trigger
 * on the same element would bring back the reflow that the pinSpacing:false
 * rebuild removed.
 *
 * Progress arrives in label units: 0 = first label, 1 = second, and fractions
 * in between, so the box travels in step with the image crossfade instead of
 * snapping between beats.
 */
const BeatIndicator = forwardRef(({ beats = [], note, idleColor = '#6b7672' }, ref) => {
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const boxRef = useRef(null);
  const itemRefs = useRef([]);
  const slots = useRef([]);
  const lastP = useRef(0);

  // Position the box for a given progress. Called on every scroll frame, so it
  // writes straight to style rather than going through React.
  const apply = useCallback((p) => {
    lastP.current = p;
    const s = slots.current;
    const box = boxRef.current;
    if (!box || s.length < 2) return;
    const max = s.length - 1;
    const q = Math.min(Math.max(p, 0), max);
    const i = Math.min(Math.floor(q), max - 1);
    const f = q - i;
    const a = s[i];
    const b = s[i + 1];
    // A 1x1px box scaled to the item's rect, so this is transform-only — no
    // layout per frame. Both axes, because the two items sit side by side on
    // a wide column and stacked on a narrow one; the same code slides the box
    // across in one case and down in the other. The text sits in its own
    // element above, so it is never stretched.
    box.style.transform =
      `translate(${lerp(a.x, b.x, f)}px, ${lerp(a.y, b.y, f)}px) `
      + `scale(${lerp(a.w, b.w, f)}, ${lerp(a.h, b.h, f)})`;
    box.style.background = mixHex((beats[i] || {}).color, (beats[i + 1] || {}).color, f);
    // Each label's ink is mixed towards its own on-box colour by how far the
    // box has arrived: white as it lands on the green box, near-black on the
    // pink one. Opacity would not do — the point is contrast against a fill.
    itemRefs.current.forEach((el, k) => {
      if (!el) return;
      const here = clamp01(1 - Math.abs(q - k));
      el.style.color = mixHex(idleColor, (beats[k] || {}).textColor, here);
    });
  }, [beats, idleColor]);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const t0 = track.getBoundingClientRect();
    slots.current = itemRefs.current.filter(Boolean).map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - t0.left, y: r.top - t0.top, w: r.width, h: r.height };
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
      <div className="beatind__track" ref={trackRef}>
        <span
          className="beatind__box"
          ref={boxRef}
          style={{ background: (beats[0] || {}).color }}
        />
        {beats.map((b, i) => (
          <span
            key={b.label}
            className="beatind__item"
            ref={(el) => { itemRefs.current[i] = el; }}
          >
            {t(b.label)}
          </span>
        ))}
      </div>
      {note && <p className="beatind__note">{t(note)}</p>}
    </div>
  );
});

export default BeatIndicator;
