import React from 'react';
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

const WorldLosses = ({
  panel,
  panelAlt = '',
  viewBox = [2600, 1070],
  lands = [],
  caption,
  chapter = {},
}) => {
  const { t } = useTranslation();
  const { title, description } = chapter;
  const [W, H] = viewBox;

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
                  <circle cx={d.x * W} cy={d.y * H} r="15" className="world-overlay__halo" />
                  <circle cx={d.x * W} cy={d.y * H} r="11" className="world-overlay__dot" />
                </g>
              ))}
            </g>

            <g className="world-overlay__labels">
              {lands.map((d) => (
                <text
                  key={d.country}
                  x={d.lx * W}
                  y={d.ly * H}
                  textAnchor={d.anchor || 'start'}
                  className="world-overlay__label"
                >
                  <tspan className="world-overlay__country">{t(d.country)}</tspan>
                  <tspan className="world-overlay__loss">
                    {'  '}
                    {fmt(d.loss)} ha
                  </tspan>
                  <tspan
                    x={d.lx * W}
                    dy="30"
                    className="world-overlay__land"
                  >
                    {t(d.short || d.land)}
                  </tspan>
                </text>
              ))}
            </g>
          </svg>
        </div>

        {/* The same nine, for the screen that cannot hold the labels — and for
            anyone reading the piece rather than looking at it. */}
        <ol className="world-section__list">
          {lands.map((d) => (
            <li key={d.country} className="world-section__row">
              <span className="world-section__country">{t(d.country)}</span>
              <span className="world-section__land">{t(d.land)}</span>
              <span className="world-section__loss">{fmt(d.loss)} ha</span>
            </li>
          ))}
        </ol>

        {caption && (
          <figcaption className="world-section__caption">{t(caption)}</figcaption>
        )}
      </figure>
    </section>
  );
};

export default WorldLosses;
