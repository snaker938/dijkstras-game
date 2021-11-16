export function dijkstra(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  const allNodes = getAllNodes(grid);

  //   console.log(findPathWithDijkstra(startNode, endNode));

  console.log(allNodes);
  console.log(grid);
}

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}
