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
 * One ranked area as a full-viewport section, following GSAP's
 * "pinned panels with overscroll" pattern.
 *
 * The section pins with pinSpacing:false, so no pin-spacer is inserted and the
 * document keeps its natural flow — the next section simply scrolls up over
 * this one. That avoids the layout reflow a spacer causes each time a pin
 * engages or releases, which is what made the panels snap.
 *
 * While pinned, scroll progress crossfades the loss layer over the 2025
 * extent; in the last stretch the section scales back and fades as its
 * successor covers it.
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
  const lossRef = useRef(null);
  const indRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !panels.extent) return undefined;

    // With pinSpacing:false the next section climbs over this one on its own,
    // and it starts doing so at progress dwell / (dwell + 1) — nothing in the
    // timeline below controls that. So the last beat has to be established
    // well before that point, or the next panel covers the loss layer while
    // the reader is still taking it in. At dwell 2.6 the hand-over begins at
    // about 0.72, which is what recedeFrom is matched to. The crossfade is
    // finished by 0.46, leaving the loss layer a quarter of the section to be
    // read before anything starts moving.
    const {
      holdExtent = 0.14,          // adjust: how long 2025 extent holds alone
      toLoss = 0.46,              // adjust: when the loss layer is fully in
      recedeFrom = 0.72,          // adjust: when the section starts giving way
    } = timings;

    // Extra room so the next section does not arrive the moment this one pins.
    section.style.marginBottom = `${dwell * 100}vh`;

    const preload = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom+=120%',
      once: true,
      onEnter: () => {
        [panels.extent, panels.loss].forEach((src) => {
          if (src) { const im = new Image(); im.src = src; }
        });
      },
    });

    let promoted = false;
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * (dwell + 1)}`,
      pin: true,
      pinSpacing: false,          // the whole point: no spacer, no reflow
      anticipatePin: 1,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        // one crossfade now: 2025 extent underneath, loss fading in over it
        const toLossNow = ramp(p, holdExtent, toLoss);
        if (lossRef.current) lossRef.current.style.opacity = toLossNow;
        // label units: 0 at the first box, 1 at the second
        if (indRef.current) indRef.current.setProgress(toLossNow);
        // recede as the next section climbs over this one
        const r = ramp(p, recedeFrom, 1);
        // Promote only while this is actually moving. Left on permanently it
        // costs a full-viewport layer per section, ten of them at once.
        const wantsLayer = r > 0;
        if (wantsLayer !== promoted) {
          promoted = wantsLayer;
          section.style.willChange = wantsLayer ? 'transform, opacity' : '';
        }
        section.style.transform = `scale(${1 - 0.08 * r})`;
        section.style.opacity = String(1 - 0.45 * r);
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
          <div className="area-reveal__frame">
            <img className="area-reveal__img" src={panels.extent} alt="" loading="eager" />
            <img className="area-reveal__img" ref={lossRef} src={panels.loss} alt="" style={{ opacity: 0 }} />
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
