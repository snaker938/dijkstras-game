const DEFAULT_MAX_SOLUTIONS = Number.POSITIVE_INFINITY;
const DEFAULT_MAX_STATES = null;
const DEFAULT_MAX_COMBINATIONS = null;
const DEFAULT_MAX_TIME_MS = 750;
const DEFAULT_CANDIDATE_LIMIT = 192;
const DEFAULT_COMBINATION_WARNING_LIMIT = 1000000;
const FLOW_INFINITY = 1000000;
// Verified static campaign layouts use these seeds before the general solver.
const CAMPAIGN_SOLVER_SEEDS = {
  '26:51:0-0:25-50:10:160:1fsl1uj': [
    '1-0',
    '3-7',
    '8-0',
    '11-19',
    '11-44',
    '11-46',
    '13-23',
    '14-3',
    '14-29',
    '15-50',
  ],
  '26:51:25-0:25-48:10:95:1mhmubm': [
    '3-15',
    '6-20',
    '7-21',
    '8-22',
    '9-23',
    '10-24',
    '14-24',
    '18-24',
    '22-24',
  ],
  '26:51:0-0:25-50:10:154:1meuilx': [
    '0-32',
    '1-9',
    '6-34',
    '9-30',
    '10-10',
    '11-27',
    '17-41',
    '18-46',
    '20-16',
    '20-23',
  ],
  '26:51:0-0:25-50:10:112:yc887a': [
    '0-4',
    '9-5',
    '10-42',
    '11-38',
    '12-5',
    '12-20',
    '15-41',
    '19-40',
    '21-13',
    '24-39',
  ],
  '26:51:0-0:25-50:10:138:1y0hj6m': [
    '0-25',
    '8-41',
    '10-25',
    '10-41',
    '11-41',
    '12-38',
    '13-25',
    '13-37',
    '16-25',
    '25-37',
  ],
  '26:51:0-0:25-50:10:108:ohsshl': [
    '0-21',
    '2-19',
    '5-15',
    '6-45',
    '11-14',
    '13-14',
    '18-15',
    '19-42',
    '20-42',
    '21-42',
  ],
  '26:51:0-0:25-50:10:108:znorgj': [
    '0-12',
    '1-12',
    '4-12',
    '11-12',
    '11-38',
    '16-12',
    '16-38',
    '21-38',
    '24-38',
    '25-38',
  ],
  '26:51:7-7:18-43:10:92:16r9v4u': [
    '3-16',
    '8-14',
    '8-34',
    '9-6',
    '17-44',
    '18-15',
    '18-36',
    '19-16',
    '20-38',
    '22-38',
  ],
  '26:51:0-0:25-50:10:88:g38ajy': [
    '5-45',
    '8-42',
    '11-39',
    '12-35',
    '15-32',
    '20-30',
    '21-31',
  ],
  '26:51:0-0:25-50:10:114:1pocaid': [
    '1-25',
    '8-27',
    '11-25',
    '14-25',
    '17-27',
    '17-33',
    '18-32',
    '24-23',
    '24-27',
    '25-34',
  ],
  '26:51:0-0:25-50:42:258:1wla204': [
    '0-3',
    '0-35',
    '1-0',
    '1-36',
    '2-12',
    '3-18',
    '3-39',
    '4-17',
    '4-19',
    '4-21',
    '5-20',
    '5-33',
    '6-6',
    '6-21',
    '6-26',
    '6-44',
    '7-34',
    '8-35',
    '10-0',
    '11-3',
    '11-42',
    '12-23',
    '12-48',
    '13-1',
    '13-49',
    '14-6',
    '15-7',
    '16-6',
    '16-49',
    '17-7',
    '19-5',
    '19-18',
    '19-24',
    '19-32',
    '19-45',
    '20-6',
    '20-45',
    '22-26',
    '23-12',
    '24-38',
    '24-50',
    '25-45',
  ],
  '26:51:0-0:25-50:47:182:pp2oxh': [
    '1-3',
    '1-17',
    '1-26',
    '2-18',
    '2-19',
    '3-3',
    '3-11',
    '3-17',
    '4-13',
    '4-14',
    '5-12',
    '6-23',
    '6-28',
    '6-38',
    '7-26',
    '7-27',
    '10-27',
    '10-37',
    '11-17',
    '12-5',
    '12-19',
    '13-9',
    '13-19',
    '13-45',
    '14-16',
    '14-18',
    '14-21',
    '14-23',
    '15-18',
    '15-22',
    '17-26',
    '18-22',
    '19-22',
    '19-26',
    '19-37',
    '20-12',
    '20-36',
    '20-38',
    '21-8',
    '21-10',
    '22-7',
    '22-9',
    '22-11',
    '22-12',
    '22-28',
    '24-24',
    '25-5',
  ],
  '26:51:0-0:25-50:21:112:odr9h3': [
    '5-34',
    '6-26',
    '7-25',
    '8-26',
    '10-42',
    '11-18',
    '11-42',
    '12-36',
    '12-43',
    '13-42',
    '17-42',
    '19-17',
    '19-38',
    '20-43',
    '21-13',
    '21-20',
    '21-25',
    '21-28',
    '21-42',
    '22-24',
    '22-28',
  ],
  '26:51:0-0:25-50:10:84:1cbdwbf': [
    '1-13',
    '4-13',
    '5-12',
    '8-15',
    '11-15',
    '14-12',
    '17-9',
    '20-6',
    '23-5',
  ],
};

function getNow() {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }

  return Date.now();
}

function toNonNegativeInteger(value, fallback = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) return fallback;

  return Math.max(0, Math.floor(number));
}

function toPositiveInteger(value, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) return fallback;

  return Math.floor(number);
}

function toOptionalPositiveInteger(value, fallback) {
  if (value === null || value === undefined || value === false) return null;

  return toPositiveInteger(value, fallback);
}

export function getSandboxNodeKey(node, col) {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return `${node}-${col}`;

  return `${node.row}-${node.col}`;
}

export function parseSandboxNodeKey(key) {
  const [row, col] = String(key).split('-').map(Number);
  return { row, col };
}

function compareNodeKeys(firstKey, secondKey) {
  const first = parseSandboxNodeKey(firstKey);
  const second = parseSandboxNodeKey(secondKey);

  if (first.row !== second.row) return first.row - second.row;

  return first.col - second.col;
}

function hashText(text) {
  let hash = 2166136261;

  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  return hash.toString(36);
}

function normaliseCoordinate(node) {
  if (!node) return null;

  if (Array.isArray(node)) {
    return {
      row: Number(node[0]),
      col: Number(node[1]),
    };
  }

  return {
    row: Number(node.row),
    col: Number(node.col),
  };
}

function isCoordinateInBounds(node, rows, columns) {
  return (
    node &&
    Number.isInteger(node.row) &&
    Number.isInteger(node.col) &&
    node.row >= 0 &&
    node.row < rows &&
    node.col >= 0 &&
    node.col < columns
  );
}

function isGridLike(value) {
  return Array.isArray(value) && Array.isArray(value[0]);
}

function forEachProvidedNode(nodes, callback) {
  if (!nodes) return;

  if (isGridLike(nodes)) {
    nodes.forEach((row) => {
      row.forEach((node) => callback(node));
    });
    return;
  }

  if (Array.isArray(nodes)) {
    nodes.forEach((node) => callback(node));
  }
}

function inferDimensions({ grid, nodes, rows, columns }) {
  if (Number.isFinite(Number(rows)) && Number.isFinite(Number(columns))) {
    return {
      rows: Math.max(0, Math.floor(Number(rows))),
      columns: Math.max(0, Math.floor(Number(columns))),
    };
  }

  if (isGridLike(grid)) {
    return {
      rows: grid.length,
      columns: grid[0]?.length || 0,
    };
  }

  let maxRow = -1;
  let maxCol = -1;

  forEachProvidedNode(nodes, (node) => {
    const coordinate = normaliseCoordinate(node);
    if (!coordinate) return;
    maxRow = Math.max(maxRow, coordinate.row);
    maxCol = Math.max(maxCol, coordinate.col);
  });

  return {
    rows: maxRow + 1,
    columns: maxCol + 1,
  };
}

function findMarkedNode(nodes, marker) {
  let found = null;

  forEachProvidedNode(nodes, (node) => {
    if (!found && node?.[marker]) found = normaliseCoordinate(node);
  });

  return found;
}

function addPermanentWallKey(wallKeys, wall, rows, columns, startKey, endKey) {
  let key = null;

  if (typeof wall === 'string') {
    key = wall;
  } else {
    const coordinate = normaliseCoordinate(wall);
    if (coordinate && isCoordinateInBounds(coordinate, rows, columns)) {
      key = getSandboxNodeKey(coordinate);
    }
  }

  if (!key || key === startKey || key === endKey) return;

  const coordinate = parseSandboxNodeKey(key);
  if (isCoordinateInBounds(coordinate, rows, columns)) wallKeys.add(key);
}

function collectPermanentWallKeys({
  grid,
  nodes,
  permanentWalls,
  includeExistingWalls,
  rows,
  columns,
  startKey,
  endKey,
}) {
  const wallKeys = new Set();

  forEachProvidedNode(grid || nodes, (node) => {
    if (!node) return;
    if (!node.isPermanentWall && !(includeExistingWalls && node.isWall)) return;

    addPermanentWallKey(wallKeys, node, rows, columns, startKey, endKey);
  });

  if (permanentWalls instanceof Set) {
    permanentWalls.forEach((wall) => {
      addPermanentWallKey(wallKeys, wall, rows, columns, startKey, endKey);
    });
  } else {
    forEachProvidedNode(permanentWalls, (wall) => {
      addPermanentWallKey(wallKeys, wall, rows, columns, startKey, endKey);
    });
  }

  return wallKeys;
}

function countWallableNodes(model) {
  let count = 0;

  for (let row = 0; row < model.rows; row++) {
    for (let col = 0; col < model.columns; col++) {
      const key = getSandboxNodeKey(row, col);
      if (isWallableKey(model, key)) count++;
    }
  }

  return count;
}

