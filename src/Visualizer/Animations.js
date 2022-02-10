import { sendError } from './errorHandling';
import { cloneVariable } from './Visualizer';

export function animateAllNodes(visitedNodesInOrder, nodesInShortestPathOrder) {
  // First, toggle the classlist of the homebutton to remove the "enabled" class. This means that animations are playing.
  document.getElementById('homeButton').classList.remove('enabled');
  for (let i = 0; i <= visitedNodesInOrder.length; i++) {
    if (i === visitedNodesInOrder.length) {
      if (nodesInShortestPathOrder.length === 0) {
        setTimeout(() => {
          sendError('NO-PATH'); // If there is no path, animate the "NO-PATH" error message, along with the remaining nodes to create a very cool error message.
          return;
        }, 8 * i); //used to be 8
      }
      // These lines of code run once all the nodes have been animated- because once they have all been animated, the shortest path needs to be animated
      setTimeout(() => {
        animateShortestPath(nodesInShortestPathOrder);
      }, 8 * i); //used to be 8
      return;
    }
    setTimeout(() => {
      // This animates all the visited nodes, including the start node. It also adds the distance to the nodes so you can clearly see the algorithm working
      const node = visitedNodesInOrder[i];
      document.getElementById(`node-${node.row}-${node.col}`).className =
        'node node-visited';
      document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
        visitedNodesInOrder[i].distance;
    }, 6 * i); // used to be 6
  }
}

// This function animates the shortest path, including the start AND end nodes. It also adds the distance to the nodes. It is called AFTER all the other nodes have been animated.
export function animateShortestPath(nodesInShortestPathOrder) {
  let endIndex = Infinity; // endIndex is Infinity if the distance is never > 70
  for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
    if (nodesInShortestPathOrder[i].distance > 75) {
      endIndex = i;
      break;
    }
  }
  for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
    setTimeout(() => {
      if (
        nodesInShortestPathOrder[i].distance > 75 &&
        i === nodesInShortestPathOrder.length - 1
      ) {
        endTrail(
          endIndex,
          nodesInShortestPathOrder,
          cloneVariable(cloneVariable(endIndex))
        );
      } else if (i < endIndex) {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
        document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
          nodesInShortestPathOrder[i].distance;
        if (i === nodesInShortestPathOrder.length - 1) {
          document.getElementById('homeButton').classList.add('enabled');
        } // add the removed class. Animation has finished.
      }
    }, 80 * i); // used to be 6 or 120
  }
}

const endTrail = function func(endIndex, nodesInShortestPathOrder, count) {
  // if (endTrail.fired) return;
  // endTrail.fired = true;
  for (let x = endIndex - 1; x >= 0; x--) {
    if (x === endIndex - 1) {
      const node = nodesInShortestPathOrder[x];
      document.getElementById(`node-${node.row}-${node.col}`).className =
        'node node-ended-head';
      document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
        nodesInShortestPathOrder[x].distance;
    } else {
      setTimeout(() => {
        // Used [count - 2 - x] for the index as the setTimout reverses the for loop, so instead from starting from endIndex, going to 0, it starts from 0 to endIndex. The count - 2 - x, reverses this reversal, so the nodes are selected from the top down, like it should be.
        const node = nodesInShortestPathOrder[count - 2 - x];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-ended-body';
        if (x === endIndex - 2) {
          document.getElementById('homeButton').classList.add('enabled');
        } // add the removed class. Animation has finished.
      }, 10 * x);
    }
  }
};

// This function animates the error message if there is no proper path.
export function animateNoProperPath(errorMessage, otherNodes) {
  // This for loop animates all the nodes that display the actual error message

  for (let i = 0; i < errorMessage.length; i++) {
    setTimeout(() => {
      const node = errorMessage[i];
      document.getElementById(`node-${node.row}-${node.col}`).className =
        'node node-error';
    }, 1.2 * i);
  }

  // This for loop animates the other nodes in the message- ie. all the nodes that are not the actual, error message
  for (let i = 0; i < otherNodes.length; i++) {
    // First, toggle the classlist of the homebutton to remove the "enabled" class. This means that animations are playing.
    document.getElementById('homeButton').classList.remove('enabled');
    setTimeout(() => {
      const node = otherNodes[i];
      document.getElementById(`node-${node.row}-${node.col}`).className =
        'node node-error-other';
      if (i === otherNodes.length - 1) {
        document.getElementById('homeButton').classList.add('enabled');
      } // add the removed class. Animation has finished.
    }, 1 * i);
  }
}

// setTimeout(() => {
//   if (x === endIndex - 1) {
//     const node = nodesInShortestPathOrder[x];
//     document.getElementById(`node-${node.row}-${node.col}`).className =
//       'node node-ended-head';
//     document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
//       nodesInShortestPathOrder[x].distance;
//   } else {
//     setTimeout(() => {
//       // Used [count - 2 - x] for the index as the setTimout reverses the for loop, so instead from starting from endIndex, going to 0, it starts from 0 to endIndex. The count - 2 - x, reverses this reversal, so the nodes are selected from the top down, like it should be.
//       const node = nodesInShortestPathOrder[count - 2 - x];
//       document.getElementById(`node-${node.row}-${node.col}`).className =
//         'node node-ended-body';
//     }, 7 * x);
//   }
// }, 20 * x); // used to be 6 or 120
