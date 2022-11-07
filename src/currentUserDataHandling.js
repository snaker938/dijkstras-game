// document.cookie = [NUM_COLUMNS, NUM_ROWS];
// let x = document.cookie;
// console.log(document.cookie.split(",")[1]);
// console.log(document.cookie);

let numLevelsUnlocked = 1;

// check if "numLevelsUnlocked" is in localStorage. If not, set it to 1. If it is, get it.
if (localStorage.getItem('numLevelsUnlocked') === null) {
  localStorage.setItem('numLevelsUnlocked', 1);
} else {
  numLevelsUnlocked = localStorage.getItem('numLevelsUnlocked');
  numLevelsUnlocked = 7;
}

// check if "userName" is in localStorage. If not, set it to the input. If it is, get it.
export function setCurrentUserName(inputtedUsername) {
  if (localStorage.getItem('userName') === null) {
    localStorage.setItem('userName', inputtedUsername);
    return inputtedUsername;
  } else {
    localStorage.setItem('userName', inputtedUsername);
    return localStorage.getItem('userName');
  }
}

// get the current user's name from localStorage and return it.
export function getCurrentUserName() {
  if (localStorage.getItem('userName') === null) {
    return '';
  } else {
    return localStorage.getItem('userName');
  }
}

export { numLevelsUnlocked };