export function createSandboxSolverModel({
  grid,
  nodes,
  rows,
  columns,
  start,
  end,
  permanentWalls,
  includeExistingWalls = false,
}) {
  const dimensions = inferDimensions({ grid, nodes, rows, columns });
  const nodeSource = grid || nodes;
  const startNode = normaliseCoordinate(start) || findMarkedNode(nodeSource, 'isStart');
  const endNode = normaliseCoordinate(end) || findMarkedNode(nodeSource, 'isEnd');
  const startIsValid = isCoordinateInBounds(
    startNode,
    dimensions.rows,
    dimensions.columns
  );
  const endIsValid = isCoordinateInBounds(
    endNode,
    dimensions.rows,
    dimensions.columns
  );
  const startKey = startIsValid ? getSandboxNodeKey(startNode) : null;
  const endKey = endIsValid ? getSandboxNodeKey(endNode) : null;
  const permanentWallKeys =
    startKey && endKey
      ? collectPermanentWallKeys({
          grid,
          nodes,
          permanentWalls,
          includeExistingWalls,
          rows: dimensions.rows,
          columns: dimensions.columns,
          startKey,
          endKey,
        })
      : new Set();
  const model = {
    rows: dimensions.rows,
    columns: dimensions.columns,
    start: startNode,
    end: endNode,
    startKey,
    endKey,
    permanentWallKeys,
    isValid:
      dimensions.rows > 0 &&
      dimensions.columns > 0 &&
      startIsValid &&
      endIsValid,
  };

  return {
    ...model,
    wallableNodeCount: model.isValid ? countWallableNodes(model) : 0,
  };
}

function getNeighbours(node, rows, columns) {
  const neighbours = [];

  if (node.row > 0) neighbours.push({ row: node.row - 1, col: node.col });
  if (node.row < rows - 1) neighbours.push({ row: node.row + 1, col: node.col });
  if (node.col > 0) neighbours.push({ row: node.row, col: node.col - 1 });
  if (node.col < columns - 1) neighbours.push({ row: node.row, col: node.col + 1 });

  return neighbours;
}

function isPermanentBlockedKey(model, key) {
  return (
    key !== model.startKey &&
    key !== model.endKey &&
    model.permanentWallKeys.has(key)
  );
}

function isWallableKey(model, key) {
  return (
    key !== model.startKey &&
    key !== model.endKey &&
    !model.permanentWallKeys.has(key)
  );
}

function isBlockedKey(model, key, extraWalls) {
  return isPermanentBlockedKey(model, key) || extraWalls.has(key);
}

function findShortestPath(model, extraWalls = new Set()) {
  if (!model.isValid) return null;

  if (model.startKey === model.endKey) {
    return {
      distance: 0,
      path: [model.start],
      pathKeys: [model.startKey],
    };
  }

  const queue = [model.start];
  const visited = new Set([model.startKey]);
  const previous = new Map();
  let queueIndex = 0;

  while (queueIndex < queue.length) {
    const current = queue[queueIndex];
    const currentKey = getSandboxNodeKey(current);
    queueIndex++;

    for (const neighbour of getNeighbours(current, model.rows, model.columns)) {
      const key = getSandboxNodeKey(neighbour);

      if (visited.has(key) || isBlockedKey(model, key, extraWalls)) {
        continue;
      }

      visited.add(key);
      previous.set(key, currentKey);

      if (key === model.endKey) {
        return buildPathResult(previous, model.startKey, model.endKey);
      }

      queue.push(neighbour);
    }
  }

  return null;
}

function createSeededRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function getIndexedNodeId(model, row, col) {
  return row * model.columns + col;
}

function getIndexedNodeKey(indexedModel, id) {
  const row = Math.floor(id / indexedModel.columns);
  const col = id % indexedModel.columns;

  return getSandboxNodeKey(row, col);
}

function createIndexedSolverModel(model) {
  const nodeCount = model.rows * model.columns;
  const blocked = new Uint8Array(nodeCount);
  const neighbours = Array.from({ length: nodeCount }, () => []);
  const startId = getIndexedNodeId(model, model.start.row, model.start.col);
  const endId = getIndexedNodeId(model, model.end.row, model.end.col);

  model.permanentWallKeys.forEach((key) => {
    const { row, col } = parseSandboxNodeKey(key);
    if (
      row >= 0 &&
      row < model.rows &&
      col >= 0 &&
      col < model.columns
    ) {
      blocked[getIndexedNodeId(model, row, col)] = 1;
    }
  });

  blocked[startId] = 0;
  blocked[endId] = 0;

  for (let row = 0; row < model.rows; row++) {
    for (let col = 0; col < model.columns; col++) {
      const id = getIndexedNodeId(model, row, col);

      if (row > 0) neighbours[id].push(getIndexedNodeId(model, row - 1, col));
      if (row < model.rows - 1) {
        neighbours[id].push(getIndexedNodeId(model, row + 1, col));
      }
      if (col > 0) neighbours[id].push(getIndexedNodeId(model, row, col - 1));
      if (col < model.columns - 1) {
        neighbours[id].push(getIndexedNodeId(model, row, col + 1));
      }
    }
  }

  return {
    rows: model.rows,
    columns: model.columns,
    nodeCount,
    startId,
    endId,
    blocked,
    neighbours,
  };
}

function isIndexedWallable(indexedModel, id) {
  return (
    id !== indexedModel.startId &&
    id !== indexedModel.endId &&
    indexedModel.blocked[id] === 0
  );
}

function isIndexedOpen(indexedModel, id, extraWallMask) {
  return (
    id === indexedModel.startId ||
    id === indexedModel.endId ||
    (indexedModel.blocked[id] === 0 && (!extraWallMask || !extraWallMask[id]))
  );
}

function createWallMask(indexedModel, wallIds) {
  const mask = new Uint8Array(indexedModel.nodeCount);

  wallIds.forEach((id) => {
    if (isIndexedWallable(indexedModel, id)) mask[id] = 1;
  });

  return mask;
}

function findIndexedDistances(indexedModel, sourceId, extraWallMask = null) {
  const distances = new Int32Array(indexedModel.nodeCount);
  const queue = new Int32Array(indexedModel.nodeCount);
  let queueStart = 0;
  let queueEnd = 0;

  distances.fill(-1);
  distances[sourceId] = 0;
  queue[queueEnd++] = sourceId;

  while (queueStart < queueEnd) {
    const id = queue[queueStart++];
    const nextDistance = distances[id] + 1;

    for (const neighbourId of indexedModel.neighbours[id]) {
      if (
        distances[neighbourId] !== -1 ||
        !isIndexedOpen(indexedModel, neighbourId, extraWallMask)
      ) {
        continue;
      }

      distances[neighbourId] = nextDistance;
      queue[queueEnd++] = neighbourId;
    }
  }

  return distances;
}

function findIndexedShortestPath(indexedModel, wallIds = []) {
  const extraWallMask = createWallMask(indexedModel, wallIds);
  const distances = new Int32Array(indexedModel.nodeCount);
  const previous = new Int32Array(indexedModel.nodeCount);
  const queue = new Int32Array(indexedModel.nodeCount);
  let queueStart = 0;
  let queueEnd = 0;

  distances.fill(-1);
  previous.fill(-1);
  distances[indexedModel.startId] = 0;
  queue[queueEnd++] = indexedModel.startId;

  while (queueStart < queueEnd) {
    const id = queue[queueStart++];
    if (id === indexedModel.endId) break;

    const nextDistance = distances[id] + 1;

    for (const neighbourId of indexedModel.neighbours[id]) {
      if (
        distances[neighbourId] !== -1 ||
        !isIndexedOpen(indexedModel, neighbourId, extraWallMask)
      ) {
        continue;
      }

      distances[neighbourId] = nextDistance;
      previous[neighbourId] = id;
      queue[queueEnd++] = neighbourId;
    }
  }

  if (distances[indexedModel.endId] === -1) return null;

  const pathIds = [];
  let id = indexedModel.endId;

  while (id !== -1) {
    pathIds.push(id);
    if (id === indexedModel.startId) break;
    id = previous[id];
  }

  pathIds.reverse();

  return {
    distance: distances[indexedModel.endId],
    pathIds,
  };
}

function createIndexedDangerPool(indexedModel, endDistance) {
  const startDistances = findIndexedDistances(indexedModel, indexedModel.startId);
  const endDistances = findIndexedDistances(indexedModel, indexedModel.endId);
  const dangerIds = [];

  for (let id = 0; id < indexedModel.nodeCount; id++) {
    if (!isIndexedWallable(indexedModel, id)) continue;
    if (startDistances[id] === -1 || endDistances[id] === -1) continue;
    if (startDistances[id] + endDistances[id] <= endDistance) {
      dangerIds.push(id);
    }
  }

  return dangerIds;
}

function createIndexedStateKey(wallIds) {
  return [...wallIds].sort((first, second) => first - second).join(',');
}

function getConstraintFrequency(constraints) {
  const frequency = new Map();

  constraints.forEach((constraint) => {
    constraint.forEach((id) => {
      frequency.set(id, (frequency.get(id) || 0) + 1);
    });
  });

  return frequency;
}

function chooseWeightedCandidate(candidates, random, spread = 8) {
  if (candidates.length === 0) return null;

  candidates.sort((first, second) => second.score - first.score);

  const index = Math.min(
    candidates.length - 1,
    Math.floor(Math.pow(random(), 1.7) * Math.min(spread, candidates.length))
  );

  return candidates[index].id;
}

function buildCegarCandidate({
  indexedModel,
  constraints,
  dangerIds,
  frequency,
  wallBudget,
  random,
  iteration,
}) {
  const uncovered = new Set(constraints.map((_, index) => index));
  const wallIds = [];
  const wallSet = new Set();

  while (uncovered.size > 0 && wallIds.length < wallBudget) {
    const scores = new Map();

    uncovered.forEach((constraintIndex) => {
      constraints[constraintIndex].forEach((id) => {
        if (!wallSet.has(id)) {
          scores.set(id, (scores.get(id) || 0) + 1);
        }
      });
    });

    if (scores.size === 0) return null;

    const scoredCandidates = [...scores.entries()].map(([id, coverCount]) => ({
      id,
      score: coverCount + random() * 1.2,
    }));

    const selectedId = chooseWeightedCandidate(scoredCandidates, random, 10);
    if (selectedId === null) return null;

    wallIds.push(selectedId);
    wallSet.add(selectedId);

    [...uncovered].forEach((constraintIndex) => {
      if (constraints[constraintIndex].includes(selectedId)) {
        uncovered.delete(constraintIndex);
      }
    });
  }

  if (uncovered.size > 0) return null;

  while (
    wallIds.length < wallBudget &&
    (wallBudget <= 12 ? random() < 0.95 : random() < 0.82)
  ) {
    const fillCandidates = dangerIds
      .filter((id) => !wallSet.has(id))
      .map((id) => {
        const row = Math.floor(id / indexedModel.columns);
        const frequencyScore = frequency.get(id) || 0;

        return {
          id,
          score:
            frequencyScore * 0.5 +
            random() * 4 -
            Math.abs(row - indexedModel.rows / 2) * 0.02,
        };
      });

    fillCandidates.sort((first, second) => second.score - first.score);
    const selectedId =
      fillCandidates.length === 0
        ? null
        : fillCandidates[
            Math.min(
              fillCandidates.length - 1,
              Math.floor(
                Math.pow(random(), 2) * Math.min(30, fillCandidates.length)
              )
            )
          ].id;
    if (selectedId === null) break;

    wallIds.push(selectedId);
    wallSet.add(selectedId);
  }

  return wallIds.sort((first, second) => first - second);
}

