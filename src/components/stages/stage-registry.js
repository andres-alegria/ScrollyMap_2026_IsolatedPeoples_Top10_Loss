// Stage registry
//
// Add / remove stage "types" here.
// Each key in STAGES is a stage "type" you can reference from config.js.
// Example (in config.js):
//   { type: "PlainImage", ... }
//
// NOTE: "ComboHorizFilterStage" was removed on purpose (legacy / unused).

import GalleryHorizontalScroll from "./GalleryHorizontalScroll";
import GalleryFilter from "./GalleryFilter";
import GalleryFlipImage from "./GalleryFlipImage";
import PlainText from "./PlainText";
import PlainImage from "./PlainImage";
import AreaReveal from "./AreaReveal";
import WatchArea from "./WatchArea";

export const STAGES = {
  // Horizontal image-strip scroller
  GalleryHorizontalScroll,

  // Gallery + filter UI stage
  GalleryFilter,

  // Horizontal gallery with flip-on-hover cards (mousewheel scroll)
  GalleryFlipImage,

  // Simple text block stage (no map interaction)
  PlainText,

  // Full-width (or constrained) image stage
  PlainImage,

  // One ranked area: pinned mid-screen, three-beat raster reveal
  AreaReveal,

  // One of the closing "other lands to watch" chapters: copy left, map right
  WatchArea,
};
