// This whole file will get the data for every single level that there is.

const levelModules = import.meta.glob('./levels/level*.json', { eager: true });
const levels = Object.entries(levelModules)
  .sort(([firstPath], [secondPath]) => {
    const firstLevel = Number(firstPath.match(/level(\d+)\.json$/)[1]);
    const secondLevel = Number(secondPath.match(/level(\d+)\.json$/)[1]);
    return firstLevel - secondLevel;
  })
  .map(([, module]) => module.default ?? module);

const numLevels = levels.length; // The total number of levels in the game

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
  return levels.map((level) => level.levelID);
}

// This function gets the names of every single level and stores it in an array
function getAllLevelNames() {
  return levels.map((level) => level.levelName);
}

// This function gets every number of random wall presses
function getAllLevelRandomWallPresses() {
  return levels.map((level) => level.randomWallPressesAllowed);
}

// This function gets the difficulty of every single level and stores it in an array
function getAllLevelDifficulties() {
  return levels.map((level) => level.difficulty);
}

// This function gets the description of every single level and stores it in an array
function getAllLevelDescriptions() {
  return levels.map((level) => level.description);
}

// This function gets the coords of the start and end node for each level
function getAllSpecialNodeCoords() {
  const allLevelCoords = [];
  for (const level of levels) {
    let levelSpecialNodeCoords = [];
    levelSpecialNodeCoords.push(level.startNodeCoords);
    levelSpecialNodeCoords.push(level.endNodeCoords);
    allLevelCoords.push(levelSpecialNodeCoords);
  }
  return allLevelCoords;
}

// This function gets every number of allowed walls per level
function getAllLevelAllowedWalls() {
  return levels.map((level) => level.wallsAllowed);
}

function getAllLevelEndDistances() {
  return levels.map((level) => level.endDistance);
}

// This function gets all the level grids
function getAllLevelGrids() {
  return levels.map((level) => level.grid);
}

export function getLevelData(levelNumber) {
  return levels[Number(levelNumber) - 1];
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
