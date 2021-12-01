import { animateNoProperPath } from "./Animations";
import { resetAllNodes } from "./Visualizer";

// This function is called when there is an error, and it needs to be animated on the grid.
export function sendError(error) {
  const newGrid = loadGridMessage(error); // loads the grid template ie. the error message
  resetAllNodes(newGrid);
  function getImportantNodes(grid) {
    let needed_nodes = [];
    let unneededNodes = [];
    for (const row of grid) {
      for (const node of row) {
        // For each node of the template grid, if it is a wall: ie. it is part of the actual error message, push it to the neeeded nodes array.
        if (node.isWall) {
          needed_nodes.push(node);
        } else unneededNodes.push(node); // if it is not a wall, ie. it is just the background/filler, then it is undeeed, but it still needs to be animated
      }
    }
    return [needed_nodes, unneededNodes];
  }

  let result = getImportantNodes(newGrid); //  this function separates the nodes needed for the actual message, and the ones that "surround" the message
  let needed_nodes = result[0];
  let unneededNodes = result[1];
  animateNoProperPath(needed_nodes, unneededNodes); // animates both the error message, and the background
}

function loadGridMessage(error) {
  // this.removeAllWalls(); // removes all current walls so they dont get in the way
  const json = require(`./templates/${error}.json`); // gets the contents of the json file so the grid can be accessed.
  let newGrid = json.grid;
  return newGrid; // returns the new grid, ie. the grid template that needs to be animated
}
