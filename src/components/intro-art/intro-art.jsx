import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import gsap from 'gsap';
import './intro-art.scss';

/**
 * The intro collage, rebuilt from individual elements over the page's own
 * paper ground rather than baked into one flat image.
 *
 * On load each piece starts drawn in towards the centre and slightly small,
 * then grows and slides out to its resting place at the edges. Pieces on the
 * left drift in from the right and vice versa, so the whole thing opens
 * outwards from the title.
 *
 * Layout lives in config.js under `intro.art` as percentages of the viewport,
 * which is what makes it adjustable without touching this file.
 */
const IntroArt = ({ elements = [] }) => {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || elements.length === 0) return undefined;
    const pieces = gsap.utils.toArray('.intro-art__piece', root);
    if (pieces.length === 0) return undefined;

    // The motion is decoration; without it the collage should simply be there.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(pieces, { opacity: 1 });
      return undefined;
    }

    // Promote only for the duration of the entrance, then hand the layers back.
    gsap.set(pieces, { willChange: 'transform, opacity' });

    const drift = () => Math.min(window.innerWidth, 1600) * 0.055;  // adjust travel
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => gsap.set(pieces, { willChange: '' }),
    });

    tl.from(pieces, {
      opacity: 0,
      scale: 0.84,                       // adjust starting size
      // left-hand pieces come in from the right, right-hand ones from the left
      x: (i, el) => (parseFloat(el.dataset.left) < 50 ? drift() : -drift()),
      duration: 1.5,                     // adjust entrance duration
      stagger: { each: 0.09, from: 'center' },
    });

    return () => { tl.kill(); gsap.set(pieces, { willChange: '' }); };
  }, [elements]);

  if (elements.length === 0) return null;

  return (
    // Decorative: the story is carried by the copy, so keep it out of the
    // accessibility tree entirely.
    <div className="intro-art" ref={rootRef} aria-hidden="true">
      {elements.map((el) => (
        <img
          key={el.src}
          className={cx('intro-art__piece', el.onMobile && 'intro-art__piece--mobile')}
          src={el.src}
          alt=""
          data-left={el.right !== undefined ? 100 - parseFloat(el.right) : parseFloat(el.left)}
          // custom properties rather than direct left/top/width, so the mobile
          // layout can drop them without fighting an inline style.
          // `height` sizes by viewport height instead of width, which is what
          // keeps a piece aligned to a text element as the viewport reshapes;
          // `right` anchors to the right edge so it stays flush either way.
          style={{
            '--l': el.left ?? 'auto',
            '--r': el.right ?? 'auto',
            '--t': el.top,
            '--w': el.width ?? 'auto',
            '--h': el.height ?? 'auto',
          }}
        />
      ))}
    </div>
  );
};

export default IntroArt;
