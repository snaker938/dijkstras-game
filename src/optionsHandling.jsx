let permanentWallToggled = false;

let gridOutlineToggled = false;

export function togglePermanentWall() {
  permanentWallToggled = !permanentWallToggled;
}

export function toggleGridOutline() {
  gridOutlineToggled = !gridOutlineToggled;
}

export { permanentWallToggled, gridOutlineToggled };
