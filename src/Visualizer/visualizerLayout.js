export const VISUALIZER_NODE_WIDTH = 25.1;
export const VISUALIZER_NODE_HEIGHT = 25;

export function getVisualizerLayout({
  columns,
  rows,
  topbarHeight,
  viewportWidth = window.visualViewport?.width || window.innerWidth,
  viewportHeight = window.visualViewport?.height || window.innerHeight,
}) {
  const gridTop = Math.ceil(topbarHeight);
  const gridWidth = Math.max(1, Math.floor(viewportWidth));
  const gridHeight = Math.max(1, Math.floor(viewportHeight - gridTop));
  const nodeWidth = Number((gridWidth / columns).toFixed(3));
  const nodeHeight = Number((gridHeight / rows).toFixed(3));
  const gridScale = Number((nodeWidth / VISUALIZER_NODE_WIDTH).toFixed(4));
  const nodeFontSize = Math.max(
    7,
    Number((Math.min(nodeWidth, nodeHeight) * 0.48).toFixed(2))
  );

  return {
    gridScale,
    gridTop,
    gridLeft: 0,
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
  const planeStyles = window.getComputedStyle(planeElement);
  const styledPlaneWidth = Number.parseFloat(planeStyles.width);
  const styledPlaneHeight = Number.parseFloat(planeStyles.height);
  const naturalPlaneRatio =
    planeElement.naturalWidth > 0 && planeElement.naturalHeight > 0
      ? planeElement.naturalHeight / planeElement.naturalWidth
      : 1;
  const planeWidth =
    planeRect.width ||
    planeElement.offsetWidth ||
    styledPlaneWidth ||
    350;
  const planeHeight =
    planeRect.height ||
    planeElement.offsetHeight ||
    styledPlaneHeight ||
    planeWidth * naturalPlaneRatio ||
    350;
  const padding = Math.max(24, Math.min(72, gridRect.width * 0.04));

  return {
    startX: Math.floor(gridRect.left - planeWidth - padding),
    endX: Math.ceil(gridRect.right + padding),
    centerY: Math.round(gridRect.top + gridRect.height / 2 - planeHeight / 2),
  };
}
