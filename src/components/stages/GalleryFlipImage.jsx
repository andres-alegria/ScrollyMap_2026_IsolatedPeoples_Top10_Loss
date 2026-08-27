import React, { useMemo, useRef } from "react";

import "./GalleryFlipImage.css";

// GalleryFlipImage stage
//
// Adapted from the CodePen effect (mousewheel-driven horizontal gallery + CSS flip cards)
// https://codepen.io/piupiupiu/pen/YyxWpd
//
// Notes for scrolly integration:
// - We DO NOT hijack the mouse wheel for horizontal scrolling here, even though that was
//   tried early on. Intercepting wheel deltas to drive horizontal scroll broke the page's
//   own scroll-driven chapter transitions (the scrolly no longer advanced past this stage).
//   If you want wheel-to-horizontal again, you'll need to only intercept while the gallery
//   can still scroll horizontally, and let the event bubble at either edge so the scrolly
//   can still advance chapters.

export default function GalleryFlipImage(props = {}) {
  // Optional config (future-proof):
  // - items: [{ title, image, body, href }]
  // - cardWidth: number (px)
  const { items, cardWidth = 400, fillWidthWhenFew = true, fillWidthMaxItems = 3 } = props;

  const rootRef = useRef(null);
  const scrollerRef = useRef(null);

  const data = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    // Normalize items defensively
    return arr.map((d) => {
      const title = d?.title ?? d?.name ?? "";
      const image = d?.image ?? d?.img ?? d?.src ?? "";
      const body = d?.body ?? d?.text ?? d?.description ?? "";
      const href = d?.href ?? d?.url ?? "";
      return { title, image, body, href };
    });}, [items]);

  const isShort = fillWidthWhenFew && data.length > 0 && data.length <= fillWidthMaxItems;

  if (!data.length) {
    return (
      <div className="stage-flip-gallery">
        <div className="flip-gallery-empty">
          <p><strong>GalleryFlipImage:</strong> No items provided in config.js.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="stage-flip-gallery" ref={rootRef}>
      <div className={`flip-gallery-container${isShort ? " is-short" : ""}`} ref={scrollerRef}>
        <ul className={`flip-gallery${isShort ? " is-short" : ""}`} style={{ "--cardWidth": `${cardWidth}px` }}>
          {data.map((d, idx) => (
            <li key={`${d.title}-${idx}`} className="flip-gallery-item">
              <div className="flip">
                <div
                  className="front-side"
                  style={{ backgroundImage: `url(${d.image})` }}
                  role="img"
                  aria-label={d.title}
                />
                <div className="back-side">
                  <a href={d.href} onClick={(ev) => d.href === "#" && ev.preventDefault()}>
                    <div className="content">
<div className="text">
                        <h3>{d.title}</h3>
                        <p>{d.body}</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
