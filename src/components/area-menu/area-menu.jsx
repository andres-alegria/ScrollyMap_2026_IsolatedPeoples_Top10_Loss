import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import './area-menu.scss';

gsap.registerPlugin(ScrollTrigger);

/**
 * Jump bar for the ranked areas — all ten visible at once, #10 left to #1
 * right, so the countdown can be read as a whole rather than only in sequence.
 *
 * Appears once the chapter that introduces the top ten has been read, and
 * withdraws again if the reader goes back above it or reaches the credits.
 *
 * `items` come from the chapters carrying an `areaId`, in config order.
 */
const AreaMenu = ({ items = [], showAfter, hideAt }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const barRef = useRef(null);

  useEffect(() => {
    if (items.length === 0) return undefined;

    // The trigger is the introducing chapter's card, not its scroll runway,
    // so the bar arrives as that copy leaves rather than half a screen later.
    const host = showAfter && document.getElementById(showAfter);
    const startEl = host && (host.querySelector('.chapter-card') || host);
    const endEl = hideAt && document.getElementById(hideAt);
    if (!startEl) return undefined;

    const st = ScrollTrigger.create({
      trigger: startEl,
      start: 'bottom top',                       // adjust when the bar appears
      ...(endEl ? { endTrigger: endEl, end: 'top top' } : { end: 'max' }),
      onToggle: (self) => setVisible(self.isActive),
    });

    return () => st.kill();
  }, [items.length, showAfter, hideAt]);

  // Which area the reader is in, worked out from geometry rather than from the
  // app's currentChapterId. That value is a chapter *transition* signal — the
  // waypoints deliberately set it to the chapter being LEFT so the map can run
  // onChapterExit — and when scrolling up the leaving chapter's callback fires
  // last, so it trails a section behind. Reading positions is symmetric in
  // both directions.
  useEffect(() => {
    if (items.length === 0) return undefined;
    let queued = false;
    const check = () => {
      queued = false;
      let active = null;
      // items run #10 -> #1 down the page, so the last one whose top has
      // reached the viewport is the one on screen
      items.forEach((it) => {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= 1) active = it.id;
      });
      setCurrentId((prev) => (prev === active ? prev : active));
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(check);
    };

    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items]);

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Jump, do not travel. A tweened scroll runs the whole countdown in
    // between: every section it passes plays its crossfade and its recede at
    // warp speed, and the last stretch of the ease is slow enough that the
    // reader arrives looking at two panels superimposed — the outgoing one
    // still scaled back at half opacity under the incoming one. Landing in one
    // frame skips all of that; the sections passed over are taken straight to
    // their end state, which is the same state they would hold if the reader
    // had scrolled there.
    gsap.killTweensOf(window);            // in case an older tween is still live
    const y = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y, behavior: 'auto' });
    // Settle the triggers in the same frame as the jump rather than on the
    // next scroll event, so nothing is painted mid-handover.
    ScrollTrigger.update();
  };

  if (items.length === 0) return null;

  return (
    <nav
      ref={barRef}
      className={cx('area-menu', visible && 'area-menu--visible')}
      aria-label={t('Jump to a territory')}
      aria-hidden={!visible}
    >
      {/* Jumping rather than smooth-scrolling, for the same reason the credits
          button does: this is tens of thousands of pixels, and every scrubbed
          animation in the piece would be whipped through on the way past. */}
      <button
        type="button"
        className="area-menu__back"
        onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
        tabIndex={visible ? 0 : -1}
        title={t('Back to the start')}
      >
        {t('Back to the start')}
      </button>

      <ul className="area-menu__list">
        {items.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              className={cx('area-menu__item', it.id === currentId && 'is-current')}
              onClick={() => goTo(it.id)}
              tabIndex={visible ? 0 : -1}
              title={`${it.rank} ${t(it.title)} — ${t(it.country)}`}
              aria-label={`${it.rank} ${t(it.title)}, ${t(it.country)}`}
            >
              <span className="area-menu__rank">{it.rank}</span>
              <span className="area-menu__label">
                <span className="area-menu__name">{t(it.menuName || it.title)}</span>
                <span className="area-menu__country">{t(it.country)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AreaMenu;
