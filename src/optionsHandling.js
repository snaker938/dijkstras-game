let permanentWallToggled = false;

let gridOutlineToggled = true;

let hasGridBeenReset = true;

let toggleWallOnClick = false;

let showSandboxNodeNumbers = false;

let showCampaignNodeNumbers = false;

let useCampaignMissileTrailInSandbox = false;

let sandboxEndExplosionToggled = false;

let missileTrailLength = 5;

let animationSpeedMultiplier = 1;

let visualizerPaused = false;

let soundMuted = false;

let showSandboxWallUsage = false;

let sandboxWallLimit = 0;

export const DEFAULT_GRID_PALETTE = 'classic';

export const GRID_PALETTE_STORAGE_KEY = 'gridPalette';

function defineGridPalette({ id, label, className, cssVariables }) {
  return Object.freeze({
    id,
    label,
    className,
    cssVariables: Object.freeze(cssVariables),
  });
}

const GRID_PALETTE_DEFINITIONS = Object.freeze({
  classic: defineGridPalette({
    id: 'classic',
    label: 'Classic',
    className: 'grid-palette-classic',
    cssVariables: {
      '--grid-background':
        'linear-gradient(90deg, rgba(101, 97, 97, 1) 0%, rgba(82, 77, 77, 1) 50%, rgb(103, 97, 97) 75%, rgb(84, 81, 81) 100%)',
      '--node-end-color': 'red',
      '--node-start-color': 'green',
      '--node-wall-color': 'rgb(0, 0, 0)',
      '--node-permanent-wall-color': 'rgb(57, 55, 55)',
      '--node-random-wall-color': 'rgb(72, 68, 68)',
      '--node-random-wall-outline': 'rgba(255, 214, 102, 0.72)',
      '--node-unwallable-color': 'rgb(79, 51, 51)',
      '--node-solver-wall-color': 'rgba(58, 188, 255, 0.48)',
      '--node-solver-wall-outline': 'rgba(255, 255, 255, 0.62)',
      '--node-missile-head-color': 'orangered',
      '--node-exploded-a': 'rgb(255, 0, 0)',
      '--node-exploded-b': 'rgb(255, 255, 0)',
      '--node-exploded-c': 'rgb(0, 0, 255)',
      '--node-exploded-d': 'rgb(0, 255, 0)',
      '--node-visited-a': 'red',
      '--node-visited-b': 'yellow',
      '--node-visited-c': 'blue',
      '--node-visited-d': 'green',
      '--node-visited-static-color': 'rgb(175, 52, 30)',
      '--node-visited-outer-color': 'rgb(45, 212, 191)',
      '--node-visited-outer-flash': 'rgb(165, 243, 252)',
      '--node-visited-outer-glow': 'rgba(125, 249, 255, 0.45)',
      '--node-visited-outermost-color': 'rgb(56, 189, 248)',
      '--node-visited-outermost-flash': 'rgb(224, 242, 254)',
      '--node-visited-outermost-glow': 'rgba(125, 211, 252, 0.5)',
      '--node-shortest-a': 'rgb(190, 187, 238)',
      '--node-shortest-b': 'rgb(30, 172, 177)',
      '--node-shortest-c': 'rgb(15, 204, 9)',
      '--node-toggle-active-color': 'rgb(38, 115, 148)',
      '--node-ended-head-color': 'rgb(38, 115, 148)',
      '--node-ended-body-color': 'rgb(175, 216, 248)',
      '--node-error-important-color': 'rgb(128, 11, 11)',
    },
  }),
  radar: defineGridPalette({
    id: 'radar',
    label: 'Radar',
    className: 'grid-palette-radar',
    cssVariables: {
      '--grid-background':
        'linear-gradient(90deg, rgb(17, 42, 42) 0%, rgb(22, 66, 57) 46%, rgb(12, 32, 36) 100%)',
      '--node-end-color': '#ff3b58',
      '--node-start-color': '#26ff8f',
      '--node-wall-color': '#06120d',
      '--node-permanent-wall-color': '#15241b',
      '--node-random-wall-color': '#203528',
      '--node-random-wall-outline': 'rgba(215, 255, 55, 0.68)',
      '--node-unwallable-color': '#2a1d1f',
      '--node-solver-wall-color': 'rgba(62, 255, 185, 0.36)',
      '--node-solver-wall-outline': 'rgba(204, 255, 232, 0.75)',
      '--node-missile-head-color': '#d7ff37',
      '--node-exploded-a': '#ff2950',
      '--node-exploded-b': '#d7ff37',
      '--node-exploded-c': '#32f6ff',
      '--node-exploded-d': '#26ff8f',
      '--node-visited-a': '#073b2d',
      '--node-visited-b': '#0f6f52',
      '--node-visited-c': '#19b87d',
      '--node-visited-d': '#8dffcb',
      '--node-visited-static-color': '#1b8f68',
      '--node-visited-outer-color': '#32f6ff',
      '--node-visited-outer-flash': '#c8fffa',
      '--node-visited-outer-glow': 'rgba(50, 246, 255, 0.42)',
      '--node-visited-outermost-color': '#7dd3fc',
      '--node-visited-outermost-flash': '#e0f7ff',
      '--node-visited-outermost-glow': 'rgba(125, 211, 252, 0.55)',
      '--node-shortest-a': '#c8ffe5',
      '--node-shortest-b': '#63ffc8',
      '--node-shortest-c': '#0ee88a',
      '--node-toggle-active-color': '#1fcf8a',
      '--node-ended-head-color': '#d7ff37',
      '--node-ended-body-color': '#75e3b5',
      '--node-error-important-color': '#ff2950',
    },
  }),
  ember: defineGridPalette({
    id: 'ember',
    label: 'Ember',
    className: 'grid-palette-ember',
    cssVariables: {
      '--grid-background':
        'linear-gradient(90deg, rgb(54, 43, 46) 0%, rgb(85, 59, 55) 45%, rgb(43, 45, 59) 100%)',
      '--node-end-color': '#ff342e',
      '--node-start-color': '#ffd166',
      '--node-wall-color': '#1a100b',
      '--node-permanent-wall-color': '#3b2618',
      '--node-random-wall-color': '#4a2f1d',
      '--node-random-wall-outline': 'rgba(255, 204, 51, 0.72)',
      '--node-unwallable-color': '#4a1e16',
      '--node-solver-wall-color': 'rgba(255, 182, 71, 0.42)',
      '--node-solver-wall-outline': 'rgba(255, 233, 190, 0.68)',
      '--node-missile-head-color': '#ffcc33',
      '--node-exploded-a': '#ff2200',
      '--node-exploded-b': '#ffaa00',
      '--node-exploded-c': '#ff5c00',
      '--node-exploded-d': '#f9f871',
      '--node-visited-a': '#420d0b',
      '--node-visited-b': '#b42e16',
      '--node-visited-c': '#ef6c1e',
      '--node-visited-d': '#ffc857',
      '--node-visited-static-color': '#c44d23',
      '--node-visited-outer-color': '#38bdf8',
      '--node-visited-outer-flash': '#bae6fd',
      '--node-visited-outer-glow': 'rgba(56, 189, 248, 0.44)',
      '--node-visited-outermost-color': '#818cf8',
      '--node-visited-outermost-flash': '#e0e7ff',
      '--node-visited-outermost-glow': 'rgba(129, 140, 248, 0.52)',
      '--node-shortest-a': '#ffe29a',
      '--node-shortest-b': '#ff9f1c',
      '--node-shortest-c': '#ff4d00',
      '--node-toggle-active-color': '#d97706',
      '--node-ended-head-color': '#ffb703',
      '--node-ended-body-color': '#ffc857',
      '--node-error-important-color': '#7f1d1d',
    },
  }),
});

