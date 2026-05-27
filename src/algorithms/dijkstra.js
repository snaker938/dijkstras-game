import { getCurrentDisplayOutlineClass } from '../optionsHandling';

export function dijkstra(grid, startNode, endNode, NUM_ROWS, NUM_COLUMNS) {
  resetAllNodes(grid);

  // This is a list of every single node in the grid
  let allUnvisitedNodes = getAllNodes(grid);

  // This is a list of visited nodes in the order they were visited. It does not include walls.
  let visitedNodes = [];

  let currentNode = startNode;
  let discoveryOrder = 0;

  currentNode.distance = 0;
  currentNode.discoveryOrder = discoveryOrder++;

  // Adds the start node to the visited nodes list
  visitedNodes.push(currentNode);

  while (allUnvisitedNodes.length !== 0) {
    // sorts the allUnvisitedNodes list by distance
    sortNodesByDistance(allUnvisitedNodes);

    // removes the first (closest) node from allUnvisitedNodes, sets to current node
    currentNode = allUnvisitedNodes.shift();

    // Exit the loop if the current node is the end node.
    if (currentNode.isEnd) {
      break;
    }

    // if the current node is a wall, skip through one iteration, stay in the while loop
    if (currentNode.isWall) {
      continue;
    }

    // Update the distances of the neighbours of the current node (sets the previous node ect.)
    updateAllNeighboursOfNode(grid, currentNode, NUM_ROWS, NUM_COLUMNS, () => {
      const nextDiscoveryOrder = discoveryOrder;
      discoveryOrder++;
      return nextDiscoveryOrder;
    });

    if (!currentNode.isWall) {
      // if the current node is not a wall, add it to the list of visitedNodes
      visitedNodes.unshift(currentNode);
      continue;
    }
  }

  // Once the end node has been reached, these lines are run. These lines also run if the end node is not found.
  sortNodesByDistance(visitedNodes); // does a final sort of all the visitedNodes

  // If the end node has not been reached, return the visited nodes and mark the path as invalid.
  if (endNode.distance === Infinity) {
    visitedNodes = visitedNodes.filter((node) => node.distance !== Infinity);
    return [visitedNodes, null, false];
  }

  // If there is a shortest path to the end node: get it
  let shortestNodePathOrder = getShortestPathNodeOrder(endNode);

  // The shortest path, and all the visited nodes in order are returned
  return [shortestNodePathOrder, visitedNodes, true];
}

// This function updates the distances of all the neighbours of the current node
function updateAllNeighboursOfNode(
  grid,
  currentNode,
  NUM_ROWS,
  NUM_COLUMNS,
  getNextDiscoveryOrder
) {
  // holds all the neighbours of the current node. The maximum neighbours is 4. The minimum could be zero. It does not matter if this is left empty at the end of this function
  let neighboursOfNode = [];

  // gets the row and column of the current node
  const { col, row } = currentNode;

  if (row > 0 && grid[row - 1][col].distance > currentNode.distance + 1)
    // If the row is bigger than 0 (ie. not zero), then the current node has a top neighbour. If this top neighbour has a bigger distance that the current node distance (ie. it has infinity usually), then this code is run. This means that the algorithm does not add neighbours more than once.
    neighboursOfNode.push(grid[row - 1][col]); // top neighbour

  if (
    row < NUM_ROWS - 1 &&
    grid[row + 1][col].distance > currentNode.distance + 1
  )
    // If the row is smaller than the total number of rows (index is 1- total number), then the current node has a bottom neighbour. If this bottom neighbour has a bigger distance that the current node distance (ie. it has infinity usually), then this code is run. This means that the algorithm does not add neighbours more than once.
    neighboursOfNode.push(grid[row + 1][col]); // bottom neighbour

  if (
    col < NUM_COLUMNS - 1 &&
    grid[row][col + 1].distance > currentNode.distance + 1
  )
    // If the column is smaller than the total number of columns (index is 1- total number), then the current node has a right neighbour. If this right neighbour has a bigger distance that the current node distance (ie. it has infinity usually), then this code is run. This means that the algorithm does not add neighbours more than once.
    neighboursOfNode.push(grid[row][col + 1]); // right neighbour

  if (col > 0 && grid[row][col - 1].distance > currentNode.distance + 1)
    // If the column is bigger than 0, then the current node has a left neighbour. If this left neighbour has a bigger distance that the current node distance (ie. it has infinity usually), then this code is run. This means that the algorithm does not add neighbours more than once.
    neighboursOfNode.push(grid[row][col - 1]); // left neighbour

  // Once all the neighbours have been added, or there are no neighbours at all, the distances for all the neighbours, if applicable, are changed
  changeDistancesOfNeighbours(
    neighboursOfNode,
    currentNode.distance,
    currentNode,
    getNextDiscoveryOrder
  );

  // Once all the neighbours, if there are any, have had their distances changed, then return back to the original while loop.
  return;
}

