// This whole file will get the data for every single level that there is.

const numLevels = 15; // The total number of levels in the game

const allLevelIDs = getAllLevelIDs();
const allLevelNames = getAllLevelNames();
const allLevelsRandomWallPresses = getAllLevelRandomWallPresses();
const allLevelDifficulties = getAllLevelDifficulties();
const allLevelDescriptions = getAllLevelDescriptions();
const allLevelNodeCoords = getAllSpecialNodeCoords();
const allLevelsAllowedWalls = getAllLevelAllowedWalls();
const allLevelEndDistances = getAllLevelEndDistances();
const allLevelGrids = getAllLevelGrids();

// This function gets the id of each level
function getAllLevelIDs() {
  let allLevelIDs = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    allLevelIDs.push(level.levelID);
  }
  return allLevelIDs;
}

// This function gets the names of every single level and stores it in an array
function getAllLevelNames() {
  let levelNames = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelNames.push(level.levelName);
  }
  return levelNames;
}

// This function gets every number of random wall presses
function getAllLevelRandomWallPresses() {
  let levelRandomWallPresses = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelRandomWallPresses.push(level.randomWallPressesAllowed);
  }
  return levelRandomWallPresses;
}

// This function gets the difficulty of every single level and stores it in an array
function getAllLevelDifficulties() {
  let levelDifficulties = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelDifficulties.push(level.difficulty);
  }
  return levelDifficulties;
}

// This function gets the description of every single level and stores it in an array
function getAllLevelDescriptions() {
  let levelDescriptions = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelDescriptions.push(level.description);
  }
  return levelDescriptions;
}

// This function gets the coords of the start and end node for each level
function getAllSpecialNodeCoords() {
  let allLevelCoords = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    let levelSpecialNodeCoords = [];
    levelSpecialNodeCoords.push(level.startNodeCoords);
    levelSpecialNodeCoords.push(level.endNodeCoords);
    allLevelCoords.push(levelSpecialNodeCoords);
  }
  allLevelCoords.push();
  return allLevelCoords;
}

// This function gets every number of allowed walls per level
function getAllLevelAllowedWalls() {
  let levelAllowedWalls = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelAllowedWalls.push(level.wallsAllowed);
  }
  return levelAllowedWalls;
}

function getAllLevelEndDistances() {
  let levelEndDistances = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelEndDistances.push(level.endDistance);
  }
  return levelEndDistances;
}

// This function gets all the level grids
function getAllLevelGrids() {
  let levelGrids = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelGrids.push(level.grid);
  }
  return levelGrids;
}

export function getLevelName(id) {
  return allLevelNames[id];
}

export function getLevelRandomWallPresses(id) {
  return allLevelsRandomWallPresses[id];
}

export function getLevelDifficulty(id) {
  return allLevelDifficulties[id];
}

export function getLevelDescription(id) {
  return allLevelDescriptions[id];
}

export function getLevelAllowedWalls(id) {
  return allLevelsAllowedWalls[id];
}

export function getLevelEndDistance(id) {
  return allLevelEndDistances[id];
}

// Export all the level data as global variables
export {
  numLevels,
  allLevelIDs,
  allLevelNames,
  allLevelsRandomWallPresses,
  allLevelDifficulties,
  allLevelDescriptions,
  allLevelNodeCoords,
  allLevelsAllowedWalls,
  allLevelEndDistances,
  allLevelGrids,
};