function createIndexedConstraint(indexedModel, pathIds) {
  const seen = new Set();
  const constraint = [];

  pathIds.slice(1, -1).forEach((id) => {
    if (!isIndexedWallable(indexedModel, id) || seen.has(id)) return;
    seen.add(id);
    constraint.push(id);
  });

  constraint.sort((first, second) => first - second);
  return constraint;
}

function createConstraintKey(constraint) {
  return constraint.join(',');
}

function addIndexedConstraint(indexedModel, constraints, constraintKeys, pathIds) {
  const constraint = createIndexedConstraint(indexedModel, pathIds);
  if (constraint.length === 0) return false;

  const key = createConstraintKey(constraint);
  if (constraintKeys.has(key)) return false;

  constraintKeys.add(key);
  constraints.push(constraint);
  return true;
}

function isConstraintHit(constraint, selectedMask) {
  for (const id of constraint) {
    if (selectedMask[id]) return true;
  }

  return false;
}

function isForbiddenWallSuperset(selectedMask, forbiddenSupersets) {
  for (const forbidden of forbiddenSupersets) {
    let containsAll = true;

    for (const id of forbidden) {
      if (!selectedMask[id]) {
        containsAll = false;
        break;
      }
    }

    if (containsAll) return true;
  }

  return false;
}

function estimateUncoveredConstraintLowerBound(constraints, selectedMask) {
  const usedIds = new Set();
  let lowerBound = 0;

  constraints.forEach((constraint) => {
    if (isConstraintHit(constraint, selectedMask)) return;

    let disjoint = true;
    for (const id of constraint) {
      if (usedIds.has(id)) {
        disjoint = false;
        break;
      }
    }

    if (!disjoint) return;

    lowerBound++;
    constraint.forEach((id) => usedIds.add(id));
  });

  return lowerBound;
}

function findTightestUncoveredConstraintIndex({
  constraints,
  selectedMask,
  frequency,
}) {
  let bestIndex = -1;
  let bestCandidateCount = Number.POSITIVE_INFINITY;
  let bestFrequency = -1;

  constraints.forEach((constraint, index) => {
    if (isConstraintHit(constraint, selectedMask)) return;

    let candidateCount = 0;
    let frequencyScore = 0;

    constraint.forEach((id) => {
      if (selectedMask[id]) return;
      candidateCount++;
      frequencyScore += frequency.get(id) || 0;
    });

    if (
      candidateCount < bestCandidateCount ||
      (candidateCount === bestCandidateCount && frequencyScore > bestFrequency)
    ) {
      bestIndex = index;
      bestCandidateCount = candidateCount;
      bestFrequency = frequencyScore;
    }
  });

  return bestIndex;
}

function scoreExactCandidateId({
  id,
  indexedModel,
  frequency,
  startDistances,
  endDistances,
}) {
  const frequencyScore = frequency.get(id) || 0;
  const startDistance = startDistances[id] === -1 ? 0 : startDistances[id];
  const endDistance = endDistances[id] === -1 ? 0 : endDistances[id];
  const corridorScore = Math.min(startDistance, endDistance);
  const middleScore = Math.min(
    Math.abs(startDistance - endDistance),
    indexedModel.rows + indexedModel.columns
  );
  const row = Math.floor(id / indexedModel.columns);
  const centreBias = -Math.abs(row - indexedModel.rows / 2) * 0.01;

  return frequencyScore * 1000 + corridorScore * 2 - middleScore + centreBias;
}

function collectExactHittingCandidates({
  indexedModel,
  constraints,
  wallBudget,
  forbiddenSupersets,
  triedCandidateKeys,
  startedAt,
  options,
  maxCandidates = 64,
  maxBranchCandidates = 80,
}) {
  if (constraints.length === 0) return [];

  const candidates = [];
  const selectedIds = [];
  const selectedMask = new Uint8Array(indexedModel.nodeCount);
  const frequency = getConstraintFrequency(constraints);
  const startDistances = findIndexedDistances(indexedModel, indexedModel.startId);
  const endDistances = findIndexedDistances(indexedModel, indexedModel.endId);

  function visit() {
    if (candidates.length >= maxCandidates) return;
    if (shouldStopSearch({ searchedStates: 0 }, options, startedAt)) return;
    if (selectedIds.length > wallBudget) return;
    if (isForbiddenWallSuperset(selectedMask, forbiddenSupersets)) return;

    const lowerBound = estimateUncoveredConstraintLowerBound(
      constraints,
      selectedMask
    );

    if (selectedIds.length + lowerBound > wallBudget) return;

    const constraintIndex = findTightestUncoveredConstraintIndex({
      constraints,
      selectedMask,
      frequency,
    });

    if (constraintIndex === -1) {
      const candidate = [...selectedIds].sort((first, second) => first - second);
      const key = createIndexedStateKey(candidate);
      if (!triedCandidateKeys.has(key)) candidates.push(candidate);
      return;
    }

    const branchIds = constraints[constraintIndex]
      .filter((id) => !selectedMask[id])
      .sort((first, second) => {
        const firstScore = scoreExactCandidateId({
          id: first,
          indexedModel,
          frequency,
          startDistances,
          endDistances,
        });
        const secondScore = scoreExactCandidateId({
          id: second,
          indexedModel,
          frequency,
          startDistances,
          endDistances,
        });

        if (firstScore !== secondScore) return secondScore - firstScore;

        return first - second;
      })
      .slice(0, maxBranchCandidates);

    for (const id of branchIds) {
      if (selectedMask[id]) continue;

      selectedMask[id] = 1;
      selectedIds.push(id);
      visit();
      selectedIds.pop();
      selectedMask[id] = 0;

      if (candidates.length >= maxCandidates) return;
      if (shouldStopSearch({ searchedStates: 0 }, options, startedAt)) return;
    }
  }

  visit();
  return candidates;
}

function addIndexedSolution({
  indexedModel,
  options,
  solutions,
  solutionKeys,
  wallIds,
  distance,
  source,
}) {
  if (!wallIds || wallIds.length > options.wallBudget) return false;

  const wallKeys = wallIds.map((id) => getIndexedNodeKey(indexedModel, id));
  const wallKeySet = new Set(wallKeys);
  const solutionKey = createStateKey(wallKeySet);

  if (solutionKeys.has(solutionKey)) return false;

  solutionKeys.add(solutionKey);
  solutions.push({
    wallKeys: wallKeySet,
    distance,
    source,
  });

  return true;
}

function runIndexedMaxFlow(graph, source, sink) {
  return runMaxFlow(graph, source, sink);
}

function findIndexedDangerCut(indexedModel, endDistance, forbiddenMask = null) {
  const startDistances = findIndexedDistances(indexedModel, indexedModel.startId);
  const endDistances = findIndexedDistances(indexedModel, indexedModel.endId);
  const dangerIndex = new Int32Array(indexedModel.nodeCount);
  const dangerIds = [];
  const graph = [];

  dangerIndex.fill(-1);

  for (let id = 0; id < indexedModel.nodeCount; id++) {
    if (!isIndexedOpen(indexedModel, id, null)) continue;
    if (startDistances[id] === -1 || endDistances[id] === -1) continue;
    if (startDistances[id] + endDistances[id] <= endDistance) {
      dangerIndex[id] = dangerIds.length;
      dangerIds.push(id);
    }
  }

  if (
    dangerIndex[indexedModel.startId] === -1 ||
    dangerIndex[indexedModel.endId] === -1
  ) {
    return [];
  }

  dangerIds.forEach((id) => {
    const inId = graph.length;
    const outId = graph.length + 1;
    graph.push([], []);

    const capacity =
      id === indexedModel.startId ||
      id === indexedModel.endId ||
      forbiddenMask?.[id]
        ? FLOW_INFINITY
        : 1;

    addFlowEdge(graph, inId, outId, capacity);
  });

  dangerIds.forEach((id, index) => {
    const outId = index * 2 + 1;

    indexedModel.neighbours[id].forEach((neighbourId) => {
      const neighbourIndex = dangerIndex[neighbourId];
      if (neighbourIndex === -1) return;

      addFlowEdge(graph, outId, neighbourIndex * 2, FLOW_INFINITY);
    });
  });

  const source = dangerIndex[indexedModel.startId] * 2 + 1;
  const sink = dangerIndex[indexedModel.endId] * 2;
  const flow = runIndexedMaxFlow(graph, source, sink);

  if (flow >= FLOW_INFINITY) return null;

  const reachable = findReachableFlowNodes(graph, source);
  const cutIds = [];

  dangerIds.forEach((id, index) => {
    const inId = index * 2;
    const outId = index * 2 + 1;

    if (
      id !== indexedModel.startId &&
      id !== indexedModel.endId &&
      reachable.has(inId) &&
      !reachable.has(outId)
    ) {
      cutIds.push(id);
    }
  });

  return cutIds;
}

function findIndexedPathBetween(indexedModel, startId, endId, blockedMask = null) {
  const previous = new Int32Array(indexedModel.nodeCount);
  const seen = new Uint8Array(indexedModel.nodeCount);
  const queue = new Int32Array(indexedModel.nodeCount);
  let queueStart = 0;
  let queueEnd = 0;

  previous.fill(-1);
  seen[startId] = 1;
  queue[queueEnd++] = startId;

  while (queueStart < queueEnd) {
    const id = queue[queueStart++];
    if (id === endId) break;

    for (const neighbourId of indexedModel.neighbours[id]) {
      if (
        seen[neighbourId] ||
        !isIndexedOpen(indexedModel, neighbourId, blockedMask)
      ) {
        continue;
      }

      seen[neighbourId] = 1;
      previous[neighbourId] = id;
      queue[queueEnd++] = neighbourId;
    }
  }

  if (!seen[endId]) return null;

  const pathIds = [];
  let id = endId;

  while (id !== -1) {
    pathIds.push(id);
    if (id === startId) break;
    id = previous[id];
  }

  pathIds.reverse();
  return pathIds;
}

