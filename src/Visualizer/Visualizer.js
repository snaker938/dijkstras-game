import { getActualCurrentEndDistance } from '../actualLeveHandling';
import { dijkstra } from '../algorithms/dijkstra';
import { getCurrentLevelEndDistance } from '../currentLevelHandling';
import { inSandbox } from '../Navigation';
import {
  getDisplayOutlineClass,
  isGridOutlineToggled,
  setHasGridBeenReset,
} from '../optionsHandling';
import { animateAllNodes } from './Animations';

// This function resets all the nodes to the default class
export function resetAllNodes(grid) {
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
      node.previousNode = null;
      const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
      const showNodeNumberClass = nodeElement.classList.contains(
        'node-show-number'
      )
        ? ' node-show-number'
        : '';
      nodeElement.className = `${getDisplayOutlineClass(
        isGridOutlineToggled()
      )} ${specialClass}${showNodeNumberClass}`;
      const nodeNumberLabel = nodeElement.querySelector('.node-number-label');
      if (nodeNumberLabel) nodeNumberLabel.textContent = '';
      else nodeElement.innerHTML = `&nbsp`;
      if (needClassAdded)
        document
          .getElementById(`node-${node.row}-${node.col}`)
          .classList.add('node-unwallable');
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
  if (document.getElementById('homeButton').classList.contains('enabled')) {
    document.getElementById('homeButton').classList.remove('enabled');

    // gets the current state of the grid at the time of the button being pressed
    const current_endNode = currentGrid[endRow][endCol];
    const current_startNode = currentGrid[startRow][startCol]; // gets the start and end nodes

    setHasGridBeenReset(false);

    const dijkstraOutputs = dijkstra(
      currentGrid,
      current_startNode,
      current_endNode,
      numRows,
      numCols
    );

    let triedNodes = dijkstraOutputs[0];
    let pathFound = dijkstraOutputs[2];

    let endDistance;

    if (!inSandbox) endDistance = getCurrentLevelEndDistance();
    else endDistance = getActualCurrentEndDistance();

    if (pathFound) {
      // If there is a path, animate all the nodes and then the shortest path
      let shortestNodePathOrder = dijkstraOutputs[0];
      let allNodes = dijkstraOutputs[1];
      allNodes.shift();
      allNodes.shift();

      animateAllNodes(allNodes, shortestNodePathOrder, Number(endDistance));
    } else {
      // If there is no path, animate the "NO-PATH" error message, along with the remaining nodes to create a very cool error message.
      animateAllNodes(triedNodes, []);
    }
  }
}

// Deep clones the varibale so it does not affect original data
export function cloneVariable(variableData) {
  return JSON.parse(JSON.stringify(variableData));
}
