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
 * While pinned, scroll progress drives the three beats; in the last stretch
 * the section scales back and fades as its successor covers it.
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
  const { rank, title, homeTo, description } = chapter;
  const sectionRef = useRef(null);
  const b2Ref = useRef(null);
  const b3Ref = useRef(null);
  const indRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !panels.beat1) return undefined;

    // With pinSpacing:false the next section climbs over this one on its own,
    // and it starts doing so at progress dwell / (dwell + 1) — nothing in the
    // timeline below controls that. So the last beat has to be established
    // well before that point, or the next panel covers the loss layer while
    // the reader is still taking it in. At dwell 2.6 the hand-over begins at
    // about 0.72, which is what recedeFrom is matched to.
    const {
      holdFirst = 0.10, toSecond = 0.26,
      holdSecond = 0.38, toThird = 0.52,
      recedeFrom = 0.72,          // adjust: when the section starts giving way
    } = timings;

    // Extra room so the next section does not arrive the moment this one pins.
    section.style.marginBottom = `${dwell * 100}vh`;

    const preload = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom+=120%',
      once: true,
      onEnter: () => {
        [panels.beat1, panels.beat2, panels.beat3].forEach((src) => {
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
        const toB2 = ramp(p, holdFirst, toSecond);
        const toB3 = ramp(p, holdSecond, toThird);
        if (b2Ref.current) b2Ref.current.style.opacity = toB2;
        if (b3Ref.current) b3Ref.current.style.opacity = toB3;
        // the two ramps never overlap, so their sum is the bar's position in
        // label units: 0 at the first label, 1 at the second, 2 at the third
        if (indRef.current) indRef.current.setProgress(toB2 + toB3);
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

  return (
    <section className="area-section" ref={sectionRef}>
      <h3 className="area-section__title font-lora">
        {rank && <span className="area-section__rank">{rank}</span>}
        <span className="area-section__name">{t(title || '')}</span>
      </h3>
      {/* The lede sits under the title on narrow screens and inside the text
          column on wide ones. The two slots live in different containers, so
          CSS order can't move a single node between them — both are rendered
          and the breakpoint shows one. */}
      {homeTo && (
        <p className="area-section__hometo area-section__hometo--above">
          {t('Home to')}: <b>{t(homeTo)}</b>
        </p>
      )}

      <div className="area-section__body">
        <div className="area-section__panel">
          <div className="area-reveal__frame">
            <img className="area-reveal__img" src={panels.beat1} alt="" loading="eager" />
            <img className="area-reveal__img" ref={b2Ref} src={panels.beat2} alt="" style={{ opacity: 0 }} />
            <img className="area-reveal__img" ref={b3Ref} src={panels.beat3} alt="" style={{ opacity: 0 }} />
            <ScaleBar {...scale} />
            <LocatorGlobe center={locator} place={[adm1, country].filter(Boolean).join(', ')} />
          </div>
        </div>

        <div className="area-section__card">
          <BeatIndicator ref={indRef} beats={panelLabels.beats || []} note={panelLabels.note} />
          {homeTo && (
            <p className="area-section__hometo area-section__hometo--card">
              {t('Home to')}: <b>{t(homeTo)}</b>
            </p>
          )}
          {description && (
            <p className="area-section__text"
               dangerouslySetInnerHTML={{ __html: t(description) }} />
          )}
        </div>
      </div>
    </section>
  );
};

export default AreaReveal;
