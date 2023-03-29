import {
  allLevelIDs,
  allLevelNames,
  allLevelsAllowedWalls,
  allLevelsRandomWallPresses,
  allLevelNodeCoords,
  allLevelEndDistances,
  allLevelGrids,
} from './allLevelData';

import { cloneVariable } from './Visualizer/Visualizer';

let currentLevel = 1;

// Set the current level
export function setCurrentLevel(newLevel) {
  currentLevel = Number(cloneVariable(newLevel));
}

// Returns up-to-date current level
export function getCurrentLevel() {
  return currentLevel;
}

export function getCurrentLevelID() {
  return cloneVariable(allLevelIDs[currentLevel - 1]);
}

export function getCurrentLevelName() {
  return cloneVariable(allLevelNames[currentLevel - 1]);
}

export function getCurrentLevelWallsAllowed() {
  return cloneVariable(allLevelsAllowedWalls[currentLevel - 1]);
}

export function getCurrentLevelRandomWallPresses() {
  return cloneVariable(allLevelsRandomWallPresses[currentLevel - 1]);
}

// Returns [[start col, start row], [end col, end row]] in that order
export function getCurrentLevelNodeCoords() {
  return cloneVariable(allLevelNodeCoords[currentLevel - 1]);
}

export function getCurrentLevelEndNodeCoords() {
  return [getCurrentLevelNodeCoords()[1][1], getCurrentLevelNodeCoords()[1][0]];
}

export function getCurrentLevelEndDistance() {
  return cloneVariable(allLevelEndDistances[currentLevel - 1]);
}

export function getCurrentLevelGrid() {
  return cloneVariable(allLevelGrids[currentLevel - 1]);
}

export { currentLevel };