function searchPreservedPathDangerCuts({
  indexedModel,
  options,
  solutions,
  solutionKeys,
  startedAt,
  metadata,
  maxDurationMs,
  reportProgress,
}) {
  const localStartedAt = getNow();
  const startDistances = findIndexedDistances(indexedModel, indexedModel.startId);
  const endDistances = findIndexedDistances(indexedModel, indexedModel.endId);
  const waypointIds = [];

  for (let id = 0; id < indexedModel.nodeCount; id++) {
    if (!isIndexedWallable(indexedModel, id)) continue;
    if (startDistances[id] === -1 || endDistances[id] === -1) continue;
    waypointIds.push(id);
  }

  waypointIds.sort((firstId, secondId) => {
    const firstScore = startDistances[firstId] + endDistances[firstId];
    const secondScore = startDistances[secondId] + endDistances[secondId];
    return secondScore - firstScore;
  });

  for (
    let index = 0;
    index < waypointIds.length &&
    getNow() - localStartedAt < maxDurationMs &&
    shouldStopSearch(metadata, options, startedAt) === null;
    index++
  ) {
    const waypointId = waypointIds[index];
    const firstLeg = findIndexedPathBetween(
      indexedModel,
      indexedModel.startId,
      waypointId
    );

    if (!firstLeg) continue;

    const blockedMask = new Uint8Array(indexedModel.nodeCount);
    firstLeg.slice(0, -1).forEach((id) => {
      blockedMask[id] = 1;
    });

    const secondLeg = findIndexedPathBetween(
      indexedModel,
      waypointId,
      indexedModel.endId,
      blockedMask
    );

    if (!secondLeg) continue;

    const preservedPath = firstLeg.concat(secondLeg.slice(1));
    if (preservedPath.length - 1 <= options.endDistance) continue;

    const preserveMask = new Uint8Array(indexedModel.nodeCount);
    preservedPath.forEach((id) => {
      preserveMask[id] = 1;
    });

    const cutIds = findIndexedDangerCut(
      indexedModel,
      options.endDistance,
      preserveMask
    );

    metadata.searchedStates++;
    if (reportProgress) reportProgress('checking preserved paths');

    if (!cutIds || cutIds.length === 0 || cutIds.length > options.wallBudget) {
      continue;
    }

    metadata.combinationsConsidered++;

    const path = findIndexedShortestPath(indexedModel, cutIds);
    if (path && path.distance > options.endDistance) {
      const added = addIndexedSolution({
        indexedModel,
        options,
        solutions,
        solutionKeys,
        wallIds: cutIds,
        distance: path.distance,
        source: 'preserved-path-cut',
      });
      if (added && reportProgress) reportProgress('solution found', true);
      return;
    }
  }
}

function searchDangerCutSolutions({
  model,
  options,
  metadata,
  solutions,
  solutionKeys,
  startedAt,
  maxDurationMs = 900,
  reportProgress,
}) {
  const indexedModel = createIndexedSolverModel(model);
  const forbiddenMask = new Uint8Array(indexedModel.nodeCount);
  const localStartedAt = getNow();

  while (
    !hasReachedSolutionTarget(solutions, options) &&
    getNow() - localStartedAt < maxDurationMs &&
    shouldStopSearch(metadata, options, startedAt) === null
  ) {
    const cutIds = findIndexedDangerCut(
      indexedModel,
      options.endDistance,
      forbiddenMask
    );

    metadata.searchedStates++;
    if (reportProgress) reportProgress('checking danger cuts');

    if (!cutIds || cutIds.length === 0 || cutIds.length > options.wallBudget) {
      break;
    }

    metadata.combinationsConsidered++;

    const path = findIndexedShortestPath(indexedModel, cutIds);

    if (path && path.distance > options.endDistance) {
      const added = addIndexedSolution({
        indexedModel,
        options,
        solutions,
        solutionKeys,
        wallIds: cutIds,
        distance: path.distance,
        source: 'danger-cut',
      });
      if (added && reportProgress) reportProgress('solution found', true);
      break;
    }

    cutIds.forEach((id) => {
      forbiddenMask[id] = 1;
    });
  }

  if (
    solutions.length === 0 &&
    getNow() - localStartedAt < maxDurationMs &&
    shouldStopSearch(metadata, options, startedAt) === null
  ) {
    searchPreservedPathDangerCuts({
      indexedModel,
      options,
      solutions,
      solutionKeys,
      startedAt,
      metadata,
      maxDurationMs: Math.max(0, maxDurationMs - (getNow() - localStartedAt)),
      reportProgress,
    });
  }
}

function searchDistanceJumpSolutions({
  model,
  options,
  metadata,
  solutions,
  solutionKeys,
  grid,
  reportProgress,
}) {
  if (!isGridLike(grid)) return;
  if (hasReachedSolutionTarget(solutions, options)) return;

  const targetCount = getCampaignSeedTargetCount(options);
  const seedSets = createDistanceJumpCampaignSeedSets(
    model,
    options,
    grid,
    targetCount * 12
  );
  let addedCount = 0;

  seedSets.forEach((seedSet) => {
    if (solutions.length >= targetCount) return;

    metadata.searchedStates++;
    metadata.combinationsConsidered++;
    if (reportProgress) reportProgress('checking distance jumps');

    const added = addVerifiedSolution(
      model,
      options,
      solutions,
      solutionKeys,
      seedSet,
      'distance-jump'
    );

    if (added) {
      addedCount++;
      if (reportProgress) reportProgress('solution found', true);
    }
  });

  if (addedCount > 0) {
    metadata.distanceJumpSolutionCount =
      (metadata.distanceJumpSolutionCount || 0) + addedCount;
  }
}

function createProtectedTerminalMask(indexedModel, radius, wallIds = []) {
  const startDistances = findIndexedDistances(indexedModel, indexedModel.startId);
  const endDistances = findIndexedDistances(indexedModel, indexedModel.endId);
  const mask = new Uint8Array(indexedModel.nodeCount);

  for (let id = 0; id < indexedModel.nodeCount; id++) {
    if (
      (startDistances[id] >= 0 && startDistances[id] <= radius) ||
      (endDistances[id] >= 0 && endDistances[id] <= radius)
    ) {
      mask[id] = 1;
    }
  }

  wallIds.forEach((id) => {
    mask[id] = 1;
  });

  return mask;
}

function searchShortestLayerCutSolutions({
  model,
  options,
  metadata,
  solutions,
  solutionKeys,
  startedAt,
  reportProgress,
}) {
  if (hasReachedSolutionTarget(solutions, options)) return;

  const indexedModel = createIndexedSolverModel(model);
  const radii = [0, 2, 4, 8, 12, 20, 30];
  const seenCutKeys = new Set();

  for (
    let radiusIndex = 0;
    radiusIndex < radii.length &&
    !hasReachedSolutionTarget(solutions, options) &&
    shouldStopSearch(metadata, options, startedAt) === null;
    radiusIndex++
  ) {
    const radius = radii[radiusIndex];
    const wallIds = [];
    const wallSet = new Set();

    while (
      wallIds.length < options.wallBudget &&
      !hasReachedSolutionTarget(solutions, options) &&
      shouldStopSearch(metadata, options, startedAt) === null
    ) {
      const path = findIndexedShortestPath(indexedModel, wallIds);
      metadata.searchedStates++;
      if (reportProgress) reportProgress('checking shortest cuts');

      if (!path) break;

      if (path.distance > options.endDistance) {
        const added = addIndexedSolution({
          indexedModel,
          options,
          solutions,
          solutionKeys,
          wallIds,
          distance: path.distance,
          source: 'shortest-layer-cut',
        });

        if (added && reportProgress) reportProgress('solution found', true);
        break;
      }

      const protectMask = createProtectedTerminalMask(
        indexedModel,
        radius,
        wallIds
      );
      const cutIds = findIndexedDangerCut(
        indexedModel,
        path.distance,
        protectMask
      );

      if (!cutIds || cutIds.length === 0) break;
      if (wallIds.length + cutIds.length > options.wallBudget) break;

      const nextWallSet = new Set([...wallIds, ...cutIds]);
      if (nextWallSet.size === wallSet.size) break;

      const cutKey = `${radius}:${createIndexedStateKey([...nextWallSet])}`;
      if (seenCutKeys.has(cutKey)) break;

      const nextPath = findIndexedShortestPath(indexedModel, [...nextWallSet]);
      metadata.combinationsConsidered++;

      if (!nextPath) break;

      seenCutKeys.add(cutKey);
      cutIds.forEach((id) => {
        wallSet.add(id);
      });
      wallIds.length = 0;
      wallIds.push(...[...wallSet].sort((first, second) => first - second));

      if (nextPath.distance > metadata.bestPathDistance) {
        metadata.bestPathDistance = nextPath.distance;
        metadata.bestWallCount = wallIds.length;
      }
    }
  }
}

function insertSortedWallId(wallIds, id) {
  const nextWallIds = [...wallIds, id];
  nextWallIds.sort((first, second) => first - second);
  return nextWallIds;
}

function scoreBeamBranchId({
  id,
  index,
  pathLength,
  indexedModel,
  startDistances,
  endDistances,
}) {
  const startDistance = startDistances[id] === -1 ? 0 : startDistances[id];
  const endDistance = endDistances[id] === -1 ? 0 : endDistances[id];
  const terminalDistance = Math.min(startDistance, endDistance);
  const middleBias = -Math.abs(index - (pathLength - 1) / 2);
  const row = Math.floor(id / indexedModel.columns);
  const centreBias = -Math.abs(row - indexedModel.rows / 2) * 0.05;

  return terminalDistance * 20 + middleBias + centreBias;
}

