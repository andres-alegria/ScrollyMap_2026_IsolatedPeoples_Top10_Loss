import React from 'react';
import cx from 'classnames';

// Legend icon registry
//
// Add a new `case` here for each custom icon you want to reference from
// config.js via `legend: [{ icon: 'your-icon-name' }]`. Anything without a
// custom icon can just use the default color-swatch legend rendering
// instead (see chapter.js).

const MarkerIcon = (props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
    <circle cx="8" cy="8" r="6" />
  </svg>
);

const LegendIcon = ({ icon }) => {
  let Component = null;
  let classList = '';

  switch (icon) {
    case 'marker':
      classList = 'border-0.75 border-primary text-primary';
      Component = <MarkerIcon />;
      break;
    default:
      console.warn(`Unsupported icon:`, icon);
      Component = null;
      break;
  }

  return <div className={cx('flex w-6 h-6 rounded-full ', classList)}>{Component}</div>;
};

export default LegendIcon;
