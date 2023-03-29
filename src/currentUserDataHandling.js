let numLevelsUnlocked;

export function getUserLevelsFromLocalStorage() {
  const userLevels = [];

  // Check if 'userLevels' key exists in local storage
  if (localStorage.getItem('userLevels')) {
    // If it does, retrieve its value and save it to the 'userLevels' array
    const storedLevels = JSON.parse(localStorage.getItem('userLevels'));
    storedLevels.forEach((level) => {
      userLevels.push(level);
    });
  }

  return userLevels;
}

export function getSpecificUserLevel(id) {
  const userLevels = getUserLevelsFromLocalStorage();
  return userLevels[id];
}

export function renameUserLevel(id, newName) {
  const userLevels = getUserLevelsFromLocalStorage();

  userLevels[id][0] = newName;

  // Save the updated 'userLevels' array to local storage
  localStorage.setItem('userLevels', JSON.stringify(userLevels));
}

export function deleteUserLevel(id) {
  const userLevels = getUserLevelsFromLocalStorage();

  userLevels.splice(id, 1);

  // Save the updated 'userLevels' array to local storage
  localStorage.setItem('userLevels', JSON.stringify(userLevels));
}

export function saveUserLevels(userLevelsInput) {
  const userLevels = getUserLevelsFromLocalStorage();

  // Add the new level to the existing 'userLevels' array
  userLevels.push(userLevelsInput);

  // Save the updated 'userLevels' array to local storage
  localStorage.setItem('userLevels', JSON.stringify(userLevels));
}

// If a new level has been unlocked, increase the number of levels unlocked by 1 and change the value in the local storage
export function newLevelUnlocked() {
  if (numLevelsUnlocked < 15) {
    numLevelsUnlocked = Number(numLevelsUnlocked) + 1;
    localStorage.setItem('numLevelsUnlocked', Number(numLevelsUnlocked));
  }
}

// check if "numLevelsUnlocked" is in localStorage. If not, set it to 1. If it is, retrieve it
if (localStorage.getItem('numLevelsUnlocked') === null) {
  localStorage.setItem('numLevelsUnlocked', 1);
  numLevelsUnlocked = 1;
} else {
  numLevelsUnlocked = Number(localStorage.getItem('numLevelsUnlocked'));
  numLevelsUnlocked = 15;
}

// check if "userName" is in localStorage. If not, set it to the input. If it is, retrieve it
export function setCurrentUserName(inputtedUsername) {
  localStorage.setItem('userName', inputtedUsername);
  return localStorage.getItem('userName');
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
