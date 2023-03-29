let currentEndDistance = 75;

let hasShownTutorial = false;

let hasTutorialEnded = false;

export function toggleHasTutorialEnded() {
  if (hasTutorialEnded) return;
  else hasTutorialEnded = !hasTutorialEnded;
}

export function setTutorialHasEnded(value) {
  hasTutorialEnded = value;
}

export function getHasTutorialEnded() {
  return hasTutorialEnded;
}

export function toggleHasShownTutorial() {
  hasShownTutorial = !hasShownTutorial;
}

export function setHasShownTutorial(value) {
  hasShownTutorial = value;
}

export function getCurrentTutorialStatus() {
  return hasShownTutorial;
}

// Sets the current end distance in the Sandbox mode. If the value is <1, then default value is 75
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

// This function returns one less than the current end distance. This is because the array will start from 0, so the actual end distance is one less than the value in the input box
export function getModifiedCurrentEndDistance() {
  return currentEndDistance - 1;
}

export function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export { currentEndDistance, hasTutorialEnded };
