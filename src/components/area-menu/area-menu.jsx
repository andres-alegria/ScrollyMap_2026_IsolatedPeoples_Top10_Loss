import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useTranslation } from 'react-i18next';
import './area-menu.scss';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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
    // Duration scaled by distance: adjacent areas are a second away, but #10 to
    // #1 is tens of thousands of pixels and a fixed duration would whip the
    // whole countdown past. Capped so the longest jump stays bearable.
    const dist = Math.abs(el.getBoundingClientRect().top);
    const duration = Math.min(1.2, Math.max(0.45, dist / 9000));
    gsap.to(window, {
      duration,
      ease: 'power2.inOut',
      overwrite: true,                       // a second tap replaces the first
      // autoKill:false is load-bearing on touch devices. autoKill cancels the
      // tween as soon as it sees scrolling it did not cause — and on a real
      // touchscreen a tap almost always carries a pixel or two of finger
      // drift, plus iOS momentum and rubber-banding. That killed the tween on
      // its first frame: the page twitched and went nowhere. It never showed
      // up in a desktop responsive simulator, which sends mouse events with no
      // drift at all.
      scrollTo: { y: el, autoKill: false },  // element, not selector: ids contain spaces
    });
  };

  if (items.length === 0) return null;

  return (
    <nav
      ref={barRef}
      className={cx('area-menu', visible && 'area-menu--visible')}
      aria-label={t('Jump to a territory')}
      aria-hidden={!visible}
    >
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
