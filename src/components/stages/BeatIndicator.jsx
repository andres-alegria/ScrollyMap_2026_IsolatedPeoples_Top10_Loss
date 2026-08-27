import React, {
  forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import './BeatIndicator.css';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;

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
const BeatIndicator = forwardRef(({ heading, labels = [], color = '#E86D6D' }, ref) => {
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const itemRefs = useRef([]);
  const slots = useRef([]);
  const lastP = useRef(0);

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
    bar.style.transform = `translateX(${lerp(a.x, b.x, f)}px)`;
    bar.style.width = `${lerp(a.w, b.w, f)}px`;
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
  }, [measure, labels.length]);

  return (
    <div className="beatind">
      <div className="beatind__heading">{t(heading || '')}</div>
      <div className="beatind__track" ref={trackRef}>
        {labels.map((label, i) => (
          <span
            key={label}
            className="beatind__item"
            ref={(el) => { itemRefs.current[i] = el; }}
          >
            {t(label)}
          </span>
        ))}
        <span className="beatind__bar" ref={barRef} style={{ background: color }} />
      </div>
    </div>
  );
});

export default BeatIndicator;
