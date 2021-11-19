let NUM_ROWS, NUM_COLUMNS;

export function dijkstra(grid, startNode, endNode, NUM_ROWSS, NUM_COLUMNSS) {
  NUM_ROWS = NUM_ROWSS;
  NUM_COLUMNS = NUM_COLUMNSS;

  // if (startNode.row > endNode.row) {
  //   let temp_row = startNode.row;
  //   let temp_col = startNode.col;
  //   startNode.row = endNode.row;
  //   startNode.col = endNode.col;
  //   endNode.row = temp_row;
  //   endNode.col = temp_col;
  // }

  let visitedNodesInOrder = [];
  startNode.distance = 0;
  let currentNode = startNode;
  let allUnvisitedNodes = getAllNodes(grid);
  visitedNodesInOrder.push(startNode);
  // allUnvisitedNodes[0].distance = 0
  while (allUnvisitedNodes.length !== 0) {
    // console.log(currentNode);
    if (currentNode.isEnd) {
      console.log("end reached...");
      let shortestNodePathOrder = getShortestPathNodeOrder(endNode, startNode);
      return [shortestNodePathOrder, visitedNodesInOrder];
    }

    // console.log("yep");
    if (currentNode.isWall) {
      console.log("i am wall");
      currentNode = allUnvisitedNodes.shift();
      console.log(currentNode);
      continue;
    }
    let neighboursOfNode = getNeighboursOfNode(grid, currentNode);
    visitedNodesInOrder.unshift(...neighboursOfNode);

    currentNode = allUnvisitedNodes.shift();
    console.log(currentNode);
  }
  console.log("returning...");
  let shortestNodePathOrder = getShortestPathNodeOrder(endNode, startNode);
  return [shortestNodePathOrder, visitedNodesInOrder];
}

function getNeighboursOfNode(grid, currentNode) {
  let neighboursOfNode = [];
  let row = currentNode.row;
  let column = currentNode.col;
  // console.log(currentNode);

  if (row > 0 && grid[row - 1][column].distance > currentNode.distance) {
    neighboursOfNode.push(grid[row - 1][column]); // get the top neighbour
    // console.log(currentNode, grid[row - 1][column], "top");
  }
  if (
    row < NUM_ROWS - 1 &&
    grid[row + 1][column].distance > currentNode.distance
  ) {
    neighboursOfNode.push(grid[row + 1][column]); // bottom neighbour
    // console.log(currentNode, grid[row + 1][column], "bottom");
  }
  if (column > 0 && grid[row][column - 1].distance > currentNode.distance) {
    neighboursOfNode.push(grid[row][column - 1]); // left neighbour
    // console.log(currentNode, grid[row][column - 1], "left");
  }
  if (
    column < NUM_COLUMNS - 1 &&
    grid[row][column + 1].distance > currentNode.distance
  ) {
    neighboursOfNode.push(grid[row][column + 1]); // right neighbour
    // console.log(currentNode, grid[row][column + 1], "right");
  }
  changeDistancesOfNeighbours(
    neighboursOfNode,
    currentNode.distance,
    currentNode
  );
  return neighboursOfNode;
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