const GRID_PALETTES = Object.freeze(Object.keys(GRID_PALETTE_DEFINITIONS));

function hasLocalStorage() {
  return typeof localStorage !== 'undefined';
}

function getDefaultGridPaletteTarget() {
  if (typeof document === 'undefined') return null;
  return document.documentElement;
}

function normalizeGridPalette(value) {
  return isGridPalette(value) ? value : DEFAULT_GRID_PALETTE;
}

export function isGridPalette(value) {
  return GRID_PALETTES.includes(value);
}

export function readGridPalettePreference() {
  if (!hasLocalStorage()) return DEFAULT_GRID_PALETTE;

  try {
    const storedPalette = localStorage.getItem(GRID_PALETTE_STORAGE_KEY);
    return normalizeGridPalette(storedPalette);
  } catch (error) {
    return DEFAULT_GRID_PALETTE;
  }
}

function persistGridPalettePreference(value) {
  if (!hasLocalStorage()) return true;

  try {
    localStorage.setItem(GRID_PALETTE_STORAGE_KEY, value);
    return true;
  } catch (error) {
    return false;
  }
}

let gridPalette = readGridPalettePreference();

export function writeGridPalettePreference(value) {
  if (!isGridPalette(value)) return false;

  gridPalette = value;
  const didPersist = persistGridPalettePreference(value);
  applyGridPalette(value);
  return didPersist;
}