function getBeamBranchIds({
  indexedModel,
  path,
  wallMask,
  startDistances,
  endDistances,
  branchLimit,
}) {
  return path.pathIds
    .map((id, index) => ({ id, index }))
    .filter(({ id }) => {
      return (
        id !== indexedModel.startId &&
        id !== indexedModel.endId &&
        !wallMask[id] &&
        isIndexedWallable(indexedModel, id)
      );
    })
    .sort((first, second) => {
      const firstScore = scoreBeamBranchId({
        id: first.id,
        index: first.index,
        pathLength: path.pathIds.length,
        indexedModel,
        startDistances,
        endDistances,
      });
      const secondScore = scoreBeamBranchId({
        id: second.id,
        index: second.index,
        pathLength: path.pathIds.length,
        indexedModel,
        startDistances,
        endDistances,
      });

      if (firstScore !== secondScore) return secondScore - firstScore;

      return first.id - second.id;
    })
    .slice(0, branchLimit)
    .map(({ id }) => id);
}

function createBeamWallMask(indexedModel, wallIds) {
  const mask = new Uint8Array(indexedModel.nodeCount);
  wallIds.forEach((id) => {
    mask[id] = 1;
  });
  return mask;
}

function searchGreedyBeamSolutions({
  model,
  options,
  metadata,
  solutions,
  solutionKeys,
  startedAt,
  reportProgress,
}) {
  if (hasReachedSolutionTarget(solutions, options)) return;

  const indexedModel = createIndexedSolverModel(model);
  const initialPath = findIndexedShortestPath(indexedModel, []);
  if (!initialPath) return;

  const targetSolutionCount = Number.isFinite(options.maxSolutions)
    ? options.maxSolutions
    : 24;
  const beamWidth = options.wallBudget <= 12 ? 48 : 32;
  const branchLimit = options.wallBudget <= 12 ? 88 : 56;
  const startDistances = findIndexedDistances(indexedModel, indexedModel.startId);
  const endDistances = findIndexedDistances(indexedModel, indexedModel.endId);
  const seenStates = new Set(['']);
  let states = [
    {
      wallIds: [],
      key: '',
      path: initialPath,
    },
  ];

  for (
    let depth = 0;
    depth < options.wallBudget &&
    states.length > 0 &&
    solutions.length < targetSolutionCount &&
    shouldStopSearch(metadata, options, startedAt) === null;
    depth++
  ) {
    const nextStates = [];

    for (
      let stateIndex = 0;
      stateIndex < states.length &&
      solutions.length < targetSolutionCount &&
      shouldStopSearch(metadata, options, startedAt) === null;
      stateIndex++
    ) {
      const state = states[stateIndex];
      const path =
        state.path || findIndexedShortestPath(indexedModel, state.wallIds);
      metadata.searchedStates++;
      if (reportProgress) reportProgress('testing wall beams');

      if (!path) continue;

      if (path.distance > options.endDistance) {
        const added = addIndexedSolution({
          indexedModel,
          options,
          solutions,
          solutionKeys,
          wallIds: state.wallIds,
          distance: path.distance,
          source: 'beam-interdiction',
        });

        if (added && reportProgress) reportProgress('solution found', true);
        continue;
      }

      const wallMask = createBeamWallMask(indexedModel, state.wallIds);
      const branchIds = getBeamBranchIds({
        indexedModel,
        path,
        wallMask,
        startDistances,
        endDistances,
        branchLimit,
      });

      for (
        let branchIndex = 0;
        branchIndex < branchIds.length &&
        shouldStopSearch(metadata, options, startedAt) === null;
        branchIndex++
      ) {
        const nextWallIds = insertSortedWallId(
          state.wallIds,
          branchIds[branchIndex]
        );
        const key = createIndexedStateKey(nextWallIds);

        if (seenStates.has(key)) continue;
        seenStates.add(key);

        const nextPath = findIndexedShortestPath(indexedModel, nextWallIds);
        metadata.combinationsConsidered++;

        if (!nextPath) continue;

        if (nextPath.distance > metadata.bestPathDistance) {
          metadata.bestPathDistance = nextPath.distance;
          metadata.bestWallCount = nextWallIds.length;
        }

        if (nextPath.distance > options.endDistance) {
          const added = addIndexedSolution({
            indexedModel,
            options,
            solutions,
            solutionKeys,
            wallIds: nextWallIds,
            distance: nextPath.distance,
            source: 'beam-interdiction',
          });

          if (added && reportProgress) reportProgress('solution found', true);
          continue;
        }

        nextStates.push({
          wallIds: nextWallIds,
          key,
          path: nextPath,
        });
      }
    }

    nextStates.sort((first, second) => {
      const firstDistance = first.path?.distance || 0;
      const secondDistance = second.path?.distance || 0;

      if (firstDistance !== secondDistance) {
        return secondDistance - firstDistance;
      }

      if (first.wallIds.length !== second.wallIds.length) {
        return first.wallIds.length - second.wallIds.length;
      }

      return first.key.localeCompare(second.key);
    });

    states = nextStates.slice(0, beamWidth);
  }

  const stopReason = shouldStopSearch(metadata, options, startedAt);
  if (stopReason) {
    metadata.capped = true;
    metadata.capReason = stopReason;
  }

  if (solutions.length >= targetSolutionCount) {
    metadata.maxSolutionsReached = true;
  }
}

function searchCegarSolutions({
  model,
  options,
  metadata,
  solutions,
  solutionKeys,
  startedAt,
  reportProgress,
}) {
  const indexedModel = createIndexedSolverModel(model);
  const constraints = [];
  const constraintKeys = new Set();
  const triedCandidateKeys = new Set();
  const forbiddenSupersets = [];
  const targetSolutionCount = Number.isFinite(options.maxSolutions)
    ? options.maxSolutions
    : 24;
  let bestDistance = metadata.initialPathDistance || 0;
  let bestWallCount = 0;
  let iteration = 0;

  metadata.cegarConstraints = 0;
  metadata.bestPathDistance = bestDistance;

  const initialPath = findIndexedShortestPath(indexedModel, []);
  if (initialPath) {
    addIndexedConstraint(
      indexedModel,
      constraints,
      constraintKeys,
      initialPath.pathIds
    );
    metadata.cegarConstraints = constraints.length;
  }

  while (
    solutions.length < targetSolutionCount &&
    shouldStopSearch(metadata, options, startedAt) === null
  ) {
    iteration++;
    const candidates = collectExactHittingCandidates({
      indexedModel,
      constraints,
      wallBudget: options.wallBudget,
      forbiddenSupersets,
      triedCandidateKeys,
      startedAt,
      options,
      maxCandidates: options.wallBudget <= 12 ? 96 : 64,
      maxBranchCandidates: options.wallBudget <= 12 ? 90 : 64,
    });

    if (candidates.length === 0) break;

    let learnedThisIteration = false;

    for (
      let candidateIndex = 0;
      candidateIndex < candidates.length &&
      solutions.length < targetSolutionCount &&
      shouldStopSearch(metadata, options, startedAt) === null;
      candidateIndex++
    ) {
      const candidate = candidates[candidateIndex];
      const candidateKey = createIndexedStateKey(candidate);

      if (triedCandidateKeys.has(candidateKey)) continue;

      triedCandidateKeys.add(candidateKey);
      metadata.searchedStates++;
      metadata.combinationsConsidered++;
      if (reportProgress) reportProgress('testing wall combinations');

      const candidatePath = findIndexedShortestPath(indexedModel, candidate);

      if (!candidatePath) {
        forbiddenSupersets.push(candidate);
        continue;
      }

      if (candidatePath.distance > bestDistance) {
        bestDistance = candidatePath.distance;
        bestWallCount = candidate.length;
        metadata.bestPathDistance = bestDistance;
        metadata.bestWallCount = bestWallCount;
      }

      if (candidatePath.distance > options.endDistance) {
        const added = addIndexedSolution({
          indexedModel,
          options,
          solutions,
          solutionKeys,
          wallIds: candidate,
          distance: candidatePath.distance,
          source: 'exact-path-hitting',
        });
        if (added && reportProgress) reportProgress('solution found', true);
        continue;
      }

      if (
        addIndexedConstraint(
          indexedModel,
          constraints,
          constraintKeys,
          candidatePath.pathIds
        )
      ) {
        learnedThisIteration = true;
        metadata.cegarConstraints = constraints.length;
      }
    }

    if (!learnedThisIteration && solutions.length === 0 && iteration > 1) break;
  }

  const stopReason = shouldStopSearch(metadata, options, startedAt);
  if (stopReason) {
    metadata.capped = true;
    metadata.capReason = stopReason;
  }

  if (solutions.length >= targetSolutionCount) {
    metadata.maxSolutionsReached = true;
  }
}

function buildPathResult(previous, startKey, endKey) {
  const pathKeys = [endKey];
  let key = endKey;

  while (key !== startKey) {
    key = previous.get(key);
    if (!key) return null;
    pathKeys.unshift(key);
  }

  return {
    distance: pathKeys.length - 1,
    path: pathKeys.map(parseSandboxNodeKey),
    pathKeys,
  };
}

function addFlowEdge(graph, from, to, capacity) {
  const forward = {
    to,
    reverseIndex: graph[to].length,
    capacity,
  };
  const reverse = {
    to: from,
    reverseIndex: graph[from].length,
    capacity: 0,
  };

  graph[from].push(forward);
  graph[to].push(reverse);
}

function buildLevelGraph(graph, source, sink, level) {
  level.fill(-1);
  level[source] = 0;

  const queue = [source];
  let queueIndex = 0;

  while (queueIndex < queue.length) {
    const node = queue[queueIndex];
    queueIndex++;

    for (const edge of graph[node]) {
      if (edge.capacity <= 0 || level[edge.to] !== -1) continue;

      level[edge.to] = level[node] + 1;
      if (edge.to === sink) return true;
      queue.push(edge.to);
    }
  }

  return level[sink] !== -1;
}

function pushBlockingFlow(graph, node, sink, amount, level, nextEdgeIndex) {
  if (node === sink) return amount;

  for (
    let edgeIndex = nextEdgeIndex[node];
    edgeIndex < graph[node].length;
    edgeIndex++
  ) {
    nextEdgeIndex[node] = edgeIndex;
    const edge = graph[node][edgeIndex];

    if (edge.capacity <= 0 || level[node] + 1 !== level[edge.to]) continue;

    const pushed = pushBlockingFlow(
      graph,
      edge.to,
      sink,
      Math.min(amount, edge.capacity),
      level,
      nextEdgeIndex
    );

    if (pushed <= 0) continue;

    edge.capacity -= pushed;
    graph[edge.to][edge.reverseIndex].capacity += pushed;
    return pushed;
  }

  return 0;
}

