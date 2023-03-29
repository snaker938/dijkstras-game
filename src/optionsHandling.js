let permanentWallToggled = false;

let gridOutlineToggled = true;

let hasGridBeenReset = true;

let toggleWallOnClick = false;

export function getToggleWallOnClick() {
  return toggleWallOnClick;
}

export function setToggleWallOnClick(value) {
  toggleWallOnClick = value;
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