export function getToggleWallOnClick() {
  return toggleWallOnClick;
}

export function setToggleWallOnClick(value) {
  toggleWallOnClick = value;
}

export function getShowSandboxNodeNumbers() {
  return showSandboxNodeNumbers;
}

export function setShowSandboxNodeNumbers(value) {
  showSandboxNodeNumbers = value;
}

export function getShowCampaignNodeNumbers() {
  return showCampaignNodeNumbers;
}

export function setShowCampaignNodeNumbers(value) {
  showCampaignNodeNumbers = value;
}

export function shouldShowNodeNumbers(isSandbox) {
  return isSandbox ? showSandboxNodeNumbers : showCampaignNodeNumbers;
}

export function getUseCampaignMissileTrailInSandbox() {
  return useCampaignMissileTrailInSandbox;
}

export function setUseCampaignMissileTrailInSandbox(value) {
  useCampaignMissileTrailInSandbox = value;
}

export function getSandboxEndExplosionToggled() {
  return sandboxEndExplosionToggled;
}

export function setSandboxEndExplosionToggled(value) {
  sandboxEndExplosionToggled = value;
}

export function getMissileTrailLength() {
  return missileTrailLength;
}

export function setMissileTrailLength(value) {
  const stringValue = String(value).trim();
  if (!/^\d+$/.test(stringValue)) return;
  const nextValue = Number(stringValue);
  if (!Number.isSafeInteger(nextValue)) return;
  missileTrailLength = Math.min(12, Math.max(1, nextValue));
}

export function getAnimationSpeedMultiplier() {
  return animationSpeedMultiplier;
}

export function setAnimationSpeedMultiplier(value) {
  const nextValue = Number.parseFloat(value);
  if (Number.isNaN(nextValue)) return;
  animationSpeedMultiplier = Math.min(3, Math.max(0.25, nextValue));
}

export function getVisualizerPaused() {
  return visualizerPaused;
}

export function setVisualizerPaused(value) {
  visualizerPaused = Boolean(value);
}

export function getSoundMuted() {
  return soundMuted;
}

export function setSoundMuted(value) {
  soundMuted = Boolean(value);
}

export function getGridPalette() {
  return gridPalette;
}

export function setGridPalette(value) {
  return writeGridPalettePreference(value);
}

export function getGridPalettes() {
  return [...GRID_PALETTES];
}

export function getGridPaletteOptions() {
  return GRID_PALETTES.map((palette) => {
    const { id, label, className } = GRID_PALETTE_DEFINITIONS[palette];
    return { id, label, className };
  });
}

