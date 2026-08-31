import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { geoOrthographic, geoPath, geoCircle } from 'd3-geo';
import './LocatorGlobe.css';

// Loaded once and shared by all ten panels.
let landPromise = null;
const loadLand = () => {
  if (!landPromise) {
    landPromise = fetch('/data/land-110m.geojson')
      .then((r) => r.json())
      .catch((e) => { console.warn('[locator] land failed to load', e); return null; });
  }
  return landPromise;
};

/**
 * Small orthographic locator, bottom-right of each panel.
 *
 * The globe spins so the territory faces the viewer, and a red square marks it
 * — the Mongabay convention for a locator. Land geometry is pre-wound
 * clockwise for d3-geo: a counter-clockwise exterior ring is read as the
 * polygon containing the antipode and floods the whole hemisphere.
 */
const LocatorGlobe = ({ center, place, size = 80 }) => {   // adjust locator size here
  const { t } = useTranslation();
  const [land, setLand] = useState(null);
  useEffect(() => { let live = true; loadLand().then((d) => live && setLand(d)); return () => { live = false; }; }, []);

  const { landPath, spherePath, markerXY } = useMemo(() => {
    if (!center) return {};
    const r = size / 2 - 2;
    const projection = geoOrthographic()
      .translate([size / 2, size / 2])
      .scale(r)
      .rotate([-center[0], -center[1]])       // spin the territory to face us
      .clipAngle(90);
    const path = geoPath(projection);
    return {
      landPath: land ? path(land) : null,
      spherePath: path({ type: 'Sphere' }),
      markerXY: projection(center),
    };
  }, [land, center, size]);

  if (!center) return null;

  return (
    <div className="locator">
      {place && <span className="locator__place">{t(place)}</span>}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {/* ocean */}
        <path d={spherePath} className="locator__ocean" />
        {landPath && <path d={landPath} className="locator__land" />}
        <path d={spherePath} className="locator__rim" />
        {markerXY && (
          <rect
            className="locator__marker"
            x={markerXY[0] - 3}
            y={markerXY[1] - 3}
            width={6}
            height={6}
          />
        )}
      </svg>
    </div>
  );
};

export default LocatorGlobe;
