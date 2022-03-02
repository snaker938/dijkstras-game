// This whole file will get the data for every single level that there is.

const numLevels = 15; // The total number of levels in the game
const allLevelNames = getAllLevelNames();
const allLevelGrids = getAllLevelGrids();
const allLevelsAllowedWalls = getAllLevelAllowedWalls();
const allLevelsRandomWallPresses = getAllLevelRandomWallPresses();
const allLevelStars = getAllStars();
const allLevelLives = getAllLives();
const allLevelNodeCoords = getAllSpecialNodeCoords();
const allLevelIDs = getAllLevelIDs();
const allLevelRandomWallNumber = getAllLevelRandomWallNumber();
const allLevelDifficulties = getAllLevelDifficulties();
const allLevelDescriptions = getAllLevelDescriptions();

// This function gets the names of every single level and stores it in an array
function getAllLevelNames() {
  let levelNames = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelNames.push(level.levelName);
  }
  return levelNames;
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

// This function gets all the level grids
function getAllLevelGrids() {
  let levelGrids = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelGrids.push(level.grid);
  }
  return levelGrids;
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

// This function gets every number of random wall presses
function getAllLevelRandomWallPresses() {
  let levelRandomWallPresses = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelRandomWallPresses.push(level.randomWallPressesAllowed);
  }
  return levelRandomWallPresses;
}

// This function gets the number of walls for each star for each level
function getAllStars() {
  let allLevelStars = [];

  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    let levelStars = [];
    levelStars.push(level.wallsForNoStar);
    levelStars.push(level.wallsForOneStar);
    levelStars.push(level.wallsForTwoStar);
    levelStars.push(level.wallsForThreeStar);
    allLevelStars.push(levelStars);
  }
  return allLevelStars;
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

// This function gets the number of lives allowed for each level
function getAllLives() {
  let levelAllLives = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelAllLives.push(level.lives);
  }
  return levelAllLives;
}

// This function gets the id of each level
function getAllLevelIDs() {
  let allLevelIDs = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    allLevelIDs.push(level.levelID);
  }
  return allLevelIDs;
}

// This function gets the number of walls randomWalls should place
function getAllLevelRandomWallNumber() {
  let allLevelRandomWallNumber = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    allLevelRandomWallNumber.push(level.randomWallNumber);
  }
  return allLevelRandomWallNumber;
}

export function getLevelName(id) {
  return allLevelNames[id];
}

export function getLevelAllowedWalls(id) {
  return allLevelsAllowedWalls[id];
}

export function getLevelRandomWallPresses(id) {
  return allLevelsRandomWallPresses[id];
}

export function getLevelRandomWallNumber(id) {
  return allLevelRandomWallNumber[id];
}

export function getLevelStars(id) {
  return allLevelStars[id];
}

export function getLevelLives(id) {
  return allLevelLives[id];
}

export function getLevelDifficulty(id) {
  return allLevelDifficulties[id];
}

export function getLevelDescription(id) {
  return allLevelDescriptions[id];
}

// Export all the level data as global variables
export {
  numLevels,
  allLevelNames,
  allLevelGrids,
  allLevelsAllowedWalls,
  allLevelsRandomWallPresses,
  allLevelStars,
  allLevelLives,
  allLevelNodeCoords,
  allLevelIDs,
  allLevelRandomWallNumber,
  allLevelDescriptions,
  allLevelDifficulties,
};