export function getGridPaletteClassName(value = gridPalette) {
  const palette = GRID_PALETTE_DEFINITIONS[normalizeGridPalette(value)];
  return palette.className;
}

export function getGridPaletteCssVariables(value = gridPalette) {
  const palette = GRID_PALETTE_DEFINITIONS[normalizeGridPalette(value)];
  return { ...palette.cssVariables };
}

export function getShowSandboxWallUsage() {
  return showSandboxWallUsage;
}

export function setShowSandboxWallUsage(value) {
  showSandboxWallUsage = Boolean(value);
}

export function getSandboxWallLimit() {
  return sandboxWallLimit;
}

export function setSandboxWallLimit(value, maxValue = Infinity, minValue = 0) {
  const stringValue = String(value).trim();
  if (!/^\d+$/.test(stringValue)) return;
  const nextValue = Number(stringValue);
  if (!Number.isSafeInteger(nextValue)) return;
  const maxLimit = Number.isFinite(maxValue) ? maxValue : nextValue;
  const minLimit = Number.isFinite(minValue) ? Math.max(0, minValue) : 0;
  sandboxWallLimit = Math.min(maxLimit, Math.max(minLimit, nextValue));
}

export function applyGridPalette(
  value = gridPalette,
  target = getDefaultGridPaletteTarget()
) {
  if (!target || !isGridPalette(value)) return false;
  if (!target.style || typeof target.style.setProperty !== 'function')
    return false;

  const cssVariables = getGridPaletteCssVariables(value);
  Object.entries(cssVariables).forEach(([property, color]) => {
    target.style.setProperty(property, color);
  });

  if (target.classList) {
    GRID_PALETTES.forEach((palette) => {
      target.classList.remove(getGridPaletteClassName(palette));
    });
    target.classList.add(getGridPaletteClassName(value));
  }

  if (target.dataset) target.dataset.gridPalette = value;

  return true;
}

export function getHasGridBeenReset() {
  return hasGridBeenReset;
}

export function setHasGridBeenReset(value) {
  hasGridBeenReset = value;
}

export function togglePermanentWall() {
  permanentWallToggled = !permanentWallToggled;
}

export function isPermanentWallToggled() {
  return permanentWallToggled;
}

export function setPermanentWallToggled(value) {
  permanentWallToggled = Boolean(value);
}

export function setGridOutlineToggled(value) {
  gridOutlineToggled = Boolean(value);
}

export function isGridOutlineToggled() {
  return gridOutlineToggled;
}

export function getCurrentDisplayOutlineClass() {
  if (gridOutlineToggled) {
    return 'nodeOutline';
  }
  return 'nodeNoOutline';
}

export function getDisplayOutlineClass(displayOutline) {
  if (displayOutline) {
    return 'nodeOutline';
  }
  return 'nodeNoOutline';
}

function resetSharedVisualizerOptions() {
  permanentWallToggled = false;
  gridOutlineToggled = true;
  hasGridBeenReset = true;
  toggleWallOnClick = false;
  missileTrailLength = 5;
  animationSpeedMultiplier = 1;
  visualizerPaused = false;
  soundMuted = false;
  setGridPalette(DEFAULT_GRID_PALETTE);
}

export function resetSandboxOptions() {
  resetSharedVisualizerOptions();
  showSandboxNodeNumbers = false;
  useCampaignMissileTrailInSandbox = false;
  sandboxEndExplosionToggled = false;
  showSandboxWallUsage = false;
  sandboxWallLimit = 0;
}

export function resetCampaignOptions() {
  resetSharedVisualizerOptions();
  showCampaignNodeNumbers = false;
  showSandboxWallUsage = false;
  sandboxWallLimit = 0;
  useCampaignMissileTrailInSandbox = false;
  sandboxEndExplosionToggled = false;
}

applyGridPalette();

export { permanentWallToggled, gridOutlineToggled };
