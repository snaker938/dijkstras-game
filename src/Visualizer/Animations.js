import { sendError } from "./errorHandling";

export function animateAllNodes(visitedNodesInOrder, nodesInShortestPathOrder) {
  for (let i = 0; i <= visitedNodesInOrder.length; i++) {
    if (i === visitedNodesInOrder.length) {
      if (nodesInShortestPathOrder.length === 0) {
        setTimeout(() => {
          sendError("NO-PATH"); // If there us no path, animate the "NO-PATH" error message, along with the remaining nodes to create a very cool error message.
          return;
        }, 8 * i); //used to be 7
      }
      // These lines of code run once all the nodes have been animated- because once they have all been animated, the shortest path needs to be animated
      setTimeout(() => {
        animateShortestPath(nodesInShortestPathOrder);
      }, 8 * i); //used to be 7
      return;
    }
    setTimeout(() => {
      // This animates all the visited nodes, including the start node. It also adds the distance to the nodes so you can clearly see the algorithm working
      const node = visitedNodesInOrder[i];
      document.getElementById(`node-${node.row}-${node.col}`).className =
        "node node-visited";
      document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
        visitedNodesInOrder[i].distance;
    }, 6 * i); // used to be 5
  }
}

// This function animates the shortest path, including the start AND end nodes. It also adds the distance to the nodes. It is called AFTER all the other nodes have been animated.
export function animateShortestPath(nodesInShortestPathOrder) {
  for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
    setTimeout(() => {
      const node = nodesInShortestPathOrder[i];
      document.getElementById(`node-${node.row}-${node.col}`).className =
        "node node-shortest-path";
      document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
        nodesInShortestPathOrder[i].distance;
    }, 6 * i); // used to be 5
  }
}

// This function animates the error message if there is no proper path.
export function animateNoProperPath(errorMessage, otherNodes) {
  // This for loop animates all the nodes that display the actual error message
  for (let i = 0; i < errorMessage.length; i++) {
    setTimeout(() => {
      const node = errorMessage[i];
      document.getElementById(`node-${node.row}-${node.col}`).className =
        "node node-error";
    }, 1.2 * i);
  }

  // This for loop animates the other nodes in the message- ie. all the nodes that are not the actual, error message
  for (let i = 0; i < otherNodes.length; i++) {
    setTimeout(() => {
      const node = otherNodes[i];
      document.getElementById(`node-${node.row}-${node.col}`).className =
        "node node-error-other";
    }, 1 * i);
  }
}
