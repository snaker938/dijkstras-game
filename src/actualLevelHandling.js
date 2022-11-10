let displayOutlineValue = false;

let isPlaneAnimationShowing = false;

export function togglePlaneAnimation() {
  isPlaneAnimationShowing = !isPlaneAnimationShowing;
}

export function getCurrentPlaneAnimation() {
  return isPlaneAnimationShowing;
}

export function setDisplayOutlineValue(value) {
  displayOutlineValue = value;
}

export function getCurrentDisplayOutlineClass() {
  if (displayOutlineValue) {
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

export { displayOutlineValue };

export function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
