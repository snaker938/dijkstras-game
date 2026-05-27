let numLevelsUnlocked;

const MAX_LEVELS_UNLOCKED = 15;
const MIN_LEVELS_UNLOCKED = 1;
const NUM_LEVELS_UNLOCKED_KEY = 'numLevelsUnlocked';
const UNLOCK_ALL_LEVELS_KEY = 'unlockAllLevels';

function clampLevelsUnlocked(value) {
  const parsedValue = Number(value);
  if (!Number.isSafeInteger(parsedValue)) return MIN_LEVELS_UNLOCKED;

  return Math.min(
    MAX_LEVELS_UNLOCKED,
    Math.max(MIN_LEVELS_UNLOCKED, parsedValue)
  );
}

function getStoredLevelsUnlocked() {
  if (localStorage.getItem(NUM_LEVELS_UNLOCKED_KEY) === null) {
    localStorage.setItem(NUM_LEVELS_UNLOCKED_KEY, MIN_LEVELS_UNLOCKED);
    return MIN_LEVELS_UNLOCKED;
  }

  const storedValue = clampLevelsUnlocked(
    localStorage.getItem(NUM_LEVELS_UNLOCKED_KEY)
  );
  localStorage.setItem(NUM_LEVELS_UNLOCKED_KEY, storedValue);
  return storedValue;
}

export function isUnlockAllLevelsToggled() {
  return localStorage.getItem(UNLOCK_ALL_LEVELS_KEY) === 'true';
}

function syncLevelsUnlocked() {
  numLevelsUnlocked = isUnlockAllLevelsToggled()
    ? MAX_LEVELS_UNLOCKED
    : getStoredLevelsUnlocked();
  return numLevelsUnlocked;
}

export function setUnlockAllLevelsToggled(value) {
  localStorage.setItem(UNLOCK_ALL_LEVELS_KEY, Boolean(value) ? 'true' : 'false');
  return syncLevelsUnlocked();
}

export function resetStoredUserData() {
  localStorage.clear();
  return syncLevelsUnlocked();
}

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
  const storedLevelsUnlocked = getStoredLevelsUnlocked();

  if (storedLevelsUnlocked < MAX_LEVELS_UNLOCKED) {
    localStorage.setItem(
      NUM_LEVELS_UNLOCKED_KEY,
      Number(storedLevelsUnlocked) + 1
    );
    syncLevelsUnlocked();
  }
}

// check if "numLevelsUnlocked" is in localStorage. If not, set it to 1. If it is, retrieve it
syncLevelsUnlocked();

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
