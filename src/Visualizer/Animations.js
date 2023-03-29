import { sendError } from './errorHandling';
import { getCurrentDisplayOutlineClass } from '../optionsHandling';
import { cloneVariable } from './Visualizer';
import {
  newLevelUnlocked,
  numLevelsUnlocked,
} from '../currentUserDataHandling';
import {
  getCurrentLevel,
  getCurrentLevelEndNodeCoords,
} from '../currentLevelHandling';
import { inSandbox } from '../Navigation';

export function animateAllNodes(
  visitedNodesInOrder,
  nodesInShortestPathOrder,
  endDistance
) {
  for (let i = 0; i <= visitedNodesInOrder.length; i++) {
    if (i === visitedNodesInOrder.length) {
      if (nodesInShortestPathOrder.length === 0) {
        setTimeout(() => {
          if (!inSandbox) sendError('NO-PATH');
          // If there is no path, and the user is in the Campaign, animate the "NO-PATH" error message
          else sendError('NO-PATH-SANDBOX'); // If there is no path, and the user is in the Sandbox, animate the "NO-PATH-SANDBOX" error message
          return;
        }, 8 * i);
      }
      // These lines of code run once all the nodes have been animated - because once they have all been animated, the shortest path needs to be animated
      setTimeout(() => {
        animateShortestPath(nodesInShortestPathOrder, Number(endDistance));
      }, 8 * i);
      return;
    }
    setTimeout(() => {
      // This animates all the visited nodes, excluding the start node
      const node = visitedNodesInOrder[i];
      document.getElementById(
        `node-${node.row}-${node.col}`
      ).className = `${getCurrentDisplayOutlineClass()} node-visited`;

      if (!inSandbox) {
        document.getElementById(
          `node-${node.row}-${node.col}`
        ).innerHTML = `&nbsp`; // Set the html content to empty
      } else {
        document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
          node.distance;
      }
    }, 6 * i);
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

  let nodesToAnimate = [];

  for (let i = 0; i < loopLength; i++) {
    setTimeout(() => {
      if (
        // Check that the next node in the shortest path is less than the endDistance, if it isn't, then end the trail as the missile did not reach the end node
        nodesInShortestPathOrder[i].distance >
        Number(endDistance) - 1
      ) {
        // End trail
        endTrail(endIndex, nodesInShortestPathOrder);
      } else if (i < endIndex) {
        // Actually animate the shortest path as a block of 5 nodes if not in Sandbox
        if (!inSandbox) {
          if (i < 5) {
            // Animate the first 5 nodes. The node at the front of the array is the head of the missile
            if (i === 0) {
              // Animate the head of the missile
              const node = nodesInShortestPathOrder[i];
              nodesToAnimate.push(node);
              document.getElementById(
                `node-${node.row}-${node.col}`
              ).className = `${getCurrentDisplayOutlineClass()} node-missile-head`;
            } else {
              // Animate the rest of the nodes, and remove the previous head
              const node = nodesInShortestPathOrder[i];
              nodesToAnimate.push(node);
              document.getElementById(
                `node-${node.row}-${node.col}`
              ).className = `${getCurrentDisplayOutlineClass()} node-missile-head`;

              const nodeToUnAnimateHead = nodesToAnimate[i - 1];
              document.getElementById(
                `node-${nodeToUnAnimateHead.row}-${nodeToUnAnimateHead.col}`
              ).className = `${getCurrentDisplayOutlineClass()} node-shortest-path`;
            }
          } else {
            // Remove the first node in the array and unanimate it, and add the next node to the end of the array. Then animate the rest array
            const nodeToUnAnimate = nodesToAnimate.shift();
            document.getElementById(
              `node-${nodeToUnAnimate.row}-${nodeToUnAnimate.col}`
            ).className = `${getCurrentDisplayOutlineClass()} node-visited-static`;

            const node = nodesInShortestPathOrder[i];
            nodesToAnimate.push(node);
            for (let nodeToAnimate of nodesToAnimate) {
              document.getElementById(
                `node-${nodeToAnimate.row}-${nodeToAnimate.col}`
              ).className = `${getCurrentDisplayOutlineClass()} node-shortest-path`;
            }

            // Remove the previous head
            const nodeToUnAnimateHead = nodesToAnimate[3];
            document.getElementById(
              `node-${nodeToUnAnimateHead.row}-${nodeToUnAnimateHead.col}`
            ).className = `${getCurrentDisplayOutlineClass()} node-shortest-path`;

            // The last node in the array should have `node-missile-head` class, so add it back
            const nodeToAnimateHead = nodesToAnimate[4];
            document.getElementById(
              `node-${nodeToAnimateHead.row}-${nodeToAnimateHead.col}`
            ).className = `${getCurrentDisplayOutlineClass()} node-missile-head`;
          }
        } else {
          // Animate the shortest path as a single path if in Sandbox
          const node = nodesInShortestPathOrder[i];
          document.getElementById(
            `node-${node.row}-${node.col}`
          ).className = `${getCurrentDisplayOutlineClass()} node-shortest-path`;
        }

        const node = nodesInShortestPathOrder[i];

        // If in sandbox, add the distance to the nodes, else set the html content to empty
        if (!inSandbox) {
          document.getElementById(
            `node-${node.row}-${node.col}`
          ).innerHTML = `&nbsp`;
        } else {
          document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
            nodesInShortestPathOrder[i].distance;
        }

        // If not in sandbox, unanimate the last 5 nodes sequentially if the animation has finished
        if (!inSandbox) {
          if (i === nodesInShortestPathOrder.length - 1) {
            for (let count = 1; count < 6; count++) {
              setTimeout(() => {
                const nodeToUnAnimate = nodesToAnimate.shift();
                document.getElementById(
                  `node-${nodeToUnAnimate.row}-${nodeToUnAnimate.col}`
                ).className = `${getCurrentDisplayOutlineClass()} node-visited-static`;

                if (count === 5) {
                  let endNodeCoordRow = getCurrentLevelEndNodeCoords()[0];
                  let endNodeCoordCol = getCurrentLevelEndNodeCoords()[1];

                  const endNode = document.getElementById(
                    `node-${endNodeCoordRow}-${endNodeCoordCol}`
                  );

                  endNode.className = `${getCurrentDisplayOutlineClass()} node-exploded`;

                  const handleAnimationEnd = function () {
                    sendError('MISSION-FAILED');
                    endNode.removeEventListener(
                      'animationend',
                      handleAnimationEnd
                    );
                  };

                  endNode.addEventListener('animationend', handleAnimationEnd);
                }
              }, 250 * count);
            }

            let endNodeCoordRow = getCurrentLevelEndNodeCoords()[0];
            let endNodeCoordCol = getCurrentLevelEndNodeCoords()[1];

            document.getElementById(
              `node-${endNodeCoordRow}-${endNodeCoordCol}`
            ).innerHTML = loopLength + 1;

            document.getElementById('homeButton').classList.add('enabled');
          }
        } else {
          if (i === nodesInShortestPathOrder.length - 1) {
            document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
              nodesInShortestPathOrder[i].distance;
            document.getElementById('homeButton').classList.add('enabled');
          }
        }
      }
    }, 130 * i);
  }
}

export function endTrail(endIndex, nodesInShortestPathOrder) {
  let counter = Number(cloneVariable(Number(endIndex)));

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

      if (endIndex === 1 && x === endIndex - 1) {
        if (getCurrentLevel() === 15 && !inSandbox) sendError('GAME-COMPLETE');
        else if (!inSandbox) {
          sendError('VICTORY');
          if (getCurrentLevel() === numLevelsUnlocked) newLevelUnlocked();
        } else document.getElementById('homeButton').classList.add('enabled');
      }
    } else {
      setTimeout(() => {
        // Used [count - 2 - x] for the index as the setTimout reverses the for loop, so instead from starting from endIndex, going to 0, it starts from 0 to endIndex. The count - 2 - x, reverses this reversal, so the nodes are selected from the top down, like it should be.
        const node = nodesInShortestPathOrder[counter - 2 - x];

        if (!inSandbox) {
          document.getElementById(
            `node-${node.row}-${node.col}`
          ).innerHTML = `&nbsp`; // Set the html content to empty
        } else {
          document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
            node.distance;
        }

        document.getElementById(
          `node-${node.row}-${node.col}`
        ).className = `${getCurrentDisplayOutlineClass()} node-ended-body`;

        if (x === endIndex - 2) {
          if (getCurrentLevel() === 15 && !inSandbox)
            sendError('GAME-COMPLETE');
          else if (!inSandbox) {
            sendError('VICTORY');
            if (getCurrentLevel() === numLevelsUnlocked) newLevelUnlocked();
          } else document.getElementById('homeButton').classList.add('enabled');
        } // add the removed class. Animation has finished.
      }, 10 * x);
    }
  }
}
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
    }, 0.8 * i);
  }
}
