import React, { useEffect, useRef } from 'react';
import cx from 'classnames';

/**
 * Two uses:
 *   default — pinned bottom-right, travelling with the reader over the paper
 *   inline   — laid out in the footer row, on the dark ground
 *
 * The pinned copy hides itself once it reaches the footer so it doesn't sit on
 * top of the inline one.
 */
const Logos = ({ logos, inline = false }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (inline) return undefined;
    const el = ref.current;
    const footer = document.getElementById('footer');
    if (!el || !footer) return undefined;

    let queued = false;
    const check = () => {
      queued = false;
      const a = el.getBoundingClientRect();
      const b = footer.getBoundingClientRect();
      // hand off to the copy laid out inside the footer
      el.classList.toggle('logos--parked', a.bottom > b.top && a.top < b.bottom);
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
  }, [logos, inline]);

  return logos && logos.length ? (
    <div
      ref={ref}
      className={cx(
        'logos flex items-center',
        inline ? 'logos--inline' : 'logos--floating fixed bottom-0 right-0 m-3 mb-6'
      )}
    >
      {logos.map((logo) => (
        <a
          key={logo.name}
          title={logo.name}
          href={logo.href}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={logo.src}
            title={`${logo.name} logo`}
            alt={`${logo.name} logo`}
            style={!inline && logo.width ? { width: `${logo.width}px` } : undefined}
          />
        </a>
      ))}
    </div>
  ) : null;
}

export default Logos;
