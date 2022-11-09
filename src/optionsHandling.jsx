let permanentWallToggled = false;

let gridOutlineToggled = false;

let showingOptionsMenu = false;

export function toggleShowingOptionsMenu() {
  showingOptionsMenu = !showingOptionsMenu;
}

export function togglePermanentWall() {
  permanentWallToggled = !permanentWallToggled;
}

export function toggleGridOutline() {
  gridOutlineToggled = !gridOutlineToggled;
}

export { permanentWallToggled, gridOutlineToggled, showingOptionsMenu };
