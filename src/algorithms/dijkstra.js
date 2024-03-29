import { getCurrentDisplayOutlineClass } from '../optionsHandling';

export function dijkstra(grid, startNode, endNode, NUM_ROWS, NUM_COLUMNS) {
  resetAllNodes(grid);

  // This is a list of every single node in the grid
  let allUnvisitedNodes = getAllNodes(grid);

  // This is a list of visitied nodes in the order they were visited. Doesnt include walls
  let visitedNodes = [];

  let currentNode = startNode;

  currentNode.distance = 0;

  // Adds the start node to the visited nodes list
  visitedNodes.push(currentNode);

  while (allUnvisitedNodes.length !== 0) {
    // sorts the allUnvisitedNodes list by distance
    sortNodesByDistance(allUnvisitedNodes);

    // removes the first (closest) node from allUnvisitedNodes, sets to current node
    currentNode = allUnvisitedNodes.shift();

    // exit the while loop if the current node is the EndNode
    if (currentNode.isEnd) {
      break;
    }

    // if the current node is a wall, skip through one iteration, stay in the while loop
    if (currentNode.isWall) {
      continue;
    }

    // Update the distances of the neighbours of the current node (sets the previous node ect.)
    updateAllNeighboursOfNode(grid, currentNode, NUM_ROWS, NUM_COLUMNS);

    if (!currentNode.isWall) {
      // if the current node is not a wall, add it to the list of visitedNodes
      visitedNodes.unshift(currentNode);
      continue;
    }
  }

  // Once the end node has been reached, these lines are run. These lines also run if the end node is not found.
  sortNodesByDistance(visitedNodes); // does a final sort of all the visitedNodes

  // If the endnode has not been reached (ie. it has a distance of Infinity, which is the default value), set the shortest path to be the visited nodes, and return false
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
function updateAllNeighboursOfNode(grid, currentNode, NUM_ROWS, NUM_COLUMNS) {
  // holds all the neighbours of the current node. The maximum neighbours is 4. The minimum could be zero. It does not matter if this is left empty at the end of this function
  let neighboursOfNode = [];

  // gets the row and column of the current node
  const { col, row } = currentNode;

  if (row > 0 && grid[row - 1][col].distance > currentNode.distance)
    // If the row is bigger than 0 (ie. not zero), then the current node has a top neighbour. If this top neighbour has a bigger distance that the current node distance (ie. it has infinity usually), then this code is run. This means that the algorithm does not add neighbours more than once.
    neighboursOfNode.unshift(grid[row - 1][col]); // top neighbour

  if (row < NUM_ROWS - 1 && grid[row + 1][col].distance > currentNode.distance)
    // If the row is smaller than the total number of rows (index is 1- total number), then the current node has a bottom neighbour. If this bottom neighbour has a bigger distance that the current node distance (ie. it has infinity usually), then this code is run. This means that the algorithm does not add neighbours more than once.
    neighboursOfNode.unshift(grid[row + 1][col]); // bottom neighbour

  if (col > 0 && grid[row][col - 1].distance > currentNode.distance)
    // If the column is bigger than 0, then the current node has a left neighbour. If this left neighbour has a bigger distance that the current node distance (ie. it has infinity usually), then this code is run. This means that the algorithm does not add neighbours more than once.
    neighboursOfNode.unshift(grid[row][col - 1]); // left neighbour

  if (
    col < NUM_COLUMNS - 1 &&
    grid[row][col + 1].distance > currentNode.distance
  )
    // If the column is smaller than the total number of columns (index is 1- total number), then the current node has a right neighbour. If this right neighbour has a bigger distance that the current node distance (ie. it has infinity usually), then this code is run. This means that the algorithm does not add neighbours more than once.
    neighboursOfNode.unshift(grid[row][col + 1]); // right neighbour

  // Once all the neighbours have been added, or there are no neighbours at all, the distances for all the neighbours, if applicable, are changed
  changeDistancesOfNeighbours(
    neighboursOfNode,
    currentNode.distance,
    currentNode
  );

  // Once all the neighbours, if there are any, have had their distances changed, then return back to the original while loop.
  return;
}

// This function changes the distance of all the nodes passed to it. If there are no nodes passed to it, then nothing will happen, and we will return back to the original while loop.
function changeDistancesOfNeighbours(
  neighboursOfNode,
  currentNodeDistance,
  currentNode
) {
  for (let neighbour of neighboursOfNode) {
    // This bit of code is iterated through for every single item in the neighboursOfNode array. This means, that if it is empty, it will not run.
    neighbour.distance = currentNodeDistance + 1; // Sets the distance of all the neighbours, to the current node plus 1. This allows us the find the shortest path later on.
    neighbour.previousNode = currentNode; // This will set the previous node of the neighbour to the current node. This is effectively a linked list, as all the items have a pointer that links to its previous node- regardles of their position in the array. This also allows us to backtrack from the end node, back to the start node, by following these previous nodes- untill the previous node is the start node, and this will be our shortest path.
  }
  return;
}

// This function will only work once every node up untill the end node has been updated. This function will infact never be called if the end node is not accessible.
function getShortestPathNodeOrder(endNode) {
  let shortestNodePathOrder = [];
  let currentNode = endNode;

  // This while loop will keep on backtracking through the previous node untill the currentNode is null, which is when we have reached the start node- as the start node has no previous node.
  while (currentNode !== null) {
    // Adds the current node to the shortestPath at the beggining, and the next closest node will be the next item in the array and so forth.
    shortestNodePathOrder.unshift(currentNode);
    // Sets the currentNode to the previous node. This is effectively a linked list, as all the items have a pointer that links to its previous node- regardles of their position in the array. This also allows us to backtrack from the end node, back to the start node, by following these previous nodes- untill the previous node is the start node, and this will be our shortest path.
    currentNode = currentNode.previousNode;
  }

  shortestNodePathOrder.shift(); //removes start node to stop it from being animated
  shortestNodePathOrder.pop(); //removes ends node to stop it from being animated

  return shortestNodePathOrder;
}

// This function sorts all the node passed to it by their distance.
function sortNodesByDistance(nodesToBeSorted) {
  nodesToBeSorted.sort((node1, node2) => node1.distance - node2.distance);
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
      if (node.isPermanentWall) specialClass = 'node-wall node-permanent-wall';
      if (node.isWall && !node.isPermanentWall) specialClass = 'node-wall';
      if (node.isStart) specialClass = 'node-start';
      if (node.isEnd) specialClass = 'node-end';
      node.distance = Infinity;
      node.previousNode = null;
      document.getElementById(
        `node-${node.row}-${node.col}`
      ).className = `${getCurrentDisplayOutlineClass()} ${specialClass}`;
      document.getElementById(
        `node-${node.row}-${node.col}`
      ).innerHTML = `&nbsp`;
      if (needClassAdded)
        document
          .getElementById(`node-${node.row}-${node.col}`)
          .classList.add('node-unwallable');
    }
  }
}
