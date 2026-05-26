let permanentWallToggled = false;

let gridOutlineToggled = true;

let hasGridBeenReset = true;

let toggleWallOnClick = false;

let showSandboxNodeNumbers = true;

let showCampaignNodeNumbers = false;

let useCampaignMissileTrailInSandbox = false;

let sandboxEndExplosionToggled = false;

let missileTrailLength = 5;

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
  const nextValue = Number.parseInt(value, 10);
  if (Number.isNaN(nextValue)) return;
  missileTrailLength = Math.min(12, Math.max(1, nextValue));
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

export function setGridOutlineToggled(value) {
  gridOutlineToggled = value;
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

export { permanentWallToggled, gridOutlineToggled };
