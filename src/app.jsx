import React, { useState } from 'react';
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
    globeReveal,
    globeFadeOut,
    credits,
    panelLabels,
  } = props;
  const [currentChapterId, setCurrentChapter] = useState(chapters[0]?.id);
  const [currentAction, setCurrentAction] = useState();

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
        globeReveal={globeReveal}
        globeFadeOut={globeFadeOut}
      />
    </div>
  );
};

export default App;
