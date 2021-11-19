export function dijkstra(grid, startNode, endNode, NUM_ROWSS, NUM_COLUMNSS) {
  let NUM_ROWS = NUM_ROWSS;
  let NUM_COLUMNS = NUM_COLUMNSS;

  // if (startNode.row > endNode.row) {
  //   let temp_row = startNode.row;
  //   let temp_col = startNode.col;
  //   startNode.row = endNode.row;
  //   startNode.col = endNode.col;
  //   endNode.row = temp_row;
  //   endNode.col = temp_col;
  // }

  let visitedNodesInOrder = [];
  let otherVisitedNodes = [];
  startNode.distance = 0;
  let currentNode = startNode;
  let allUnvisitedNodes = getAllNodes(grid);
  // visitedNodesInOrder.push(startNode);
  // allUnvisitedNodes[0].distance = 0
  otherVisitedNodes.push(currentNode);
  while (allUnvisitedNodes.length !== 0) {
    sortNodesByDistance(allUnvisitedNodes);
    currentNode = allUnvisitedNodes.shift();
    if (currentNode.isEnd) {
      console.log("end reached...");
      break;
    }

    if (currentNode.isWall) {
      console.log("i am wall");
      currentNode.isVisited = true;
      // currentNode = visitedNodesInOrder.shift();
      continue;
    }
    let neighboursOfNode = getNeighboursOfNode(
      grid,
      currentNode,
      NUM_ROWS,
      NUM_COLUMNS
    );
    if (neighboursOfNode) {
      sortNodesByDistance(neighboursOfNode);
      visitedNodesInOrder.unshift(...neighboursOfNode);
    }

    currentNode.isVisited = true;
    // while (currentNode.isVisited) {
    //   currentNode = visitedNodesInOrder.shift();
    //   otherVisitedNodes.push(currentNode);
    // }

    if (!currentNode.isWall) {
      otherVisitedNodes.unshift(currentNode);
      continue;
    }
  }
  console.log("returning...");
  sortNodesByDistance(otherVisitedNodes);
  if (endNode.distance === Infinity) {
    console.log("no path");
    // let shortestNoPathNoderOrder = getShortestNoPathNodeOrder(
    //   startNode,
    //   endNode
    // );
    return [startNode, otherVisitedNodes];
  }
  let shortestNodePathOrder = getShortestPathNodeOrder(endNode, startNode);
  return [shortestNodePathOrder, otherVisitedNodes];
}

// function getShortestNoPathNodeOrder(startNode, endNode) {
//   let shortestNodePathOrder = [];
//   let currentNode = startNode;
//   console.log(currentNode);
//   while (currentNode.distance === Infinity) {
//     // console.log(currentNode);
//     currentNode = currentNode.previousNode;
//   }
//   while (currentNode !== null) {
//     // console.log(currentNode);
//     shortestNodePathOrder.unshift(currentNode);
//     currentNode = currentNode.previousNode;
//   }
//   shortestNodePathOrder.unshift(startNode);
//   return shortestNodePathOrder;
// }

function getNeighboursOfNode(grid2, currentNode, NUM_ROWS, NUM_COLUMNS) {
  // console.log(currentNode);
  let grid = grid2;
  let neighboursOfNode = [];
  const { col, row } = currentNode;
  // console.log(currentNode);

  if (row > 0 && grid[row - 1][col].distance > currentNode.distance)
    neighboursOfNode.unshift(grid[row - 1][col]); // get the top neighbour
  if (row < NUM_ROWS - 1 && grid[row + 1][col].distance > currentNode.distance)
    neighboursOfNode.unshift(grid[row + 1][col]); // bottom neighbour
  if (col > 0 && grid[row][col - 1].distance > currentNode.distance)
    neighboursOfNode.unshift(grid[row][col - 1]); // left neighbour
  if (
    col < NUM_COLUMNS - 1 &&
    grid[row][col + 1].distance > currentNode.distance
  )
    neighboursOfNode.unshift(grid[row][col + 1]); // right neighbour

  changeDistancesOfNeighbours(
    neighboursOfNode,
    currentNode.distance,
    currentNode
  );
  // sortNodesByDistance(neighboursOfNode);

  // sortNodesByDistance(neighboursOfNode);
  return neighboursOfNode;
}

function sortNodesByDistance(nodes) {
  nodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function changeDistancesOfNeighbours(
  neighboursOfNode,
  currentNodeDistance,
  currentNode
) {
  for (let neighbour of neighboursOfNode) {
    neighbour.distance = currentNodeDistance + 1;
    neighbour.previousNode = currentNode; // update previous node to current node of neighbour
  }
  return;
}

function getAllNodes(grid) {
  const allNodes = [];
  for (const row of grid) {
    for (const node of row) {
      allNodes.push(node);
    }
  }
  return allNodes;
}

function getShortestPathNodeOrder(endNode, startNode) {
  let shortestNodePathOrder = [];
  let currentNode = endNode;
  while (currentNode !== null) {
    // console.log(currentNode);
    shortestNodePathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  shortestNodePathOrder.unshift(startNode);
  return shortestNodePathOrder;
}
