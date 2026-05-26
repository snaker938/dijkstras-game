export const VISUALIZER_NODE_WIDTH = 25.1;
export const VISUALIZER_NODE_HEIGHT = 25;
export const VISUALIZER_GRID_MARGIN = 24;
export const VISUALIZER_GRID_TOP_GAP = 18;
export const VISUALIZER_MIN_GRID_SCALE = 0.22;
export const VISUALIZER_MAX_GRID_SCALE = 1.55;
export const VISUALIZER_MAX_NARROW_GRID_SCALE = 0.72;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getResponsiveMargin(viewportWidth) {
  if (viewportWidth < 420) return 6;
  if (viewportWidth < 760) return 10;
  return VISUALIZER_GRID_MARGIN;
}

export function getVisualizerLayout({
  columns,
  rows,
  topbarHeight,
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight,
}) {
  const baseWidth = columns * VISUALIZER_NODE_WIDTH;
  const baseHeight = rows * VISUALIZER_NODE_HEIGHT;
  const margin = getResponsiveMargin(viewportWidth);
  const topGap = viewportHeight < 700 ? 10 : VISUALIZER_GRID_TOP_GAP;
  const availableWidth = Math.max(
    viewportWidth - margin * 2,
    baseWidth * VISUALIZER_MIN_GRID_SCALE
  );
  const availableHeight = Math.max(
    viewportHeight - topbarHeight - topGap - margin,
    baseHeight * VISUALIZER_MIN_GRID_SCALE
  );
  const widthScale = availableWidth / baseWidth;
  const heightScale = availableHeight / baseHeight;
  const maxScale =
    viewportWidth <= 760
      ? VISUALIZER_MAX_NARROW_GRID_SCALE
      : VISUALIZER_MAX_GRID_SCALE;
  const scale = clamp(
    Math.min(widthScale, heightScale, maxScale),
    VISUALIZER_MIN_GRID_SCALE,
    maxScale
  );
  const gridScale = Number(scale.toFixed(4));
  const gridWidth = Math.ceil(baseWidth * gridScale);
  const gridHeight = Math.ceil(baseHeight * gridScale);
  const gridTop = Math.ceil(topbarHeight + topGap);
  const gridLeft = Math.max(
    0,
    Math.floor((viewportWidth - gridWidth) / 2)
  );
  const nodeWidth = Number((VISUALIZER_NODE_WIDTH * gridScale).toFixed(3));
  const nodeHeight = Number((VISUALIZER_NODE_HEIGHT * gridScale).toFixed(3));
  const nodeFontSize = Math.max(7, Number((12 * gridScale).toFixed(2)));

  return {
    gridScale,
    gridTop,
    gridLeft,
    gridWidth,
    gridHeight,
    nodeWidth,
    nodeHeight,
    nodeFontSize,
  };
}

export function getPlaneTravelBounds(gridElement, planeElement) {
  if (!gridElement || !planeElement) return null;

  const gridRect = gridElement.getBoundingClientRect();
  const planeRect = planeElement.getBoundingClientRect();
  const planeWidth = planeRect.width || planeElement.offsetWidth || 350;
  const padding = Math.max(24, Math.min(72, gridRect.width * 0.04));

  return {
    startX: Math.floor(gridRect.left - planeWidth - padding),
    endX: Math.ceil(gridRect.right + padding),
  };
}
