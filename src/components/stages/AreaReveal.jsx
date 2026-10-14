import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import ScaleBar from './ScaleBar';
import LocatorGlobe from './LocatorGlobe';
import BeatIndicator from './BeatIndicator';
import './AreaReveal.css';

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ramp = (p, from, to) => (to <= from ? (p >= to ? 1 : 0) : clamp01((p - from) / (to - from)));

// ScrollTrigger measures each section once at mount; web fonts arriving later
// reflow the cards and leave those measurements stale.
let refreshQueued = false;
const refreshWhenSettled = () => {
  if (refreshQueued) return;
  refreshQueued = true;
  const go = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => requestAnimationFrame(go));
  else window.addEventListener('load', go, { once: true });
};

/**
 * One ranked area as a full-viewport section, held in place by CSS sticky.
 *
 * The section used to be pinned by ScrollTrigger, which can only reposition it
 * from JavaScript: the browser scrolls and paints on the compositor thread
 * whether or not the main thread has caught up, so at every hand-over the
 * section travelled a frame too far before being put back. That is the hiccup,
 * and no amount of retiming removes it — the position has to stop being
 * JavaScript's job.
 *
 * position:sticky is resolved by the browser itself, in the same frame as the
 * scroll, so the section cannot lag. ScrollTrigger is left to do only what it
 * is good at here: reading progress and driving the crossfade and the recede,
 * neither of which is a position, so neither shows a frame of lag.
 *
 * The geometry that replaces the pin, per area, in screen-heights:
 *
 *   wrapper height   dwell + 2   (4.6)   how far the sticky element may travel
 *   wrapper margin   -1          (-1.0)  lets the next area overlap this one
 *   net advance      dwell + 1   (3.6)   scroll from one area's top to the next
 *   sticky duration  dwell + 1   (3.6)   wrapper height - one screen
 *
 * The last two being equal is the whole trick: the section stays stuck for
 * exactly as long as it takes the next one to climb over it, which is what the
 * pin used to do by occupying no space at all.
 */
