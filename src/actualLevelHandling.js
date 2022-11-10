
let displayOutlineValue = false;

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
