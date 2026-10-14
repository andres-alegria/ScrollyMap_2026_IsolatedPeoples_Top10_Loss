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
  caption,
  chapter = {},
}) => {
  const { t } = useTranslation();
  const { title, description } = chapter;

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
