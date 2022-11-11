let displayOutlineValue = false;

let isPlaneAnimationShowing = false;

let hasShownTutorial = false;

let hasTutorialEnded = false;

export function toggleHasTutorialEnded() {
  hasTutorialEnded = !hasTutorialEnded;
  console.log('Tutorial Ended: ', hasTutorialEnded);
}

export function getHasTutorialEnded() {
  return hasTutorialEnded;
}

let currentEndDistance = 75;

export function toggleHasShownTutorial() {
  hasShownTutorial = !hasShownTutorial;
}

export function getCurrentTutorialStatus() {
  return hasShownTutorial;
}

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

export function setCurrentEndDistance(newEndDistance) {
  document.getElementById('endDistanceInput').value = currentEndDistance;
  if (!(newEndDistance >= 1)) {
    currentEndDistance = 75;
  } else {
    currentEndDistance = newEndDistance;
    document.getElementById('endDistanceInput').value = currentEndDistance;
  }
}

export function getActualCurrentEndDistance() {
  return currentEndDistance;
}

export function getModifiedCurrentEndDistance() {
  return currentEndDistance - 1;
}

export function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export { displayOutlineValue, currentEndDistance, hasTutorialEnded };
