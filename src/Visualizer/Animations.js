import { sendError } from './errorHandling';
import { cloneVariable } from './Visualizer';
import { getCurrentDisplayOutlineClass } from '../actualLevelHandling';
import { inSandbox } from '../Navigation';
import {
  newLevelUnlocked,
  numLevelsUnlocked,
} from '../currentUserDataHandling';
import { currentLevel } from '../currentLevelHandling';

// let endDistance = getCurrentEndDistance();

export function animateAllNodes(
  visitedNodesInOrder,
  nodesInShortestPathOrder,
  endDistance
) {
  // First, toggle the classlist of the homebutton to remove the "enabled" class. This means that animations are playing and so the user cannot go to the home screen
  document.getElementById('homeButton').classList.remove('enabled');
  for (let i = 0; i <= visitedNodesInOrder.length; i++) {
    if (i === visitedNodesInOrder.length) {
      if (nodesInShortestPathOrder.length === 0) {
        setTimeout(() => {
          if (!inSandbox) sendError('NO-PATH');
          // If there is no path, and the user is in the Campaign, animate the "NO-PATH" error message
          else sendError('NO-PATH-SANDBOX'); // If there is no path, and the user is in the Sandbox, animate the "NO-PATH-SANDBOX" error message
          return;
        }, 8 * i); //used to be 8
      }
      // These lines of code run once all the nodes have been animated- because once they have all been animated, the shortest path needs to be animated
      setTimeout(() => {
        animateShortestPath(nodesInShortestPathOrder, Number(endDistance));
      }, 8 * i); //used to be 8
      return;
    }
    setTimeout(() => {
      // This animates all the visited nodes, excluding the start node. It also adds the distance to the nodes so you can clearly see the algorithm working
      const node = visitedNodesInOrder[i];
      document.getElementById(
        `node-${node.row}-${node.col}`
      ).className = `${getCurrentDisplayOutlineClass()} node-visited`;
      document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
        visitedNodesInOrder[i].distance;
    }, 6 * i); // used to be 6
  }
}

// This function animates the shortest path. It also adds the distance to the nodes. It is called AFTER all the other nodes have been animated.
export function animateShortestPath(nodesInShortestPathOrder, endDistance) {
  let endIndex = Infinity; // endIndex is Infinity if the distance is never > specified end distance
  for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
    if (nodesInShortestPathOrder[i].distance > Number(endDistance)) {
      endIndex = i;
      break;
    } else if (
      i === nodesInShortestPathOrder.length - 1 &&
      Number(nodesInShortestPathOrder[i].distance) === Number(endDistance) &&
      i === Number(endDistance) - 1
    ) {
      endIndex = i + 1;
      break;
    }
  }
  // If the missile will end, (the distance is bigger than the distance the missile can travel), loopLength is set to the index of the first node to reach this max distance. This means the program will animate the end animation straight away. Otherwise, loopLength is set to all the nodes, as the missile will reach its end target.
  let loopLength;
  if (endIndex < Infinity) loopLength = endIndex;
  else loopLength = nodesInShortestPathOrder.length;

  for (let i = 0; i < loopLength; i++) {
    setTimeout(() => {
      if (
        // Check that the next node in the shortest path is less than the endDistance, if it isn't, then end the trail as the missile did not reach the end node
        nodesInShortestPathOrder[i].distance >
        Number(endDistance) - 1
      ) {
        // End trail
        endTrail(
          endIndex,
          nodesInShortestPathOrder,
          cloneVariable(cloneVariable(endIndex))
        );
      } else if (i < endIndex) {
        // Actually animate the shortest path by a class to each shortest path node
        const node = nodesInShortestPathOrder[i];
        document.getElementById(
          `node-${node.row}-${node.col}`
        ).className = `${getCurrentDisplayOutlineClass()} node-shortest-path`;
        document.getElementById(
          `node-${node.row}-${node.col}`
        ).innerHTML = `&nbsp`; // Set the html content to empty
        document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
          nodesInShortestPathOrder[i].distance;
        if (i === nodesInShortestPathOrder.length - 1) {
          document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
            nodesInShortestPathOrder[i].distance;
          document.getElementById('homeButton').classList.add('enabled');
        } // add the removed class. Animation has finished.
      }
    }, 80 * i); // used to be 6 or 120
  }
}

const endTrail = function func(endIndex, nodesInShortestPathOrder, count) {
  // This time uses a reversed loop. The animation must play from the "head" of the missile, which is the last index of the array
  for (let x = endIndex - 1; x >= 0; x--) {
    if (x === endIndex - 1) {
      // If, and only if, the current node is the "head" of the missile, give it a special class
      const node = nodesInShortestPathOrder[x];
      document.getElementById(
        `node-${node.row}-${node.col}`
      ).className = `${getCurrentDisplayOutlineClass()} node-ended-head`;
      document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
        nodesInShortestPathOrder[x].distance;
    } else {
      setTimeout(() => {
        // Used [count - 2 - x] for the index as the setTimout reverses the for loop, so instead from starting from endIndex, going to 0, it starts from 0 to endIndex. The count - 2 - x, reverses this reversal, so the nodes are selected from the top down, like it should be.
        const node = nodesInShortestPathOrder[count - 2 - x];

        document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
          count - 1 - x;

        // document.getElementById(
        //   `node-${node.row}-${node.col}`
        // ).innerHTML = `&nbsp`;
        document.getElementById(
          `node-${node.row}-${node.col}`
        ).className = `${getCurrentDisplayOutlineClass()} node-ended-body`;
        if (x === endIndex - 2) {
          if (Number(currentLevel) === Number(numLevelsUnlocked))
            newLevelUnlocked();
          document.getElementById('homeButton').classList.add('enabled');
        } // add the removed class. Animation has finished.
      }, 10 * x);
    }
  }
};

// This function animates the error message if there is no proper path.
export function animateNoProperPath(errorMessage, otherNodes, importantNodes) {
  document.getElementById('homeButton').classList.remove('enabled');
  // This for loop animates all the nodes that display the actual error message

  for (let i = 0; i < importantNodes.length; i++) {
    setTimeout(() => {
      const node = importantNodes[i];
      document.getElementById(
        `node-${node.row}-${node.col}`
      ).className = `${getCurrentDisplayOutlineClass()} node-error-important`;
    }, 1.2 * i);
  }

  for (let i = 0; i < errorMessage.length; i++) {
    setTimeout(() => {
      const node = errorMessage[i];
      document.getElementById(
        `node-${node.row}-${node.col}`
      ).className = `${getCurrentDisplayOutlineClass()} node-error`;
    }, 1.2 * i);
  }

  // This for loop animates the other nodes in the message- ie. all the nodes that are not the actual, error message
  for (let i = 0; i < otherNodes.length; i++) {
    // First, toggle the classlist of the homebutton to remove the "enabled" class. This means that animations are playing.
    setTimeout(() => {
      const node = otherNodes[i];
      document.getElementById(
        `node-${node.row}-${node.col}`
      ).className = `${getCurrentDisplayOutlineClass()} node-error-other`;

      if (i === otherNodes.length - 1) {
        document.getElementById('homeButton').classList.add('enabled');
      } // add the removed class. Animation has finished.
    }, 1.5 * i);
  }
}
