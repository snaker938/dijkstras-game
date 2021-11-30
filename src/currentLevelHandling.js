import {
  allLevelGrids,
  allLevelLives,
  allLevelsAllowedWalls,
  allLevelsRandomWallPresses,
  allLevelStars,
  allLevelNames,
  allLevelNodeCoords,
  allLevelIDs,
} from "./allLevelData";

let currentLevel = 1;

export function setCurrentLevel(newLevel) {
  currentLevel = newLevel;
}

export function getCurrentLevelName() {
  return allLevelNames[currentLevel - 1];
}

export function getCurrentLevelWallsAllowed() {
  return allLevelsAllowedWalls[currentLevel - 1];
}

export function getCurrentLevelRandomWallPresses() {
  return allLevelsRandomWallPresses[currentLevel - 1];
}

export function getCurrentLevelGrid() {
  return allLevelGrids[currentLevel - 1];
}

export function getCurrentLevelStars() {
  return allLevelStars[currentLevel - 1];
}

export function getCurrentLevelLives() {
  return allLevelLives[currentLevel - 1];
}

export function getCurrentLevelNodeCoords() {
  return allLevelNodeCoords[currentLevel - 1];
}

export function getCurrentLevelID() {
  return allLevelIDs[currentLevel - 1];
}

export function getAllCurrentLevelData() {
  return [
    getCurrentLevelID(),
    getCurrentLevelName(),
    getCurrentLevelRandomWallPresses(),
    getCurrentLevelLives(),
    getCurrentLevelNodeCoords(),
    getCurrentLevelWallsAllowed(),
    getCurrentLevelStars(),
    getCurrentLevelGrid(),
  ];
}

// export function getAllCurrentLevelData() {
//   return [
//     getCurrentLevelID(),
//     getCurrentLevelName(),
//     getCurrentLevelRandomWallPresses(),
//     getCurrentLevelLives(),
//     getCurrentLevelNodeCoords(),
//     getCurrentLevelWallsAllowed(),
//     getCurrentLevelStars(),
//     getCurrentLevelGrid(),
//   ];
// }

export { currentLevel };
