// This whole file will get the data for every single level that there is.

let numLevels = 3; // The total number of levels in the game
let allLevelNames = getAllLevelNames();
let allLevelGrids = getAllLevelGrids();
let allLevelsAllowedWalls = getAllLevelAllowedWalls();
let allLevelsRandomWallPresses = getAllLevelRandomWallPresses();
let allLevelsStars = getAllStars();
let allLevelLives = getAllLives();

// This function gets the names of every single level and stores it in an array
function getAllLevelNames() {
  let levelNames = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelNames.push(level.levelName);
  }
  return levelNames;
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
  let levelStars0 = [];
  let levelStars1 = [];
  let levelStars2 = [];
  let levelStars3 = [];

  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelStars0.push(level.wallsForNoStar);
    levelStars1.push(level.wallsForOneStar);
    levelStars2.push(level.wallsForTwoStar);
    levelStars3.push(level.wallsForThreeStar);
  }
  allLevelStars.push(levelStars0, levelStars1, levelStars2, levelStars3);
  return allLevelStars;
}

function getAllLives() {
  let levelAllLives = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./levels/level${i}`);
    levelAllLives.push(level.lives);
  }
  return levelAllLives;
}

// Export all the level data as global variables
export {
  numLevels,
  allLevelNames,
  allLevelGrids,
  allLevelsAllowedWalls,
  allLevelsRandomWallPresses,
  allLevelsStars,
  allLevelLives,
};
