import React from 'react';
import './intro.scss';
import SocialIcons from '../../components/social-icons/social-icons';
import Mouse from './mouse-icon';
import Arrow from './arrow-icon';
import { useTranslation } from 'react-i18next';

const Intro = ({ title, subtitle, date, social, height }) => {
  const { t } = useTranslation();
  const heightStyle = height ? { height: `${height}px` } : undefined;
  // adjust intro separator colour here
  const separatorClasses = 'h-px bg-black block flex-1 opacity-25';
  return (
    <div className="intro step absolute h-screen w-full bg-cover bg-no-repeat" style={heightStyle}>
      <div
        className="absolute h-screen w-full flex flex-col justify-center items-center"
        style={heightStyle}
      >
        <div className="container max-w-xl text-black text-center mb-10">
          <h1 className="title font-lora mb-10">{t(title)}</h1>
          <h2 className="intro__subtitle text-lg font-regular">{t(subtitle)}</h2>
        </div>
        <div className="container max-w-xl text-black">
          {date && (
            <div className="text-xs font-bold text-black flex items-center mb-6">
              <span className={separatorClasses} />
              <span className="font-bold uppercase px-1">{`${t('Published')} ${t(date)}`}</span>
              <span className={separatorClasses} />
            </div>
          )}
        </div>
        <div className="container max-w-sm text-gray-800 text-center flex flex-col justify-center items-center">
          <div className="mb-5 flex flex-col items-center">
            <Mouse className="opacity-75 fill-current w-5 mb-1" />
            <Arrow className="arrow-animate opacity-75 fill-current w-3 mb-1/2" />
            <Arrow className="arrow-animate opacity-75 fill-current w-3" />
          </div>
          {t('scroll down to discover')}
        </div>
        {social && (
          <SocialIcons social={social} className="social-icons--intro absolute bottom-0 left-0" />
        )}
      </div>
    </div>
  );
};

export default Intro;
