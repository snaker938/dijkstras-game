import { dijkstra } from "../algorithms/dijkstra";
import { animateAllNodes } from "./Animations";

// This function resets all the nodes to the default class
export function resetAllNodes(grid) {
  for (const row of grid) {
    for (const node of row) {
      let specialClass = "";
      if (node.isWall) specialClass = "node-wall";
      if (node.isStart) specialClass = "node-start";
      if (node.isEnd) specialClass = "node-end";
      node.distance = Infinity;
      node.previousNode = null;
      document.getElementById(
        `node-${node.row}-${node.col}`
      ).className = `node ${specialClass}`;
      document.getElementById(
        `node-${node.row}-${node.col}`
      ).innerHTML = `&nbsp`; // sets inner html to a blank space. This will remove the distance showing on the node
    }
  }
}

// Starts the dijkstra algorithm. It calls dijkstra.js to find the visited nodes in order
export function startDijkstra(
  currentGrid,
  endRow,
  endCol,
  startRow,
  startCol,
  numRows,
  numCols
) {
  // gets the current state of the grid at the time of the button being pressed
  const current_endNode = currentGrid[endRow][endCol];
  const current_startNode = currentGrid[startRow][startCol]; // gets the start and end nodes
  const dijkstraOutputs = dijkstra(
    currentGrid,
    current_startNode,
    current_endNode,
    numRows,
    numCols
  ); // calls dijkstra to get the shortest path to the end node
  let triedNodes = dijkstraOutputs[0];
  let pathFound = dijkstraOutputs[2];
  if (pathFound) {
    // If there is a path, animate all the nodes and then the shortest path
    let shortestNodePathOrder = dijkstraOutputs[0];
    let allNodes = dijkstraOutputs[1];
    animateAllNodes(allNodes, shortestNodePathOrder);
  } else {
    // If there is no path, animate the "NO-PATH" error message, along with the remaining nodes to create a very cool error message.
    animateAllNodes(triedNodes, []);
  }
}
