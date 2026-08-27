import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import './reading-progress.scss';

// Thin top-of-page scroll progress bar. Driven by requestAnimationFrame and
// writes directly to the DOM (no React re-renders per scroll event).
const ReadingProgress = ({ theme }) => {
  const barRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (barRef.current) {
      barRef.current.style.transition = prefersReducedMotion ? 'none' : 'transform 100ms linear';
    }

    let ticking = false;

    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className={cx('reading-progress', theme)}>
      <div ref={barRef} className="reading-progress__bar" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
};

export default ReadingProgress;
