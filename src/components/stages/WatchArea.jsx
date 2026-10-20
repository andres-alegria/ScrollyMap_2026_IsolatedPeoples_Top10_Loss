import React from 'react';
import { useTranslation } from 'react-i18next';
import ScaleBar from './ScaleBar';
import LocatorGlobe from './LocatorGlobe';
import './WatchArea.css';

/**
 * One of the closing "other lands to watch" chapters: copy on the left, a map
 * held beside it on the right.
 *
 * Built like the intro chapters rather than like the ranked ones. The ranked
 * sections each hold a screen and reveal in beats, because the reader is being
 * counted down a list; these two are read, not counted, and their copy runs
 * several times longer than a screen. So the text simply scrolls and the map
 * stays with it — position:sticky again, which costs no JavaScript and cannot
 * fall a frame behind the scroll.
 *
 * The panel is a plain image and sets its own aspect: Halmahera is square like
 * the ranked boxes, New Guinea is a wide island and would have drowned in
 * ocean as a square. Scale bar and locator are the ranked panels' own, so the
 * furniture reads the same across the piece.
 */
const WatchArea = ({
  panel,
  panelAlt = '',
  scale = {},
  locator,
  legend = [],
  caption,
  chapter = {},
}) => {
  const { t } = useTranslation();
  const { title, description } = chapter;
  // `legend` is one of the keys the Chapter wrapper pulls out of the config
  // and folds into the chapter object, so it never arrives as a prop of its
  // own however it is written in config.js. Read from both.
  const keys = (chapter.legend && chapter.legend.length ? chapter.legend : legend) || [];

  return (
    <section className="watch-section">
      <div className="watch-section__copy">
        {title && title.trim() && (
          <h3 className="watch-section__title font-lora">{t(title)}</h3>
        )}
        {/* A div, not a p: the copy is several paragraphs and a pull quote,
            which the parser would hoist straight out of an enclosing p. */}
        {description && (
          <div
            className="watch-section__text"
            dangerouslySetInnerHTML={{ __html: t(description) }}
          />
        )}
      </div>

      <div className="watch-section__aside">
        <figure className="watch-section__panel">
          <div className="watch-section__frame">
            <img
              className="watch-section__img"
              src={panel}
              alt={panelAlt ? t(panelAlt) : ''}
              loading="lazy"
            />
            {/* Top-left, opposite the scale bar and the locator, which hold
                the other two corners. Drawn in the page rather than baked into
                the raster so the type stays type — and so a change of wording
                does not mean re-reading the imagery. */}
            {keys.length > 0 && (
              <ul className="watch-legend">
                {keys.map((item) => (
                  <li key={item.label} className="watch-legend__item">
                    <span
                      className="watch-legend__swatch"
                      style={{ background: item.color }}
                    />
                    {t(item.label)}
                  </li>
                ))}
              </ul>
            )}
            <ScaleBar {...scale} />
            {locator && <LocatorGlobe center={locator} />}
          </div>
          {caption && (
            <figcaption className="watch-section__caption">{t(caption)}</figcaption>
          )}
        </figure>
      </div>
    </section>
  );
};

export default WatchArea;
