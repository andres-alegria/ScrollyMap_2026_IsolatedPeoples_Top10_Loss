import React, { useState, useRef, useEffect, useMemo } from 'react';
import { transformRequest } from './map-utils';
import { useScrollFunctionality, useHandleResize } from './map-hooks';
import { useGlobeSequence, useGlobeVisibility } from './use-globe-sequence';
import { Map as MapGL, Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const Map = (props) => {
  const { chapters, accessToken, mapStyle, showMarkers, setCurrentChapter, externalLayers, currentChapterId, currentAction, globeAtmosphere, globeReveal, globeFadeOut } = props;
  const [loaded, setLoaded] = useState(false);
  const [externalLayersOpacity, setExternalLayersOpacity] = useState({});
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Use the first chapter that actually has a location (so PlainText can be first)
  const firstChapterWithLocation = chapters.find(
    (c) =>
      c &&
      c.location &&
      Array.isArray(c.location.center) &&
      c.location.center.length === 2
  );

  const initialLocation = firstChapterWithLocation?.location ?? {
    center: [0, 0],
    zoom: 1,
    pitch: 0,
    bearing: 0
  };

  const [initialLongitude, initialLatitude] = initialLocation.center;

  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude
  });

  const initialViewState = {
    latitude: initialLatitude,
    longitude: initialLongitude,
    pitch: initialLocation.pitch,
    bearing: initialLocation.bearing,
    zoom: initialLocation.zoom
  };

  // react-map-gl v8's <Map> auto-resizes its canvas via an internal
  // ResizeObserver on the container, but we keep an explicit safety-net
  // resize call too, since the map container here is CSS-fixed to the
  // viewport (see .map-container in app.scss) rather than a normal flow
  // element react-map-gl watches by default.
  useHandleResize(() => {
    map?.resize();
  });

  // Animated track head (used for the SVG marker variant, see below)
  const [animatedTrackHead, setAnimatedTrackHead] = useState(null); // [lon, lat] | null
  const [animatedTrackMarker, setAnimatedTrackMarker] = useState(null); // { svg, size, color, borderColor, borderWidth, rotate } | null
  const [animatedMarkerSvgMarkup, setAnimatedMarkerSvgMarkup] = useState('');

  const animatedMarkerStyle = useMemo(() => {
    if (!animatedTrackMarker) return {};
    const {
      size = 2,
      color = '#181818',
      borderColor = '#ffffff',
      borderWidth = 2,
      rotate = 0
    } = animatedTrackMarker;
    return {
      width: `${size}rem`,
      height: `${size}rem`,
      color,
      '--marker-border-color': borderColor,
      '--marker-border-width': `${borderWidth}px`,
      transform: `rotate(${rotate}deg)`
    };
  }, [animatedTrackMarker]);

  // Fetch and inline the marker SVG so its fill can be driven by CSS `currentColor`.
  useEffect(() => {
    if (!animatedTrackMarker?.svg) {
      setAnimatedMarkerSvgMarkup('');
      return undefined;
    }

    let cancelled = false;
    fetch(animatedTrackMarker.svg)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setAnimatedMarkerSvgMarkup(text);
      })
      .catch(() => {
        if (!cancelled) setAnimatedMarkerSvgMarkup('');
      });

    return () => {
      cancelled = true;
    };
  }, [animatedTrackMarker?.svg]);

  // Set map when loaded
  useEffect(() => {
    if (!loaded || !mapRef.current) return undefined;

    const m = mapRef.current.getMap();
    setMap(m);

    // Expose the live Mapbox map instance globally so other components (e.g. legend)
    // can read current paint properties from layers.
    //
    // Keep this name stable: chapter.js uses window.__MAP__.
    if (typeof window !== 'undefined') {
      window.__MAP__ = m;

      // If the style reloads (setStyle), keep the reference available.
      m.on('styledata', () => {
        window.__MAP__ = m;
      });
    }

    return undefined;
  }, [mapRef, loaded, setMap]);

  // 1) Animated track setup (source + layer)
  useEffect(() => {
    if (!loaded || !map) return;

    const SOURCE_ID = "vessel-anim";
    const LAYER_ID = "vessel-anim-line";

    const DOT_SOURCE_ID = "vessel-dot";
    const DOT_LAYER_ID = "vessel-dot-layer";

    const ensureAnimLayer = () => {
      // source
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] }
        });
      }

      // layer
      if (!map.getLayer(LAYER_ID)) {
        map.addLayer({
          id: LAYER_ID,
          type: "line",
          source: SOURCE_ID,
          paint: {
            "line-color": "#530e0d",
            "line-width": 1,
            "line-opacity": 0.5
          }
        });
      }

      // dot source (fallback marker when no SVG marker is configured)
      if (!map.getSource(DOT_SOURCE_ID)) {
        map.addSource(DOT_SOURCE_ID, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "Point", coordinates: [] }
          }
        });
      }

      // dot layer
      if (!map.getLayer(DOT_LAYER_ID)) {
        map.addLayer({
          id: DOT_LAYER_ID,
          type: "circle",
          source: DOT_SOURCE_ID,
          paint: {
            "circle-radius": 4,
            "circle-color": "#530e0d",
            "circle-stroke-width": 0.5,
            "circle-stroke-color": "#ffffff"
          }
        });
      }
    };

    ensureAnimLayer();

    // Re-add after any style reload
    map.on("styledata", ensureAnimLayer);
    return () => map.off("styledata", ensureAnimLayer);
  }, [loaded, map]);

  // 2) Animated track controller (plays ALL parts, antimeridian-safe, pause/resume)
  useEffect(() => {
    if (!loaded || !map) return;

    const SOURCE_ID = "vessel-anim";
    const LAYER_ID = "vessel-anim-line";
    const DOT_SOURCE_ID = "vessel-dot";
    const DOT_LAYER_ID = "vessel-dot-layer";

    let parts = [];            // array of coordinate arrays (each "part" is a LineString)
    let animId = null;

    // animation state
    let partIdx = 0;           // which part we're drawing
    let pointIdx = 0;          // how many points into the current part
    let isPaused = false;

    // "session" state
    let currentTrackFile = null;
    let speed = 2;
    let markerConfig = null;   // { type: 'svg', svg, size, color, borderColor, borderWidth, rotate } | null

    const setFeatures = (features) => {
      const src = map.getSource(SOURCE_ID);
      if (!src) return;

      src.setData({
        type: "FeatureCollection",
        features
      });
    };

    const setDot = (coord) => {
      const src = map.getSource(DOT_SOURCE_ID);
      if (!src) return;

      src.setData({
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: coord }
      });
    };

    // Bearing (in degrees) from point a to point b — used to orient the SVG marker.
    const bearingBetween = (a, b) => {
      const toRad = (d) => (d * Math.PI) / 180;
      const toDeg = (r) => (r * 180) / Math.PI;
      const [lon1, lat1] = a.map(toRad);
      const [lon2, lat2] = b.map(toRad);
      const dLon = lon2 - lon1;
      const y = Math.sin(dLon) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      return (toDeg(Math.atan2(y, x)) + 360) % 360;
    };

    const applyLineStyle = (style = {}) => {
      if (!map.getLayer(LAYER_ID)) return;
      if (style.color) map.setPaintProperty(LAYER_ID, "line-color", style.color);
      if (style.width) map.setPaintProperty(LAYER_ID, "line-width", style.width);
      if (typeof style.opacity === "number") map.setPaintProperty(LAYER_ID, "line-opacity", style.opacity);
    };

    const applyMarkerStyle = (marker) => {
      markerConfig = marker || null;
      if (markerConfig?.type === "svg") {
        // Hide the plain circle dot layer in favor of the SVG marker overlay.
        if (map.getLayer(DOT_LAYER_ID)) map.setLayoutProperty(DOT_LAYER_ID, "visibility", "none");
        setAnimatedTrackMarker(markerConfig);
      } else {
        if (map.getLayer(DOT_LAYER_ID)) map.setLayoutProperty(DOT_LAYER_ID, "visibility", "visible");
        setAnimatedTrackMarker(null);
        setAnimatedTrackHead(null);
      }
    };

    const buildDrawnFeatures = () => {
      const features = [];

      // fully completed parts
      for (let i = 0; i < partIdx; i++) {
        features.push({
          type: "Feature",
          properties: { part: i + 1, status: "done" },
          geometry: { type: "LineString", coordinates: parts[i] }
        });
      }

      // current part (partial)
      const current = parts[partIdx];
      if (current) {
        const slice = current.slice(0, Math.max(2, pointIdx));
        if (slice.length >= 2) {
          features.push({
            type: "Feature",
            properties: { part: partIdx + 1, status: "active" },
            geometry: { type: "LineString", coordinates: slice }
          });
        }
      }

      return features;
    };

    const loadTrack = async (trackFile) => {
      const res = await fetch(trackFile);
      const gj = await res.json();

      const feats = gj?.features || [];
      const lineFeats = feats.filter((f) => f?.geometry?.type === "LineString");

      parts = lineFeats
        .map((f) => f.geometry.coordinates || [])
        .filter((c) => Array.isArray(c) && c.length >= 2);

      return parts;
    };

    const reset = () => {
      if (animId) cancelAnimationFrame(animId);
      animId = null;

      partIdx = 0;
      pointIdx = 0;
      isPaused = false;

      // keep currentTrackFile so you can decide whether to restart or not
      setFeatures([]); // clear drawn line
      setDot([]);
      setAnimatedTrackHead(null);
    };

    const pause = () => {
      isPaused = true;
      if (animId) cancelAnimationFrame(animId);
      animId = null;
    };

    const updateHead = (coord, prevCoord) => {
      if (markerConfig?.type === "svg") {
        setAnimatedTrackHead(coord);
        if (prevCoord) {
          const heading = bearingBetween(prevCoord, coord);
          setAnimatedTrackMarker((prev) => (prev ? { ...prev, rotate: heading + (markerConfig.rotate || 0) } : prev));
        }
      } else {
        setDot(coord);
      }
    };

    const tick = () => {
      if (isPaused) return;

      const current = parts[partIdx];
      if (!current) return;

      const prevHeadIndex = Math.max(0, Math.min(pointIdx - 1, current.length - 1));
      const prevCoord = current[prevHeadIndex];

      // advance within current part
      pointIdx = Math.min(pointIdx + speed, current.length);

      // render
      setFeatures(buildDrawnFeatures());

      const headIndex = Math.max(0, Math.min(pointIdx - 1, current.length - 1));
      updateHead(current[headIndex], prevCoord);

      // if current part finished -> next
      if (pointIdx >= current.length) {
        partIdx += 1;
        pointIdx = 0;

        // all parts done
        if (partIdx >= parts.length) {
          animId = null;
          return;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    const resume = () => {
      if (!parts.length) return;
      if (animId) cancelAnimationFrame(animId);
      isPaused = false;
      animId = requestAnimationFrame(tick);
    };

    const getBoundsFromParts = () => {
      let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;

      for (const part of parts) {
        for (const [lon, lat] of part) {
          if (lon < minLon) minLon = lon;
          if (lat < minLat) minLat = lat;
          if (lon > maxLon) maxLon = lon;
          if (lat > maxLat) maxLat = lat;
        }
      }

      if (!isFinite(minLon) || !isFinite(minLat) || !isFinite(maxLon) || !isFinite(maxLat)) return null;
      return [[minLon, minLat], [maxLon, maxLat]];
    };

    // trackAnimation.start(options)
    //
    // Options you can set from config.js:
    //   trackFile | vesselFile: "/data/tracks/your-file.geojson"  (required; trackFile is the preferred name)
    //   speed: Number
    //     - how fast the animation advances per frame (higher = faster).
    //   camera: "chapter" | "static" | "start" | "fit"
    //     - "chapter": let the chapter location control the camera (default).
    //     - "static":  do not move the camera at all.
    //     - "start":   fly to the first coordinate of the track before drawing.
    //     - "fit":     fitBounds to the whole track before drawing.
    //   cameraPadding: Number
    //     - padding (px) used by camera:"fit".
    //   flyToStart: boolean (optional)
    //     - manual override for the "start" behavior.
    //   restart: boolean
    //     - force reloading and restart the animation from the beginning.
    //   line: { color, width, opacity }
    //     - styles the drawn track line.
    //   marker: { type: "svg", svg, size, color, borderColor, borderWidth, rotate }
    //     - if provided (type: "svg"), the track head is rendered as a rotating SVG
    //       marker instead of the default plain circle dot. `svg` is a path/URL to
    //       an .svg file; `rotate` is a static degree offset added to the computed
    //       heading of travel.
    const start = async ({
      vesselFile,
      trackFile,
      speed: sp = 2,
      camera = "chapter",       // "chapter" | "static" | "start" | "fit"
      cameraPadding = 80,       // used by "fit"
      flyToStart,               // optional override; if omitted we infer from camera
      restart = false,
      line,
      marker
    } = {}) => {
      const file = trackFile || vesselFile;

      if (!file) {
        console.warn("trackAnimation.start: missing trackFile (or vesselFile)");
        return;
      }

      applyMarkerStyle(marker);
      if (line) applyLineStyle(line);

      // same track + not restarting: just resume where we left off
      if (currentTrackFile === file && parts.length && !restart) {
        speed = sp;
        resume();
        return;
      }

      // new track OR forced restart
      currentTrackFile = file;
      speed = sp;
      isPaused = false;

      await loadTrack(file);
      if (!parts.length) return;

      // reset progress only when starting new track or forced restart
      if (animId) cancelAnimationFrame(animId);
      animId = null;
      partIdx = 0;
      pointIdx = 0;

      setFeatures([]); // clear before re-drawing

      const shouldFlyToStart =
        typeof flyToStart === "boolean"
          ? flyToStart
          : camera === "start"; // default behavior based on camera mode

      if (camera === "fit") {
        const bounds = getBoundsFromParts();
        if (bounds) {
          map.fitBounds(bounds, {
            padding: cameraPadding,
            bearing: map.getBearing(),
            pitch: map.getPitch(),
            duration: 1200
          });
        }
      } else if (shouldFlyToStart) {
        const [lon, lat] = parts[0][0];
        map.flyTo({
          center: [lon, lat],
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
          duration: 1200
        });
      } else {
        // "chapter" and "static" do nothing here:
        // - "chapter": let scrolly's chapter location control the camera
        // - "static": keep whatever camera you already have
      }

      animId = requestAnimationFrame(tick);
    };

    // expose global API for scrolly triggers
    window.trackAnimation = { start, pause, resume, reset };

    return () => {
      // cleanup if component unmounts
      if (animId) cancelAnimationFrame(animId);
      if (window.trackAnimation) delete window.trackAnimation;
      setAnimatedTrackHead(null);
      setAnimatedTrackMarker(null);
      setAnimatedMarkerSvgMarkup('');
    };
  }, [loaded, map]);

  useScrollFunctionality({
    loaded,
    map,
    chapters,
    showMarkers,
    setCurrentChapter,
    setMarkerPosition,
    setExternalLayersOpacity,
    externalLayersOpacity,
    externalLayers,
    currentAction,
    currentChapterId
  });

  // Scroll-driven three-beat raster crossfade (2000 -> 2025 -> loss overlay)
  // The map now exists only for the opening globe; the ranked areas are images.
  useGlobeSequence({ map, loaded, chapters, atmosphere: globeAtmosphere, containerRef: mapContainerRef });
  // runs whether or not the map ever loads
  useGlobeVisibility({ containerRef: mapContainerRef, chapters, reveal: globeReveal, fadeOut: globeFadeOut });

  return (
    <div ref={mapContainerRef} className="map-container">
      <MapGL
        ref={mapRef}
        mapboxAccessToken={accessToken}
        mapStyle={mapStyle}
        transformRequest={transformRequest}
        onLoad={() => setLoaded(true)}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        scrollZoom={false}
        dragPan={false}
        dragRotate={false}
        doubleClickZoom={false}
      >
        {showMarkers && (
          <Marker
            longitude={markerPosition.longitude}
            latitude={markerPosition.latitude}
          />
        )}
        {animatedTrackHead && animatedMarkerSvgMarkup && (
          <Marker longitude={animatedTrackHead[0]} latitude={animatedTrackHead[1]}>
            <div
              className="track-marker"
              style={animatedMarkerStyle}
              dangerouslySetInnerHTML={{ __html: animatedMarkerSvgMarkup }}
            />
          </Marker>
        )}
      </MapGL>
    </div>
  );
}

export default Map;