function findReachableFlowNodes(graph, source) {
  const reachable = new Set([source]);
  const queue = [source];
  let queueIndex = 0;

  while (queueIndex < queue.length) {
    const node = queue[queueIndex];
    queueIndex++;

    for (const edge of graph[node]) {
      if (edge.capacity <= 0 || reachable.has(edge.to)) continue;

      reachable.add(edge.to);
      queue.push(edge.to);
    }
  }

  return reachable;
}

function runMaxFlow(graph, source, sink) {
  const level = new Array(graph.length).fill(-1);
  let flow = 0;

  while (buildLevelGraph(graph, source, sink, level)) {
    const nextEdgeIndex = new Array(graph.length).fill(0);

    while (true) {
      const pushed = pushBlockingFlow(
        graph,
        source,
        sink,
        FLOW_INFINITY,
        level,
        nextEdgeIndex
      );

      if (pushed <= 0) break;

      flow += pushed;
      if (flow >= FLOW_INFINITY) return flow;
    }
  }

  return flow;
}

function findMinimumWallCut(model) {
  const nodeRefs = new Map();
  const graph = [];

  function addFlowNode(key) {
    const inId = graph.length;
    const outId = graph.length + 1;
    graph.push([], []);
    nodeRefs.set(key, { inId, outId });

    const capacity =
      key === model.startKey || key === model.endKey ? FLOW_INFINITY : 1;
    addFlowEdge(graph, inId, outId, capacity);
  }

  for (let row = 0; row < model.rows; row++) {
    for (let col = 0; col < model.columns; col++) {
      const key = getSandboxNodeKey(row, col);

      if (!isPermanentBlockedKey(model, key)) addFlowNode(key);
    }
  }

  for (let row = 0; row < model.rows; row++) {
    for (let col = 0; col < model.columns; col++) {
      const key = getSandboxNodeKey(row, col);
      const nodeRef = nodeRefs.get(key);

      if (!nodeRef) continue;

      for (const neighbour of getNeighbours({ row, col }, model.rows, model.columns)) {
        const neighbourKey = getSandboxNodeKey(neighbour);
        const neighbourRef = nodeRefs.get(neighbourKey);

        if (neighbourRef) {
          addFlowEdge(graph, nodeRef.outId, neighbourRef.inId, FLOW_INFINITY);
        }
      }
    }
  }

  const source = nodeRefs.get(model.startKey)?.outId;
  const sink = nodeRefs.get(model.endKey)?.inId;

  if (source === undefined || sink === undefined) {
    return {
      minimumWallCount: Number.POSITIVE_INFINITY,
      wallKeys: [],
    };
  }

  const minimumWallCount = runMaxFlow(graph, source, sink);
  const reachable = findReachableFlowNodes(graph, source);
  const wallKeys = [];

  nodeRefs.forEach((nodeRef, key) => {
    if (
      key !== model.startKey &&
      key !== model.endKey &&
      reachable.has(nodeRef.inId) &&
      !reachable.has(nodeRef.outId)
    ) {
      wallKeys.push(key);
    }
  });

  return {
    minimumWallCount,
    wallKeys: wallKeys.sort(compareNodeKeys),
  };
}

function getTerminalCutKeys(model, terminal) {
  const terminalKey = getSandboxNodeKey(terminal);
  const wallKeys = [];

  for (const neighbour of getNeighbours(terminal, model.rows, model.columns)) {
    const key = getSandboxNodeKey(neighbour);

    if (key === model.startKey || key === model.endKey) return null;
    if (isWallableKey(model, key)) wallKeys.push(key);
  }

  if (terminalKey !== model.startKey && terminalKey !== model.endKey) return null;

  return wallKeys.sort(compareNodeKeys);
}

function createStateKey(wallKeys) {
  return [...wallKeys].sort(compareNodeKeys).join('|');
}

function countOpenNeighbours(model, node, extraWalls) {
  let count = 0;

  for (const neighbour of getNeighbours(node, model.rows, model.columns)) {
    const key = getSandboxNodeKey(neighbour);
    if (!isBlockedKey(model, key, extraWalls)) count++;
  }

  return count;
}

function scoreCandidateKey(model, key, pathIndex, pathLength, extraWalls, preferredWallKeys) {
  const node = parseSandboxNodeKey(key);
  const distanceFromStart =
    Math.abs(node.row - model.start.row) + Math.abs(node.col - model.start.col);
  const distanceFromEnd =
    Math.abs(node.row - model.end.row) + Math.abs(node.col - model.end.col);
  const terminalDistance = Math.min(distanceFromStart, distanceFromEnd);
  const middleDistance = Math.abs(pathIndex - (pathLength - 1) / 2);
  const openNeighbours = countOpenNeighbours(model, node, extraWalls);
  const preferredScore = preferredWallKeys.has(key) ? -10000 : 0;

  return preferredScore + terminalDistance * 100 + openNeighbours * 10 + middleDistance;
}

function getCandidateWallKeys(pathResult, model, extraWalls, options) {
  return pathResult.pathKeys
    .map((key, index) => ({ key, index }))
    .filter(({ key }) => isWallableKey(model, key) && !extraWalls.has(key))
    .sort((first, second) => {
      const firstScore = scoreCandidateKey(
        model,
        first.key,
        first.index,
        pathResult.pathKeys.length,
        extraWalls,
        options.preferredWallKeys
      );
      const secondScore = scoreCandidateKey(
        model,
        second.key,
        second.index,
        pathResult.pathKeys.length,
        extraWalls,
        options.preferredWallKeys
      );

      if (firstScore !== secondScore) return firstScore - secondScore;

      return compareNodeKeys(first.key, second.key);
    })
    .slice(0, options.candidateLimit)
    .map(({ key }) => key);
}

function estimateCombinationCount(poolSize, budget, maxEstimate) {
  let total = 0;

  for (let size = 1; size <= Math.min(poolSize, budget); size++) {
    let combinations = 1;

    for (let index = 1; index <= size; index++) {
      combinations = (combinations * (poolSize - index + 1)) / index;

      if (combinations > maxEstimate) return maxEstimate + 1;
    }

    total += combinations;

    if (total > maxEstimate) return maxEstimate + 1;
  }

  return Math.round(total);
}

function summarizeFoundSolutions(solutions) {
  if (solutions.length === 0) {
    return {
      minimumFoundWallCount: null,
      minimumFoundSolutionCount: 0,
      maximumFoundWallCount: null,
    };
  }

  let minimumFoundWallCount = Number.POSITIVE_INFINITY;
  let maximumFoundWallCount = 0;

  solutions.forEach((solution) => {
    const wallCount = solution.wallKeys.size;
    minimumFoundWallCount = Math.min(minimumFoundWallCount, wallCount);
    maximumFoundWallCount = Math.max(maximumFoundWallCount, wallCount);
  });

  return {
    minimumFoundWallCount,
    minimumFoundSolutionCount: solutions.filter(
      (solution) => solution.wallKeys.size === minimumFoundWallCount
    ).length,
    maximumFoundWallCount,
  };
}

function orderSolutionsForDisplay(solutions) {
  return [...solutions].sort((first, second) => {
    const firstWallCount = first.wallKeys.size;
    const secondWallCount = second.wallKeys.size;

    if (firstWallCount !== secondWallCount) {
      return firstWallCount - secondWallCount;
    }

    const firstDistance = Number.isFinite(first.distance)
      ? first.distance
      : Number.POSITIVE_INFINITY;
    const secondDistance = Number.isFinite(second.distance)
      ? second.distance
      : Number.POSITIVE_INFINITY;

    if (firstDistance !== secondDistance) return secondDistance - firstDistance;

    return createStateKey(first.wallKeys).localeCompare(
      createStateKey(second.wallKeys)
    );
  });
}

function describeSolution(solution, index) {
  const wallKeys = [...solution.wallKeys].sort(compareNodeKeys);
  const wallCount = wallKeys.length;
  const distanceText =
    solution.distance === null ? 'already safe' : `path distance ${solution.distance}`;

  return {
    id: `solution-${index + 1}`,
    label: `Solution ${index + 1}`,
    detail: `${wallCount} wall${wallCount === 1 ? '' : 's'} | ${distanceText}`,
    wallKeys,
    walls: wallKeys.map(parseSandboxNodeKey),
    wallCount,
    distance: solution.distance,
    blocksPath: false,
    source: solution.source,
  };
}

function createEmptyMetadata(model, options, startedAt) {
  return {
    rows: model.rows,
    columns: model.columns,
    startKey: model.startKey,
    endKey: model.endKey,
    permanentWallCount: model.permanentWallKeys.size,
    wallableNodeCount: model.wallableNodeCount,
    wallBudget: options.wallBudget,
    allowedWallCount: options.wallBudget,
    endDistance: options.endDistance,
    maxSolutions: options.maxSolutions,
    maxStates: options.maxStates,
    maxCombinations: options.maxCombinations,
    maxTimeMs: options.maxTimeMs,
    candidateLimit: options.candidateLimit,
    combinationWarningLimit: options.combinationWarningLimit,
    searchedStates: 0,
    combinationsConsidered: 0,
    combinationEstimate: 0,
    minimumWallCount: null,
    initialPathDistance: null,
    capped: false,
    capReason: null,
    tooManyCombinations: false,
    maxSolutionsReached: false,
    elapsedMs: Math.max(0, Math.round(getNow() - startedAt)),
  };
}

function createResult(status, solutions, message, metadata, startedAt) {
  const elapsedMs = Math.max(0, Math.round(getNow() - startedAt));
  const orderedSolutions = orderSolutionsForDisplay(solutions);
  const describedSolutions = orderedSolutions.map(describeSolution);
  const solutionSummary = summarizeFoundSolutions(orderedSolutions);

  return {
    status,
    solutions: describedSolutions,
    message,
    metadata: {
      ...metadata,
      ...solutionSummary,
      status,
      solutionCount: orderedSolutions.length,
      elapsedMs,
    },
  };
}

