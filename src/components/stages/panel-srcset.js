/**
 * Panels are drawn at one size and published with smaller copies beside them —
 * `name_800.webp` next to `name.webp` — by make_panel_variants.py in the job
 * folder. This builds the srcset that lets the browser take the one it needs.
 *
 * The saving runs a little ahead of the pixel count. These panels are Landsat
 * composites, and much of their file size is the high-frequency noise in the
 * canopy; downscaling averages some of that away before the encoder sees it.
 * Across the twenty ranked panels the 800 px set is 2.67 MB against 5.60 — 52%
 * off, and close to that for every one of them, from the 507 KB Araribóia
 * panel down to the 58 KB Yabarana one. A phone lays these out at about
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
