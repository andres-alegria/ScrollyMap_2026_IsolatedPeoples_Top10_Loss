import React, { useLayoutEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import './WorldLosses.css';

/**
 * The closing world map: the land with the most tree cover loss in each of the
 * nine countries.
 *
 * The map itself is a rendered image — Robinson, which Mapbox cannot project,
 * with GEBCO relief under the palette the other two closing panels use. What
 * is drawn here instead of baked into it is everything made of type: the dots,
 * their leader lines and their labels, as an SVG laid over the image in the
 * image's own pixel units. Type that stays type can be read by a screen
 * reader, translated with the rest of the piece, and kept crisp at any size.
 *
 * Seven of the nine lands sit inside eight per cent of the map's width, so the
 * labels cannot be placed by rule — each one's position is given in config,
 * fanned out into the empty oceans. That also means they stop working on a
 * narrow screen, where there is no empty ocean to fan into: below the
 * breakpoint the labels are dropped and the same nine are listed under the
 * map, in the order the map ranks them.
 */
const fmt = (n) => n.toLocaleString('en-US');

// The wildfire share is worked out here rather than stored, so it can never
// disagree with the loss figure beside it. Three of the nine have no wildfire
// figure at all — the dataset says "No data" — and say so rather than showing
// a zero, which would read as "no fires".
const fireLine = (d) => {
  if (d.fire === null || d.fire === undefined) return 'Wildfires: no data';
  const share = Math.round((d.fire / d.loss) * 100);
  return `Wildfires: ${fmt(d.fire)} ha (${share}% of the loss)`;
};

const WorldLosses = ({
  panel,
  panelAlt = '',
  viewBox = [2600, 1070],
  lands = [],
  chapter = {},
}) => {
  const { t } = useTranslation();
  const { title, description } = chapter;
  const [W, H] = viewBox;
  const [open, setOpen] = useState(null);
  const textRefs = useRef([]);
  const [boxes, setBoxes] = useState([]);

  // The hover target is the label's whole block, not its glyphs: an SVG text
  // element only answers to the pointer where ink actually is, so chasing the
  // gaps between letters would be the reader's problem. Measured once the
  // labels have been laid out, and again if the set changes.
  useLayoutEffect(() => {
    setBoxes(textRefs.current.map((el) => {
      if (!el) return null;
      const b = el.getBBox();
      return { x: b.x - 10, y: b.y - 8, w: b.width + 20, h: b.height + 16 };
    }));
  }, [lands, W, H]);

  return (
    <section className="world-section">
      <div className="world-section__head">
        {title && title.trim() && (
          <h3 className="world-section__title font-lora">{t(title)}</h3>
        )}
        {description && (
          <div
            className="world-section__lede"
            dangerouslySetInnerHTML={{ __html: t(description) }}
          />
        )}
      </div>

      <figure className="world-section__figure">
        <div className="world-section__frame">
          <img
            className="world-section__img"
            src={panel}
            alt={panelAlt ? t(panelAlt) : ''}
            loading="lazy"
          />
          <svg
            className="world-section__overlay"
            viewBox={`0 0 ${W} ${H}`}
            role="presentation"
            focusable="false"
          >
            {/* Leaders first, so a dot always sits on top of its own line. */}
            <g className="world-overlay__leaders">
              {lands.map((d) => {
                const x = d.x * W;
                const y = d.y * H;
                const lx = d.lx * W;
                const ly = d.ly * H;
                // One elbow, turned at the label's height: the line leaves the
                // dot on the diagonal and arrives flat, which reads as
                // pointing rather than as a chart's connector.
                // The elbow sits on whichever side of the label the dot is,
                // not on the side the anchor implies — two of the nine have
                // their dot on the other side.
                const ex = x > lx ? lx + 26 : lx - 26;
                return (
                  <path
                    key={d.country}
                    className="world-overlay__leader"
                    d={`M ${x} ${y} L ${ex} ${ly} L ${lx} ${ly}`}
                  />
                );
              })}
            </g>

            <g className="world-overlay__dots">
              {lands.map((d) => (
                <g key={d.country}>
                  {/* Sized so that the two Chaco lands, which are 17 units
                      apart, still read as two dots with the paper ring
                      between them rather than as one blob. */}
                  <circle cx={d.x * W} cy={d.y * H} r="12" className="world-overlay__halo" />
                  <circle cx={d.x * W} cy={d.y * H} r="8.5" className="world-overlay__dot" />
                </g>
              ))}
            </g>

            <g className="world-overlay__labels">
              {lands.map((d, i) => (
                <g
                  key={d.country}
                  className="world-overlay__hit"
                  tabIndex={0}
                  role="button"
                  aria-label={`${t(d.land)}, ${t(d.country)}. Main driver of loss: ${t(d.driver)}. ${fireLine(d)}`}
                  // mouseover/mouseout, not enter/leave: React synthesises
                  // the enter/leave pair from these two and a relatedTarget,
                  // and that synthesis does not survive an SVG <g> in every
                  // browser — the popup then answered only to the focus
                  // handler, which is what made it look like a click was
                  // needed. These two are delegated as they come.
                  //
                  // They bubble, so crossing from the hit rectangle to the
                  // glyphs above it fires an out and an over of its own; the
                  // guard keeps the popup up as long as the pointer is still
                  // somewhere inside this label's group.
                  onMouseOver={() => setOpen(d.country)}
                  onMouseOut={(e) => {
                    const to = e.relatedTarget;
                    if (to && to.nodeType && e.currentTarget.contains(to)) return;
                    setOpen((c) => (c === d.country ? null : c));
                  }}
                  onFocus={() => setOpen(d.country)}
                  onBlur={() => setOpen((c) => (c === d.country ? null : c))}
                >
                  {boxes[i] && (
                    <rect
                      className="world-overlay__hitarea"
                      x={boxes[i].x}
                      y={boxes[i].y}
                      width={boxes[i].w}
                      height={boxes[i].h}
                    />
                  )}
                <text
                  ref={(el) => { textRefs.current[i] = el; }}
                  x={d.lx * W}
                  y={d.ly * H}
                  textAnchor={d.anchor || 'start'}
                  className="world-overlay__label"
                >
                  {/* The land leads, because that is what the dot marks; the
                      country and the figure follow together underneath. The
                      name may arrive as an array, which is how the longer ones
                      are broken: the gaps between South America and Africa, and
                      between New Guinea and the frame's edge, are too narrow to
                      take "North and South Kakataibo Indigenous Reserve" on one
                      line. */}
                  {(Array.isArray(d.name) ? d.name : [d.name || d.land]).map((line, i) => (
                    <tspan
                      key={line}
                      x={d.lx * W}
                      dy={i === 0 ? 0 : 30}
                      className="world-overlay__name"
                    >
                      {t(line)}
                    </tspan>
                  ))}
                  <tspan x={d.lx * W} dy="30" className="world-overlay__place">
                    {t(d.country)}
                  </tspan>
                  <tspan className="world-overlay__loss">
                    {'  '}
                    {fmt(d.loss)} ha
                  </tspan>
                </text>
                </g>
              ))}
            </g>
          </svg>

          {/* The popup is HTML rather than SVG so it can be styled and wrapped
              like the rest of the page. It is positioned from the same
              fractions the label uses, and takes its side from the label's
              anchor so it opens into the ocean rather than off the frame. */}
          {lands.map((d) => (
            open === d.country ? (
              <div
                key={d.country}
                // Which way it opens is decided by where the label sits, not
                // by the label's own anchor: the two Asian labels run
                // rightward but are close enough to the frame's edge that the
                // popup has to open back toward the middle, and the lowest
                // two would otherwise hang off the bottom.
                className={cx('world-popup',
                  (d.lx > 0.6 || (d.anchor === 'end' && d.lx > 0.25)) && 'world-popup--left',
                  d.ly > 0.68 && 'world-popup--up')}
                style={{ left: `${d.lx * 100}%`, top: `${d.ly * 100}%` }}
                role="tooltip"
              >
                <p className="world-popup__row">
                  <span className="world-popup__key">Main driver</span>
                  {t(d.driver)}
                </p>
                <p className="world-popup__row">{fireLine(d)}</p>
              </div>
            ) : null
          ))}
        </div>

        {/* The same nine, for the screen that cannot hold the labels — and for
            anyone reading the piece rather than looking at it. */}
        <ol className="world-section__list">
          {lands.map((d) => (
            <li key={d.country} className="world-section__row">
              <span className="world-section__name">{t(d.land)}</span>
              <span className="world-section__loss">{fmt(d.loss)} ha</span>
              <span className="world-section__place">{t(d.country)}</span>
              {/* What the desktop reader gets on hover. There is nothing to
                  hover on a phone, so it is simply written out. */}
              <span className="world-section__facts">
                Main driver: {t(d.driver)}. {fireLine(d)}.
              </span>
            </li>
          ))}
        </ol>

      </figure>
    </section>
  );
};

export default WorldLosses;