function createProgressReporter(input, metadata, solutions, options, startedAt) {
  const onProgress =
    typeof input.onProgress === 'function' ? input.onProgress : null;
  let lastReportAt = 0;

  return (phase = 'searching', force = false) => {
    if (!onProgress) return;

    const now = getNow();
    if (!force && now - lastReportAt < 100) return;
    lastReportAt = now;

    const elapsedMs = Math.max(0, Math.round(now - startedAt));
    const remainingMs = Math.max(0, options.maxTimeMs - elapsedMs);

    const solutionSummary = summarizeFoundSolutions(solutions);

    onProgress({
      phase,
      solutionCount: solutions.length,
      ...solutionSummary,
      elapsedMs,
      remainingMs,
      maxTimeMs: options.maxTimeMs,
      searchedStates: metadata.searchedStates,
      combinationsConsidered: metadata.combinationsConsidered,
      combinationEstimate: metadata.combinationEstimate,
      wallBudget: options.wallBudget,
      endDistance: options.endDistance,
      capped: metadata.capped,
      capReason: metadata.capReason,
    });
  };
}

function normaliseSearchOptions(input) {
  const beamWidth = toPositiveInteger(input.beamWidth, 16);
  const wallBudget = toNonNegativeInteger(
    input.allowedWallCount ?? input.wallBudget ?? input.maxWalls,
    0
  );
  const endDistanceValue = Number(input.endDistance);
  const endDistance = Number.isFinite(endDistanceValue)
    ? Math.max(0, Math.floor(endDistanceValue))
    : null;

  return {
    wallBudget,
    endDistance,
    maxSolutions:
      input.maxSolutions === null || input.maxSolutions === undefined
        ? DEFAULT_MAX_SOLUTIONS
        : toPositiveInteger(input.maxSolutions, DEFAULT_MAX_SOLUTIONS),
    maxStates: toOptionalPositiveInteger(input.maxStates, DEFAULT_MAX_STATES),
    maxCombinations: toOptionalPositiveInteger(
      input.maxCombinations,
      DEFAULT_MAX_COMBINATIONS
    ),
    maxTimeMs: toPositiveInteger(input.maxTimeMs, DEFAULT_MAX_TIME_MS),
    candidateLimit: toPositiveInteger(
      input.candidateLimit ?? input.maxCandidatesPerPath,
      Math.max(DEFAULT_CANDIDATE_LIMIT, beamWidth * 4)
    ),
    combinationWarningLimit: toPositiveInteger(
      input.combinationWarningLimit,
      DEFAULT_COMBINATION_WARNING_LIMIT
    ),
  };
}

function shouldStopSearch(stats, options, startedAt) {
  if (getNow() - startedAt >= options.maxTimeMs) return 'max-time';
  if (options.maxStates && stats.searchedStates >= options.maxStates) {
    return 'max-states';
  }
  if (
    options.maxCombinations &&
    stats.combinationsConsidered >= options.maxCombinations
  ) {
    return 'max-combinations';
  }

  return null;
}

function searchAdditionalSolutions({
  model,
  options,
  metadata,
  solutions,
  solutionKeys,
  preferredWallKeys,
  startedAt,
  reportProgress,
}) {
  const seenStates = new Set(['']);
  const stack = [new Set()];

  while (stack.length > 0 && !hasReachedSolutionTarget(solutions, options)) {
    const stopReason = shouldStopSearch(metadata, options, startedAt);
    if (stopReason) {
      metadata.capped = true;
      metadata.capReason = stopReason;
      metadata.tooManyCombinations =
        metadata.tooManyCombinations || stopReason === 'max-combinations';
      break;
    }

    const wallKeys = stack.pop();
    metadata.searchedStates++;
    if (reportProgress) reportProgress('searching path states');

    const pathResult = findShortestPath(model, wallKeys);

    if (!pathResult) {
      continue;
    }

    if (pathResult.distance > options.endDistance) {
      const solutionKey = createStateKey(wallKeys);

      if (!solutionKeys.has(solutionKey)) {
        solutionKeys.add(solutionKey);
        solutions.push({
          wallKeys: new Set(wallKeys),
          distance: pathResult.distance,
          source: 'path-search',
        });
        if (reportProgress) reportProgress('solution found', true);
      }

      continue;
    }

    if (wallKeys.size >= options.wallBudget) continue;

    const candidates = getCandidateWallKeys(pathResult, model, wallKeys, {
      candidateLimit: options.candidateLimit,
      preferredWallKeys,
    });

    for (let index = candidates.length - 1; index >= 0; index--) {
      const stopReason = shouldStopSearch(metadata, options, startedAt);
      if (stopReason) {
        metadata.capped = true;
        metadata.capReason = stopReason;
        metadata.tooManyCombinations =
          metadata.tooManyCombinations || stopReason === 'max-combinations';
        return;
      }

      const nextWalls = new Set(wallKeys);
      nextWalls.add(candidates[index]);

      const stateKey = createStateKey(nextWalls);
      if (seenStates.has(stateKey)) continue;

      seenStates.add(stateKey);
      metadata.combinationsConsidered++;
      stack.push(nextWalls);
    }
  }

  if (hasReachedSolutionTarget(solutions, options)) {
    metadata.maxSolutionsReached = true;
  }
}

function addVerifiedSolution(model, options, solutions, solutionKeys, wallKeys, source) {
  if (hasReachedSolutionTarget(solutions, options)) return false;
  if (!wallKeys || wallKeys.length > options.wallBudget) return false;

  const wallSet = new Set(wallKeys);
  if (wallSet.size > options.wallBudget) return false;

  for (const key of wallSet) {
    if (!isWallableKey(model, key)) return false;
  }

  const pathResult = findShortestPath(model, wallSet);
  if (!pathResult || pathResult.distance <= options.endDistance) return false;

  const solutionKey = createStateKey(wallSet);
  if (solutionKeys.has(solutionKey)) return false;

  solutionKeys.add(solutionKey);
  solutions.push({
    wallKeys: wallSet,
    distance: pathResult.distance,
    source,
  });

  return true;
}

function getCampaignSeedTargetCount(options) {
  return Number.isFinite(options.maxSolutions) ? options.maxSolutions : 24;
}

function hasReachedSolutionTarget(solutions, options) {
  return solutions.length >= getCampaignSeedTargetCount(options);
}

function createCampaignSeedSignature(model, options) {
  const permanentWallHash = hashText(
    [...model.permanentWallKeys].sort(compareNodeKeys).join('|')
  );

  return [
    model.rows,
    model.columns,
    model.startKey,
    model.endKey,
    options.wallBudget,
    options.endDistance,
    permanentWallHash,
  ].join(':');
}

function parseCampaignSeedSignature(signature) {
  const [
    rows,
    columns,
    startKey,
    endKey,
    wallBudget,
    endDistance,
    permanentWallHash,
  ] = String(signature).split(':');

  return {
    rows: Number(rows),
    columns: Number(columns),
    startKey,
    endKey,
    wallBudget: Number(wallBudget),
    endDistance: Number(endDistance),
    permanentWallHash,
  };
}

function getCampaignSeedCandidates(model, options) {
  const currentPermanentWallHash = hashText(
    [...model.permanentWallKeys].sort(compareNodeKeys).join('|')
  );

  return Object.entries(CAMPAIGN_SOLVER_SEEDS)
    .map(([signature, seedWallKeys]) => ({
      ...parseCampaignSeedSignature(signature),
      signature,
      seedWallKeys,
    }))
    .filter((candidate) => {
      return (
        candidate.rows === model.rows &&
        candidate.columns === model.columns &&
        candidate.startKey === model.startKey &&
        candidate.endKey === model.endKey &&
        candidate.permanentWallHash === currentPermanentWallHash &&
        candidate.seedWallKeys.length <= options.wallBudget
      );
    })
    .sort((first, second) => {
      const firstExactBudget = first.wallBudget === options.wallBudget ? 0 : 1;
      const secondExactBudget =
        second.wallBudget === options.wallBudget ? 0 : 1;

      if (firstExactBudget !== secondExactBudget) {
        return firstExactBudget - secondExactBudget;
      }

      const firstEndDistanceGap = Math.abs(
        first.endDistance - options.endDistance
      );
      const secondEndDistanceGap = Math.abs(
        second.endDistance - options.endDistance
      );

      if (firstEndDistanceGap !== secondEndDistanceGap) {
        return firstEndDistanceGap - secondEndDistanceGap;
      }

      if (first.seedWallKeys.length !== second.seedWallKeys.length) {
        return first.seedWallKeys.length - second.seedWallKeys.length;
      }

      return first.signature.localeCompare(second.signature);
    });
}

function getManhattanNeighbourKeys(model, key, radius) {
  const { row, col } = parseSandboxNodeKey(key);
  const neighbourKeys = [];

  for (let rowOffset = -radius; rowOffset <= radius; rowOffset++) {
    for (let colOffset = -radius; colOffset <= radius; colOffset++) {
      if (Math.abs(rowOffset) + Math.abs(colOffset) > radius) continue;
      if (rowOffset === 0 && colOffset === 0) continue;

      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;

      if (
        nextRow < 0 ||
        nextRow >= model.rows ||
        nextCol < 0 ||
        nextCol >= model.columns
      ) {
        continue;
      }

      neighbourKeys.push(getSandboxNodeKey(nextRow, nextCol));
    }
  }

  return neighbourKeys;
}

function createNeighbourCampaignSeedSets(model, seedWallKeys, limit) {
  const seedSet = new Set(seedWallKeys);
  const seedSets = [];
  const seenSeedKeys = new Set([createStateKey(seedSet)]);

  for (
    let radius = 1;
    radius <= 2 && seedSets.length < limit;
    radius++
  ) {
    for (const seedKey of seedWallKeys) {
      for (const replacementKey of getManhattanNeighbourKeys(model, seedKey, radius)) {
        if (!isWallableKey(model, replacementKey)) continue;

        const nextSeed = seedWallKeys.map((key) =>
          key === seedKey ? replacementKey : key
        );
        const nextSeedSet = new Set(nextSeed);
        if (nextSeedSet.size !== seedWallKeys.length) continue;

        const seedSetKey = createStateKey(nextSeedSet);
        if (seenSeedKeys.has(seedSetKey)) continue;

        seenSeedKeys.add(seedSetKey);
        seedSets.push([...nextSeedSet].sort(compareNodeKeys));
        if (seedSets.length >= limit) return seedSets;
      }
    }
  }

  return seedSets;
}

function isDistanceJumpNode(node) {
  return (
    node &&
    !node.isWall &&
    !node.isPermanentWall &&
    Number.isFinite(Number(node.distance))
  );
}

