import React from 'react';
import './ScaleBar.css';

/**
 * Dual scale bar: the same round number shown in km and in miles, so the two
 * lines differ in length by a factor of 1.609. Widths arrive as fractions of
 * the panel's width, computed per area from its ground extent, which keeps
 * the bar correct at any rendered size.
 */
const ScaleBar = ({ n, kmFrac, miFrac }) => {
  if (!n) return null;
  return (
    <div className="scalebar" aria-label={`Scale: ${n} kilometres and ${n} miles`}>
      <div className="scalebar__row">
        <span className="scalebar__label">{n} km</span>
        <span className="scalebar__line" style={{ width: `${kmFrac * 100}%` }} />
      </div>
      <div className="scalebar__row">
        <span className="scalebar__label">{n} mi</span>
        <span className="scalebar__line" style={{ width: `${miFrac * 100}%` }} />
      </div>
    </div>
  );
};

export default ScaleBar;
