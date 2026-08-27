import React from 'react';
import cx from 'classnames';
import Chapter from '../chapter/chapter';
import Credits from '../credits/credits';
import SocialIcons from '../social-icons/social-icons';
import Logos from '../logos/logos';
import { useTranslation } from 'react-i18next';
import './story.scss';

const Story = ({ title, subtitle, byline, theme, chapters, alignment, currentChapterId, footer, credits, social, logos, hasIntro, setCurrentChapter, setCurrentAction, panelLabels }) => {
  const { t } = useTranslation();

  return (
    <div id="story" className={cx({ "withIntro": hasIntro })}>
      {title && (
        <div id="header" className={theme}>
          <h1>{t(title)}</h1>
          {subtitle && <h2>{t(subtitle)}</h2>}
          {byline && <p>{t(byline)}</p>}
        </div>
      )}
      {/* NOT a flex container: ScrollTrigger pins insert a pin-spacer, and as a
          flex item that spacer makes the container re-solve its layout every time
          a pin engages or releases - which shows up as the panel snapping.
          Block stacking gives the same result without that. */}
      {/* Full width, not 90%: every chapter inside either centres its own
          content or caps its own measure, so the outer inset only stopped
          full-bleed chapters from reaching the edge of the screen. */}
      <div id="features" className="w-full block">
        {chapters.map((chapter) => (
          <Chapter
            key={chapter.id}
            theme={theme}
            {...chapter}
            panelLabels={panelLabels}
            currentChapterId={currentChapterId}
            setCurrentChapter={setCurrentChapter}
            setCurrentAction={setCurrentAction}
          />
        ))}
      </div>
      <Credits credits={credits} />
      {/* Credits moved into their own section above; the footer is now just the
          dark strip the fixed logo sits on, so it renders whether or not there
          is any text left to put in it. */}
      <div id="footer" className={`footer-${theme} p-4 pb-16 w-full text-center text-base`}>
        {footer && <p>{t(footer)}</p>}
        <div className="footer__row">
          <SocialIcons social={social} className="social-icons--footer" />
          <Logos logos={logos} inline />
        </div>
      </div>
    </div>
  );
}

export default Story;