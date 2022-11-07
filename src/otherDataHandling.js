let currentEndDistance = 75;

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

export { currentEndDistance };
