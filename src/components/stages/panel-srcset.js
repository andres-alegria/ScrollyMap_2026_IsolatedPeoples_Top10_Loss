/**
 * Panels are drawn at one size and published with smaller copies beside them —
 * `name_800.webp` next to `name.webp` — by make_panel_variants.py in the job
 * folder. This builds the srcset that lets the browser take the one it needs.
 *
 * The saving is much larger than the pixel count suggests. These panels are
 * Landsat composites, and most of their file size is the high-frequency noise
 * in the canopy; downscaling averages that away before the encoder ever sees
 * it, so a ranked panel goes from about 280 KB at 1200 px to 45 KB at 800 —
 * six times smaller for two-thirds the width. A phone lays these out at about
 * 351 CSS px, so even the 800 is generous on a 2x screen.
 *
 * `natural` is the width of the file `src` points at; `smaller` are the widths
 * written alongside it.
 */
export const panelSrcSet = (src, natural, smaller = [800]) => {
  if (!src) return undefined;
  const variants = smaller
    .filter((w) => w < natural)
    .map((w) => `${src.replace(/\.webp$/, `_${w}.webp`)} ${w}w`);
  return [...variants, `${src} ${natural}w`].join(', ');
};

export default panelSrcSet;
