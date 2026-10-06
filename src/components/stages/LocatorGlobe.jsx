import React, { useEffect, useMemo, useState } from 'react';
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
 * — the Mongabay convention for a locator. The place name is not drawn here:
 * it reads as a bracketed qualifier beside the territory name in the title.
 *
 * Land geometry is pre-wound clockwise for d3-geo: a counter-clockwise
 * exterior ring is read as the polygon containing the antipode and floods the
 * whole hemisphere.
 */
const MARKER = 12;                                        // adjust marker size here

const LocatorGlobe = ({ center, size = 80 }) => {         // adjust locator size here
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
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {/* ocean */}
        <path d={spherePath} className="locator__ocean" />
        {landPath && <path d={landPath} className="locator__land" />}
        <path d={spherePath} className="locator__rim" />
        {markerXY && (
          <rect
            className="locator__marker"
            x={markerXY[0] - MARKER / 2}
            y={markerXY[1] - MARKER / 2}
            width={MARKER}
            height={MARKER}
          />
        )}
      </svg>
    </div>
  );
};

export default LocatorGlobe;
