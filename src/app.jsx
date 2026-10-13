import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './app.scss';
import Story from './components/story/story';
import Map from './components/map/map';
import Intro from './components/intro/intro';
import Logos from './components/logos/logos';
import ReadingProgress from './components/reading-progress/reading-progress';

const App = (props) => {
  const {
    chapters,
    accessToken,
    style,
    theme,
    showMarkers,
    title,
    subtitle,
    byline,
    footer,
    intro,
    logos,
    globeAtmosphere,
    globeWindows,
    globeFinale,
    credits,
    panelLabels,
  } = props;
  const [currentChapterId, setCurrentChapter] = useState(chapters[0]?.id);
  const [currentAction, setCurrentAction] = useState();

  // Take the wheel off the compositor thread.
  //
  // The ranked sections are pinned by ScrollTrigger, which can only reposition
  // them from JavaScript. The browser, meanwhile, scrolls on the compositor
  // thread and paints that frame whether or not the main thread has caught up.
  // At every hand-over the arriving section therefore travels one frame too
  // far before it is pinned, and is put back on the next frame: the hiccup
  // where the panel slips and recovers. It is invisible to measurement — the
  // DOM reads correct a frame later, which is exactly the problem — and it
  // does not depend on scroll speed, only on the main thread being a frame
  // behind.
  //
  // normalizeScroll makes GSAP handle the wheel itself, so the scroll position
  // and the pins move in the same frame. Wheel only: touch scrolling is left
  // native, which phones handle well and which keeps iOS address-bar
  // behaviour untouched. Remove this call to go back to native wheel
  // scrolling.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const normalizer = ScrollTrigger.normalizeScroll({ type: 'wheel' });
    return () => { if (normalizer) normalizer.kill(); };
  }, []);

  const renderError = (missing) => (
    <div className="flex justify-center items-center h-screen">
      Please add the missing {missing}. Check the Readme
    </div>
  );
  if (style === 'ADD YOUR MAPBOX STYLE HERE') {
    return renderError('Mapbox map style');
  }
  if (!accessToken) {
    return renderError('Mapbox access token');
  }

  return (
    <div>
      <ReadingProgress theme={theme} />
      {intro && <Intro {...intro} />}
      <Logos logos={logos} />
      <Story
        hasIntro={!!intro}
        chapters={chapters}
        title={title}
        subtitle={subtitle}
        byline={byline}
        theme={theme}
        currentChapterId={currentChapterId}
        footer={footer}
        credits={credits}
        social={intro && intro.social}
        logos={logos}
        setCurrentChapter={setCurrentChapter}
        setCurrentAction={setCurrentAction}
        panelLabels={panelLabels}
      />
      <Map
        chapters={chapters}
        currentAction={currentAction}
        accessToken={accessToken}
        mapStyle={style}
        showMarkers={showMarkers}
        currentChapterId={currentChapterId}
        globeAtmosphere={globeAtmosphere}
        globeWindows={globeWindows}
        globeFinale={globeFinale}
      />
    </div>
  );
};

export default App;