const AreaReveal = ({
  areaId,
  panels = {},
  scale = {},
  locator,
  adm1,
  country,
  chapter = {},
  panelLabels = {},
  timings = {},
  dwell = 2.6,          // adjust: extra screen-heights each section holds
}) => {
  const { t } = useTranslation();
  const { rank, title, description } = chapter;
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const extentRef = useRef(null);
  const indRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !panels.loss) return undefined;

    // The next section climbs over this one on its own, and it starts doing so
    // at progress dwell / (dwell + 1) — nothing in the timeline below
    // controls that. So the last beat has to be established
    // well before that point, or the next panel covers the loss layer while
    // the reader is still taking it in. At dwell 2.6 the hand-over begins at
    // about 0.72, which is what recedeFrom is matched to. The crossfade is
    // finished by 0.46, leaving the loss layer a quarter of the section to be
    // read before anything starts moving.
    const {
      holdLoss = 0.14,            // adjust: how long the loss layer holds alone
      toExtent = 0.46,            // adjust: when the extent layer is fully in
      recedeFrom = 0.72,          // adjust: when the section starts giving way
      recedeTo = 1,               // adjust: when it has finished giving way
      fade = 0.45,                // adjust: how far it fades while giving way
    } = timings;

    // The runway, and the overlap that lets the next area climb over this one.
    // Written here rather than in the stylesheet because both values derive
    // from `dwell`, which is a prop. Left in vh so the browser re-resolves
    // them on resize without a refresh.
    const wrap = section.parentElement;             // the sticky containing block
    if (wrap) {
      wrap.style.height = `${(dwell + 2) * 100}vh`;
      wrap.style.marginBottom = '-100vh';
    }
    section.style.marginBottom = '';

    // Anchor the recede's scale on the panel's own top edge.
    //
    // The scale below shrinks the whole section, so wherever its origin sits
    // decides which way the panel appears to travel. With the origin in the
    // middle of the card the panel slid about 15px DOWN as the section
    // receded, while the arriving section was sliding UP behind it and its own
    // panel came to rest at the height the old one had just left. Read as one
    // image rather than two, that is a reversal: the map sinks a few pixels,
    // then climbs back. It showed at every hand-over and at any scroll speed,
    // because it is geometry, not timing.
    //
    // Anchored on the panel's top edge the panel does not move at all: the
    // card shrinks and fades around a still image. Measured from layout
    // offsets, which transforms do not affect, and re-measured on refresh
    // because the title wraps to a second line at some widths.
    const anchorOrigin = () => {
      const frame = frameRef.current;
      if (!frame) return;
      let y = 0;
      for (let n = frame; n && n !== section; n = n.offsetParent) y += n.offsetTop;
      section.style.transformOrigin = `50% ${y}px`;
    };
    anchorOrigin();

    const preload = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom+=120%',
      once: true,
      onEnter: () => {
        [panels.loss, panels.extent].forEach((src) => {
          if (src) { const im = new Image(); im.src = src; }
        });
      },
    });

    let promoted = false;
    const st = ScrollTrigger.create({
      // The wrapper, not the section: the section is sticky, so from the
      // moment it sticks its own top stops moving and would report no further
      // progress. The wrapper keeps scrolling the whole way.
      trigger: wrap || section,
      start: 'top top',
      end: () => `+=${window.innerHeight * (dwell + 1)}`,
      // No pin. See the note at the top of this file.
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh: anchorOrigin,
      onUpdate: (self) => {
        const p = self.progress;
        // One crossfade: the loss layer underneath, the 2025 extent growing
        // over it. Loss first on purpose — the reader sees what was taken
        // before seeing what is left, rather than the other way round.
        const toExtentNow = ramp(p, holdLoss, toExtent);
        if (extentRef.current) extentRef.current.style.opacity = toExtentNow;
        // label units: 0 at the first box, 1 at the second
        if (indRef.current) indRef.current.setProgress(toExtentNow);
        // recede as the next section climbs over this one
        const r = ramp(p, recedeFrom, recedeTo);
        // Promote only while this is actually moving. Left on permanently it
        // costs a full-viewport layer per section, ten of them at once.
        const wantsLayer = r > 0;
        if (wantsLayer !== promoted) {
          promoted = wantsLayer;
          section.style.willChange = wantsLayer ? 'transform, opacity' : '';
        }
        section.style.transform = `scale(${1 - 0.08 * r})`;
        section.style.opacity = String(1 - fade * r);
      },
    });

    refreshWhenSettled();
    return () => { st.kill(); preload.kill(); };
  }, [areaId, panels, timings, dwell]);

  // First-level division and country. A sibling of the name rather than a
  // child of it: the title is a column flex, so a sibling becomes its own row
  // — which is exactly the third line this wants to be.
  const place = [adm1, country].filter(Boolean).join(', ');

  return (
    <section className="area-section" ref={sectionRef}>
      <h3 className="area-section__title font-lora">
        {rank && <span className="area-section__rank">{rank}</span>}
        <span className="area-section__name">{t(title || '')}</span>
        {place && <span className="area-section__place">({t(place)})</span>}
      </h3>

      <div className="area-section__body">
        <div className="area-section__panel">
          <div className="area-reveal__frame" ref={frameRef}>
            <img className="area-reveal__img" src={panels.loss} alt="" loading="eager" />
            <img className="area-reveal__img" ref={extentRef} src={panels.extent} alt="" style={{ opacity: 0 }} />
            <ScaleBar {...scale} />
            <LocatorGlobe center={locator} />
          </div>
        </div>

        <div className="area-section__card">
          <BeatIndicator
            ref={indRef}
            beats={panelLabels.beats || []}
            note={panelLabels.note}
            idleColor={panelLabels.idleColor}
          />
          {/* A div, not a p: the copy is a lead sentence plus a list of
              figures, and the parser would hoist those straight out of an
              enclosing p. */}
          {description && (
            <div className="area-section__text"
                 dangerouslySetInnerHTML={{ __html: t(description) }} />
          )}
        </div>
      </div>
    </section>
  );
};

export default AreaReveal;
