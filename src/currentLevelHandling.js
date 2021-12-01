import {
  allLevelGrids,
  allLevelLives,
  allLevelsAllowedWalls,
  allLevelsRandomWallPresses,
  allLevelStars,
  allLevelNames,
  allLevelNodeCoords,
  allLevelIDs,
  allLevelRandomWallNumber,
} from "./allLevelData";
import { cloneVariable } from "./Visualizer/Visualizer";

let currentLevel = 1;

export function setCurrentLevel(newLevel) {
  console.log(currentLevel, newLevel);
  currentLevel = newLevel;
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

export function getCurrentLevelGrid() {
  return cloneVariable(allLevelGrids[currentLevel - 1]);
}

export function getCurrentLevelStars() {
  return cloneVariable(allLevelStars[currentLevel - 1]);
}

export function getCurrentLevelLives() {
  return cloneVariable(allLevelLives[currentLevel - 1]);
}

export function getCurrentLevelNodeCoords() {
  return cloneVariable(allLevelNodeCoords[currentLevel - 1]);
}

export function getCurrentLevelID() {
  return cloneVariable(allLevelIDs[currentLevel - 1]);
}

export function getCurrentLevelRandomWallNumber() {
  return cloneVariable(allLevelRandomWallNumber[currentLevel - 1]);
}

export function getAllCurrentLevelData() {
  return [
    getCurrentLevelID(),
    getCurrentLevelName(),
    getCurrentLevelRandomWallPresses(),
    getCurrentLevelRandomWallNumber(),
    getCurrentLevelLives(),
    getCurrentLevelNodeCoords(),
    getCurrentLevelWallsAllowed(),
    getCurrentLevelStars(),
    getCurrentLevelGrid(),
    currentLevel,
  ];
}

export { currentLevel };
