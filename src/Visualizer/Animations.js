import { sendError } from './errorHandling';
import {
  getCurrentDisplayOutlineClass,
  getMissileTrailLength,
  getSandboxEndExplosionToggled,
  getUseCampaignMissileTrailInSandbox,
  shouldShowNodeNumbers,
} from '../optionsHandling';
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

function getNodeElement(node) {
  return document.getElementById(`node-${node.row}-${node.col}`);
}

function setNodeClass(node, className) {
  const nodeElement = getNodeElement(node);
  if (nodeElement) nodeElement.className = className;
}

function setNodeText(node, text) {
  if (!node) return;
  const nodeElement = getNodeElement(node);
  if (nodeElement) nodeElement.innerHTML = text;
}

function setNodeDistance(node) {
  setNodeText(node, shouldShowNodeNumbers(inSandbox) ? node.distance : `&nbsp`);
}

function enableHomeButton() {
  const homeButton = document.getElementById('homeButton');
  if (homeButton) homeButton.classList.add('enabled');
}

function shouldUseMissileTrail() {
  return !inSandbox || getUseCampaignMissileTrailInSandbox();
}

function getActualEndNode(fallbackNode) {
  if (!inSandbox) {
    const [row, col] = getCurrentLevelEndNodeCoords();
    return { row, col, distance: fallbackNode?.distance };
  }

  const nodeElement = document.querySelector('.node-end');
  if (!nodeElement) return fallbackNode;

  const [, row, col] = nodeElement.id.split('-');
  return {
    row: Number(row),
    col: Number(col),
    distance: fallbackNode?.distance,
  };
}

function finishMissileAtEnd(fallbackNode, displayedDistance) {
  const endNode = getActualEndNode(fallbackNode);
  if (!endNode) {
    enableHomeButton();
    return;
  }

  setNodeText(
    endNode,
    shouldShowNodeNumbers(inSandbox) ? displayedDistance : `&nbsp`
  );

  if (inSandbox && !getSandboxEndExplosionToggled()) {
    enableHomeButton();
    return;
  }

  const endNodeElement = getNodeElement(endNode);
  if (!endNodeElement) {
    if (inSandbox) enableHomeButton();
    return;
  }

  endNodeElement.className = `${getCurrentDisplayOutlineClass()} node-exploded`;

  const handleAnimationEnd = function () {
    if (!inSandbox) sendError('MISSION-FAILED');
    else enableHomeButton();

    endNodeElement.removeEventListener('animationend', handleAnimationEnd);
  };

  endNodeElement.addEventListener('animationend', handleAnimationEnd);
}

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
      setNodeClass(node, `${getCurrentDisplayOutlineClass()} node-visited`);
      setNodeDistance(node);
    }, 6 * i);
  }
}

// This function animates the shortest path. It also adds the distance to the nodes. It is called AFTER all the other nodes have been animated.
export function animateShortestPath(nodesInShortestPathOrder, endDistance) {
  if (nodesInShortestPathOrder.length === 0) {
    finishMissileAtEnd(null, 1);
    return;
  }

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

  const nodesToAnimate = [];
  const missileTrailLength = getMissileTrailLength();
  const useMissileTrail = shouldUseMissileTrail();

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
        if (useMissileTrail) {
          if (i < missileTrailLength) {
            // Animate the first nodes. The node at the front of the array is the head of the missile.
            if (i === 0) {
              // Animate the head of the missile
              const node = nodesInShortestPathOrder[i];
              nodesToAnimate.push(node);
              setNodeClass(
                node,
                `${getCurrentDisplayOutlineClass()} node-missile-head`
              );
            } else {
              // Animate the rest of the nodes, and remove the previous head
              const node = nodesInShortestPathOrder[i];
              nodesToAnimate.push(node);
              setNodeClass(
                node,
                `${getCurrentDisplayOutlineClass()} node-missile-head`
              );

              const nodeToUnAnimateHead = nodesToAnimate[i - 1];
              setNodeClass(
                nodeToUnAnimateHead,
                `${getCurrentDisplayOutlineClass()} node-shortest-path`
              );
            }
          } else {
            // Remove the first node in the array and unanimate it, and add the next node to the end of the array. Then animate the rest array
            const nodeToUnAnimate = nodesToAnimate.shift();
            setNodeClass(
              nodeToUnAnimate,
              `${getCurrentDisplayOutlineClass()} node-visited-static`
            );

            const node = nodesInShortestPathOrder[i];
            nodesToAnimate.push(node);
            for (let nodeToAnimate of nodesToAnimate) {
              setNodeClass(
                nodeToAnimate,
                `${getCurrentDisplayOutlineClass()} node-shortest-path`
              );
            }

            // The last node in the array should have `node-missile-head` class, so add it back
            const nodeToAnimateHead = nodesToAnimate[nodesToAnimate.length - 1];
            setNodeClass(
              nodeToAnimateHead,
              `${getCurrentDisplayOutlineClass()} node-missile-head`
            );
          }
        } else {
          // Animate the shortest path as a single path if in Sandbox
          const node = nodesInShortestPathOrder[i];
          setNodeClass(node, `${getCurrentDisplayOutlineClass()} node-shortest-path`);
        }

        const node = nodesInShortestPathOrder[i];

        setNodeDistance(node);

        if (useMissileTrail) {
          if (i === nodesInShortestPathOrder.length - 1) {
            const remainingTrailLength = nodesToAnimate.length;
            for (let count = 1; count <= remainingTrailLength; count++) {
              setTimeout(() => {
                const nodeToUnAnimate = nodesToAnimate.shift();
                if (nodeToUnAnimate) {
                  setNodeClass(
                    nodeToUnAnimate,
                    `${getCurrentDisplayOutlineClass()} node-visited-static`
                  );
                }

                if (count === remainingTrailLength) {
                  finishMissileAtEnd(node, loopLength + 1);
                }
              }, 250 * count);
            }
          }
        } else {
          if (i === nodesInShortestPathOrder.length - 1) {
            finishMissileAtEnd(node, nodesInShortestPathOrder[i].distance);
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
      setNodeClass(node, `${getCurrentDisplayOutlineClass()} node-ended-head`);
      setNodeDistance(node);

      if (endIndex === 1 && x === endIndex - 1) {
        if (getCurrentLevel() === 15 && !inSandbox) sendError('GAME-COMPLETE');
        else if (!inSandbox) {
          sendError('VICTORY');
          if (getCurrentLevel() === numLevelsUnlocked) newLevelUnlocked();
        } else enableHomeButton();
      }
    } else {
      setTimeout(() => {
        // Used [count - 2 - x] for the index as the setTimout reverses the for loop, so instead from starting from endIndex, going to 0, it starts from 0 to endIndex. The count - 2 - x, reverses this reversal, so the nodes are selected from the top down, like it should be.
        const node = nodesInShortestPathOrder[counter - 2 - x];

        setNodeDistance(node);
        setNodeClass(node, `${getCurrentDisplayOutlineClass()} node-ended-body`);

        if (x === endIndex - 2) {
          if (getCurrentLevel() === 15 && !inSandbox)
            sendError('GAME-COMPLETE');
          else if (!inSandbox) {
            sendError('VICTORY');
            if (getCurrentLevel() === numLevelsUnlocked) newLevelUnlocked();
          } else enableHomeButton();
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