// This function changes the distance of all the nodes passed to it. If there are no nodes passed to it, then nothing will happen, and we will return back to the original while loop.
function changeDistancesOfNeighbours(
  neighboursOfNode,
  currentNodeDistance,
  currentNode,
  getNextDiscoveryOrder
) {
  for (let neighbour of neighboursOfNode) {
    // This bit of code is iterated through for every single item in the neighboursOfNode array. This means, that if it is empty, it will not run.
    neighbour.distance = currentNodeDistance + 1; // Sets the distance of all the neighbours, to the current node plus 1. This allows us the find the shortest path later on.
    neighbour.previousNode = currentNode; // Links each node to the one before it, so the final path can be rebuilt from end to start.
    neighbour.discoveryOrder = getNextDiscoveryOrder();
  }
  return;
}
// This function is called after the end node has been reached.
function getShortestPathNodeOrder(endNode) {
  let shortestNodePathOrder = [];
  let currentNode = endNode;

  // Backtrack through previousNode links until the start node is reached.
  while (currentNode !== null) {
    // Add each node to the front so the path ends up ordered from start to end.
    shortestNodePathOrder.unshift(currentNode);
    // Move one step backwards along the reconstructed shortest path.
    currentNode = currentNode.previousNode;
  }

  shortestNodePathOrder.shift(); //removes start node to stop it from being animated
  shortestNodePathOrder.pop(); //removes ends node to stop it from being animated

  return shortestNodePathOrder;
}

// This function sorts all the node passed to it by their distance.
function sortNodesByDistance(nodesToBeSorted) {
  nodesToBeSorted.sort((node1, node2) => {
    if (node1.distance !== node2.distance) {
      return node1.distance - node2.distance;
    }

    const node1DiscoveryOrder = Number.isFinite(node1.discoveryOrder)
      ? node1.discoveryOrder
      : Infinity;
    const node2DiscoveryOrder = Number.isFinite(node2.discoveryOrder)
      ? node2.discoveryOrder
      : Infinity;

    if (node1DiscoveryOrder !== node2DiscoveryOrder) {
      return node1DiscoveryOrder - node2DiscoveryOrder;
    }

    if (node1.row !== node2.row) return node1.row - node2.row;
    return node1.col - node2.col;
  });
}

// This function gets every single node on the grid- whether it is a wall, start or end node ect.
function getAllNodes(grid) {
  const allNodes = [];

  for (const row of grid) {
    for (const node of row) {
      allNodes.push(node);
    }
  }
  return allNodes;
}

// This function resets all the nodes to the default class
function resetAllNodes(grid) {
  for (const row of grid) {
    for (const node of row) {
      let needClassAdded = false;
      if (
        document
          .getElementById(`node-${node.row}-${node.col}`)
          .classList.contains('node-unwallable')
      )
        needClassAdded = true;
      let specialClass = '';
      if (node.isRandomWall)
        specialClass = 'node-wall node-permanent-wall node-random-wall';
      else if (node.isPermanentWall)
        specialClass = 'node-wall node-permanent-wall';
      else if (node.isWall) specialClass = 'node-wall';
      if (node.isStart) specialClass = 'node-start';
      if (node.isEnd) specialClass = 'node-end';
      node.distance = Infinity;
      node.previousNode = null;
      node.discoveryOrder = Infinity;
      const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
      const showNodeNumberClass = nodeElement?.classList.contains(
        'node-show-number'
      )
        ? ' node-show-number'
        : '';
      nodeElement.className = `${getCurrentDisplayOutlineClass()} ${specialClass}${showNodeNumberClass}`;
      const nodeNumberLabel = nodeElement?.querySelector('.node-number-label');
      if (nodeNumberLabel) nodeNumberLabel.textContent = '';
      else if (nodeElement) nodeElement.innerHTML = `&nbsp`;
      if (needClassAdded)
        document
          .getElementById(`node-${node.row}-${node.col}`)
          .classList.add('node-unwallable');
    }
  }
}
