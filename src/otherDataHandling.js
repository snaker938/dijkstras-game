let currentEndDistance = 75;

export function setCurrentEndDistance(newEndDistance) {
  document.getElementById('endDistanceInput').value = currentEndDistance;
  if (!(newEndDistance >= 1)) {
    currentEndDistance = 75;
  } else {
    console.log('Setting current end distance to: ', newEndDistance);
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
