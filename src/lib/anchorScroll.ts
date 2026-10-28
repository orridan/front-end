/**
 * Sections below the fold use content-visibility: auto, so their heights are estimates until
 * rendered. Before a programmatic jump to an anchor, render every section for real so the target
 * position is exact.
 *
 * The class stays on afterwards. Removing it would let browsers that did not record the real
 * sizes (Firefox, for content rendered as `visible`) fall back to the estimate and shift the page
 * under the reader. Natural scrolling without anchor jumps keeps the content-visibility savings.
 */
export function prepareAnchorScroll(): Promise<void> {
  const html = document.documentElement;
  if (html.classList.contains('cv-off')) return Promise.resolve();
  html.classList.add('cv-off');
  // Two frames: one to lay out, one to settle before measuring the target.
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}
