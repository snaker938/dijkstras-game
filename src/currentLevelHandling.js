import {
  allLevelGrids,
  allLevelLives,
  allLevelsAllowedWalls,
  allLevelsRandomWallPresses,
  allLevelsStars,
  allLevelNames,
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
  return allLevelsStars[currentLevel - 1];
}

export function getCurrentLevelLives() {
  return allLevelLives[currentLevel - 1];
}

export { currentLevel };