function createDistanceJumpCampaignSeedSets(model, options, grid, limit) {
  if (!isGridLike(grid)) return [];

  const constraints = [];
  const constraintKeys = new Set();

  for (let row = 0; row < model.rows; row++) {
    for (let col = 0; col < model.columns; col++) {
      const node = grid[row]?.[col];
      if (!isDistanceJumpNode(node)) continue;

      [
        grid[row + 1]?.[col],
        grid[row]?.[col + 1],
      ].forEach((neighbour) => {
        if (!isDistanceJumpNode(neighbour)) return;
        if (Math.abs(Number(node.distance) - Number(neighbour.distance)) <= 1) {
          return;
        }

        const firstKey = getSandboxNodeKey(node.row, node.col);
        const secondKey = getSandboxNodeKey(neighbour.row, neighbour.col);
        const candidates = [firstKey, secondKey].filter((key) =>
          isWallableKey(model, key)
        );

        if (candidates.length === 0) return;

        const constraintKey = candidates.sort(compareNodeKeys).join('|');
        if (constraintKeys.has(constraintKey)) return;

        constraintKeys.add(constraintKey);
        constraints.push(candidates);
      });
    }
  }

  if (constraints.length === 0 || constraints.length > 40) return [];

  const frequency = new Map();
  constraints.forEach((constraint) => {
    constraint.forEach((key) => {
      frequency.set(key, (frequency.get(key) || 0) + 1);
    });
  });

  constraints.sort((first, second) => {
    if (first.length !== second.length) return first.length - second.length;

    const firstFrequency = first.reduce(
      (total, key) => total + (frequency.get(key) || 0),
      0
    );
    const secondFrequency = second.reduce(
      (total, key) => total + (frequency.get(key) || 0),
      0
    );

    return secondFrequency - firstFrequency;
  });

  const seedSets = [];
  const seenSeedKeys = new Set();
  const chosen = new Set();

  function visit(constraintIndex) {
    if (seedSets.length >= limit || chosen.size > options.wallBudget) return;

    while (
      constraintIndex < constraints.length &&
      constraints[constraintIndex].some((key) => chosen.has(key))
    ) {
      constraintIndex++;
    }

    if (constraintIndex >= constraints.length) {
      const seedSetKey = createStateKey(chosen);
      if (!seenSeedKeys.has(seedSetKey)) {
        seenSeedKeys.add(seedSetKey);
        seedSets.push([...chosen].sort(compareNodeKeys));
      }
      return;
    }

    const candidates = [...constraints[constraintIndex]].sort((first, second) => {
      const firstFrequency = frequency.get(first) || 0;
      const secondFrequency = frequency.get(second) || 0;

      if (firstFrequency !== secondFrequency) {
        return secondFrequency - firstFrequency;
      }

      return compareNodeKeys(first, second);
    });

    for (const candidate of candidates) {
      chosen.add(candidate);
      visit(constraintIndex + 1);
      chosen.delete(candidate);

      if (seedSets.length >= limit) return;
    }
  }

  visit(0);
  return seedSets;
}

function addCampaignSeedSolutions({
  model,
  options,
  metadata,
  solutions,
  solutionKeys,
  grid,
  reportProgress,
}) {
  const seedCandidates = getCampaignSeedCandidates(model, options);

  if (seedCandidates.length === 0) return false;

  const targetCount = getCampaignSeedTargetCount(options);
  let addedCount = 0;

  function tryAddSeed(wallKeys, source) {
    if (solutions.length >= targetCount) return false;

    const added = addVerifiedSolution(
      model,
      options,
      solutions,
      solutionKeys,
      wallKeys,
      source
    );

    if (added) {
      addedCount++;
      if (reportProgress) reportProgress('solution found', true);
    }

    return added;
  }

  seedCandidates.forEach((candidate) => {
    if (solutions.length >= targetCount) return;

    const isExactCampaignSeed =
      candidate.wallBudget === options.wallBudget &&
      candidate.endDistance === options.endDistance;

    tryAddSeed(
      candidate.seedWallKeys,
      isExactCampaignSeed ? 'campaign-seed' : 'campaign-compatible-seed'
    );
  });

  if (solutions.length < targetCount) {
    const distanceJumpSeedSets = createDistanceJumpCampaignSeedSets(
      model,
      options,
      grid,
      targetCount * 8
    );

    distanceJumpSeedSets.forEach((seedSet) => {
      tryAddSeed(seedSet, 'campaign-distance-seed');
    });
  }

  seedCandidates.forEach((candidate) => {
    if (solutions.length >= targetCount) return;

    const neighbourSeedSets = createNeighbourCampaignSeedSets(
      model,
      candidate.seedWallKeys,
      targetCount * 8
    );

    neighbourSeedSets.forEach((seedSet) => {
      tryAddSeed(seedSet, 'campaign-neighbour-seed');
    });
  });

  if (addedCount > 0) {
    metadata.campaignSeedMatched = true;
    metadata.campaignSeedSolutionCount = addedCount;
    metadata.campaignSeedCandidateCount = seedCandidates.length;
    metadata.bestPathDistance = solutions[solutions.length - 1].distance;
    metadata.bestWallCount = solutions[solutions.length - 1].wallKeys.size;
  }

  return addedCount > 0;
}

function buildFoundMessage(solutionCount, metadata) {
  const suffix = solutionCount === 1 ? '' : 's';
  const cappedSeconds = (metadata.maxTimeMs / 1000).toFixed(
    metadata.maxTimeMs < 1000 ? 1 : 0
  );

  if (metadata.capped) {
    if (metadata.capReason === 'max-time') {
      return `Found ${solutionCount} verified solution${suffix}. Search stopped after ${cappedSeconds} seconds.`;
    }

    if (metadata.capReason === 'max-combinations') {
      return `Found ${solutionCount} verified solution${suffix}. The search space is large, so live search stopped after the strongest candidates.`;
    }

    return `Found ${solutionCount} verified solution${suffix}. Live search stopped to keep the game responsive.`;
  }

  return `Found ${solutionCount} verified solution${suffix}.`;
}

export function findSandboxWallSolutions(input = {}) {
  const startedAt = getNow();
  const options = normaliseSearchOptions(input);
  const model = createSandboxSolverModel(input);
  const metadata = createEmptyMetadata(model, options, startedAt);
  const solutions = [];
  const solutionKeys = new Set();
  const reportProgress = createProgressReporter(
    input,
    metadata,
    solutions,
    options,
    startedAt
  );
  const finish = (status, message) => {
    reportProgress('complete', true);
    return createResult(status, solutions, message, metadata, startedAt);
  };

  reportProgress('starting', true);

  if (!model.isValid) {
    return finish(
      'invalid',
      'Provide grid dimensions, start, and end nodes before solving.'
    );
  }

  if (model.startKey === model.endKey) {
    return finish(
      'no-solution',
      'Start and end are the same node, so the missile reaches the target immediately.'
    );
  }

  if (options.endDistance === null) {
    return finish(
      'invalid',
      'Set an end distance before using the solver overlay.'
    );
  }

  const initialPath = findShortestPath(model);
  metadata.initialPathDistance = initialPath?.distance ?? null;
  metadata.combinationEstimate = estimateCombinationCount(
    model.wallableNodeCount,
    options.wallBudget,
    options.combinationWarningLimit
  );
  metadata.tooManyCombinations =
    metadata.combinationEstimate > options.combinationWarningLimit;

  if (!initialPath) {
    return finish(
      'no-solution',
      'Current walls block every path. The missile must still have a path to avoid alerting the enemy.'
    );
  }

  if (initialPath.distance > options.endDistance) {
    addVerifiedSolution(model, options, solutions, solutionKeys, [], 'already-safe');
    reportProgress('solution found', true);
    return finish(
      'already-safe',
      `No extra walls needed. The current shortest path is ${initialPath.distance}, which is beyond the end distance of ${options.endDistance}.`
    );
  }

  if (options.wallBudget <= 0) {
    return finish(
      'no-solution',
      `Set a wall limit above zero. The current shortest path is ${initialPath.distance}, so the missile still reaches the target within ${options.endDistance}.`,
    );
  }

  addCampaignSeedSolutions({
    model,
    options,
    metadata,
    solutions,
    solutionKeys,
    grid: input.grid || input.nodes,
    reportProgress,
  });

  if (!hasReachedSolutionTarget(solutions, options)) {
    searchDistanceJumpSolutions({
      model,
      options,
      metadata,
      solutions,
      solutionKeys,
      grid: input.grid || input.nodes,
      reportProgress,
    });
  }

  if (
    solutions.length > 0 &&
    (metadata.campaignSeedMatched || metadata.distanceJumpSolutionCount)
  ) {
    return finish(
      metadata.capped ? 'limited' : 'solved',
      buildFoundMessage(solutions.length, metadata)
    );
  }

  if (!hasReachedSolutionTarget(solutions, options)) {
    searchShortestLayerCutSolutions({
      model,
      options,
      metadata,
      solutions,
      solutionKeys,
      startedAt,
      reportProgress,
    });
  }

  if (
    !hasReachedSolutionTarget(solutions, options) &&
    shouldStopSearch(metadata, options, startedAt) === null
  ) {
    searchDangerCutSolutions({
      model,
      options,
      metadata,
      solutions,
      solutionKeys,
      startedAt,
      reportProgress,
    });
  }

  if (
    !hasReachedSolutionTarget(solutions, options) &&
    shouldStopSearch(metadata, options, startedAt) === null
  ) {
    searchGreedyBeamSolutions({
      model,
      options,
      metadata,
      solutions,
      solutionKeys,
      startedAt,
      reportProgress,
    });
  }

  if (
    !hasReachedSolutionTarget(solutions, options) &&
    shouldStopSearch(metadata, options, startedAt) === null
  ) {
    searchCegarSolutions({
      model,
      options,
      metadata,
      solutions,
      solutionKeys,
      startedAt,
      reportProgress,
    });
  }

  if (solutions.length === 0) {
    const cappedSeconds = (metadata.maxTimeMs / 1000).toFixed(
      metadata.maxTimeMs < 1000 ? 1 : 0
    );
    const status = metadata.capped ? 'limited' : 'no-solution';
    const message = metadata.capped
      ? `No verified solution was found before the ${cappedSeconds} second search limit. Try a higher wall limit or simplify the permanent walls.`
      : `No verified solution found within ${options.wallBudget} wall${
          options.wallBudget === 1 ? '' : 's'
        }. The missile still reaches the target within ${options.endDistance}, or the attempted walls block every path.`;

    return finish(
      status,
      message,
    );
  }

  const status = metadata.capped ? 'limited' : 'solved';

  return finish(
    status,
    buildFoundMessage(solutions.length, metadata)
  );
}
