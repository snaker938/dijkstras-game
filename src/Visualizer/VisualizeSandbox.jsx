import React, { Component } from 'react';
import {
  getActualCurrentEndDistance,
  randomIntFromInterval,
  setCurrentEndDistance,
} from '../actualLeveHandling';
import Node from './Node/Node';
import { resetAllNodes, startDijkstra } from './Visualizer';
import NodeChangeWallType from './Node/NodeChangeWallType';
import './VisualizeSandbox.css';
import {
  togglePermanentWall,
  permanentWallToggled,
  gridOutlineToggled,
  setGridOutlineToggled,
  isGridOutlineToggled,
  getToggleWallOnClick,
  setToggleWallOnClick,
  getHasGridBeenReset,
  setHasGridBeenReset,
} from '../optionsHandling';
import NodeToggleGrid from './Node/NodeToggleGrid';
import { EnterHome } from '../Navigation';
import NodeToggleOnClick from './Node/NodeToggleOnClick';
import ScrollableBox from './Components/ScrollableBox';
import { allLevelGrids, allLevelNames, numLevels } from '../allLevelData';
import NodeSmaller from './Node/SmallerNode';
import {
  deleteUserLevel,
  getSpecificUserLevel,
  getUserLevelsFromLocalStorage,
  renameUserLevel,
  saveUserLevels,
} from '../currentUserDataHandling';

// Placeholders for start node coordinates
let START_NODE_ROW = 0;
let START_NODE_COL = 0;
let END_NODE_ROW = 25;
let END_NODE_COL = 50;

// Specifies the number of rows and columns
const NUM_ROWS = 26;
const NUM_COLUMNS = 51;

// The maximum number of walls that can be placed randomly on the grid
let RANDOM_WALL_NUMBER = 400;

export default class sandboxVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      showOptionsMenu: false,
      optionsPage: 1,
      animatingPlane: false,
      draggingWall: false,
      defaultUserLevelInput: '',
      lastAddedUserLevel: '',
      levelClicked: -1,
      renamingUserLevel: false,
      dragging: [false, null, null], // 0: is-dragging ; 1: node-being-dragged ; 2: end/previous node
      //sets the default dragging values of the dragging state. The first index is whether dragging is taking place or node. The second index holds the value of the node that dragging first occurred on, ie. the node the user originally clicks. The third index holds the value of the previous node, and also holds the value of the current node the user is on when they stop dragging all together. The second index is used to get what type of node is being dragged: a start or end node. The third index allows us to remove the class of the previous node, when the new one gets updated to create an illusion like the user is actual dragging the node around.
    };
  }

  // If the Escape button is pressed, run the Show Options function
  handleKeyPress = (event) => {
    if (event.key === 'Escape') {
      if (!this.state.showOptionsMenu) this.toggleOptionsMenu();
    }
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress, false);
    const grid = initialiseGrid();
    this.setState({ grid });
  }

  toggleOptionsMenu() {
    this.setState({ showOptionsMenu: !this.state.showOptionsMenu });
  }

  // Animate plane and place random walls on the grid
  startToAnimatePlane() {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      document.getElementById('homeButton').classList.remove('enabled');
      resetAllNodes(this.state.grid);
      if (!this.state.animatingPlane) {
        this.setState({ animatingPlane: true });

        // Change the display from "none" to "block" so it becomes visible again
        document.getElementById('plane').style.display = 'block';

        // Play "plane_sound_effect.mp3" then stop it
        let audio = new Audio(
          require(`.././assets/Animated/plane_sound_effect.mp3`).default
        );
        audio.play();
        setTimeout(() => {
          audio.pause();
        }, 6300);

        // Set the interval of the animation to play every 0.1 seconds. This animation is not the plane moving across the screen, but the animation of the turbines spinning. Animate the turbines of the plane. This is done by changing the source path of the image to each of the 4 animation frames.
        let x = 1;
        const animateTubines = setInterval(() => {
          if (this.state.animatingPlane) {
            document.getElementById('plane').src =
              require(`.././assets/Animated/${x}.png`).default;
            x++;
            if (4 === x) {
              x = 1;
            }
          } else {
            clearInterval(animateTubines);
          }
        }, 100);

        // This is the code to move the plane across the screen. The plane starts from outside of the screen and move by a certain number of pixels each loop. At the very end of the animation, set animating plane variable to false, so the animation can be played again. The animation can only be played again a few seconds after the plane has reached the other side
        for (let i = 1; i < 800; i++) {
          setTimeout(() => {
            document.getElementById('plane').style.left = `${-450 + i * 3.4}px`;
            if (i === 799) {
              this.setState({ animatingPlane: false });
              document.getElementById('homeButton').classList.add('enabled');
            }
          }, 10 * i);
        }

        // This is the code to add random walls onto the grid. The grid is properly re-rendered every 45n i to prevent lag and once again at the end of the iteration

        for (let i = 0; i < RANDOM_WALL_NUMBER; i++) {
          // let grid = this.state.grid;
          setTimeout(() => {
            let column =
              (document.getElementById('plane').getBoundingClientRect().x +
                520) /
              27.5;

            column = randomIntFromInterval(
              Math.floor(column),
              Math.ceil(column)
            );

            let grid = this.state.grid;

            if (column <= 50) {
              // Generates a random row and column number
              let row = Math.floor(Math.random() * NUM_ROWS);

              let node = grid[row][column]; // selects the node with the row and column specified above
              let { isEnd, isStart } = node; // finds out the current properties of the randomly selected node
              let unWallable = isEnd || isStart || node.isPermanentWall; // if the node is a start or end node, it cannot be changed

              // Makes sure the target node is not a wall, and max number of active walls hasnt been reached. Will continue if you are turning a wall into a non wall.
              if (!unWallable) {
                const newNode = {
                  ...node,
                  isWall: true,
                };

                // Places the new node into the grid
                grid[row][column] = newNode;
              }
            }
            if (i % 45 === 0 || i === RANDOM_WALL_NUMBER - 1 || column === 51)
              this.setState({ grid: grid });
          }, i * 10);
        }
      }
    }
  }

  dragWallStart() {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      resetAllNodes(this.state.grid);
      this.setState({ draggingWall: true });
    }
  }

  // This function is called when a user presses, and holds, but not releases their mouse button on ANY node.
  dragStart(row, col) {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      resetAllNodes(this.state.grid);
      let grid = this.state.grid;
      let node = grid[row][col];
      let nodeBeingDragged = null;

      if (node.isStart || node.isEnd) nodeBeingDragged = node; // this conditional statement is the deciding factor on whether the user is able to drag the node. Aka- it is draggable. A node is only draggable if it is a start or end node

      if (nodeBeingDragged == null && node.isWall && !node.isPermanentWall)
        // if the node is a wall, but not a permanent one, then the dragWall function is called
        this.dragWallStart();
      else if (!this.state.dragging[0] && nodeBeingDragged) {
        this.setState({ dragging: [true, node, node] }); // sets the default dragging values of the dragging state. The first index is whether dragging is taking place or node. The second index holds the value of the node that dragging first occured on, ie. the node the user originally clicks. The third index holds the value of the previous node, and also holds the value of the current node the user is on when they stop dragging alltogether. The second index is used to get what type of node is being dragged: a start or end node. The third index allows us to remove the class of the previous node, when the new one gets updated to create an illusion like the user is actuall dragging the node around.
      }
    }
  }

  // This function is called when a user moves their mouse while holding down their mouse button on ANY node (i.e. hovering over a node)
  dragNode(row, col) {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      // This function only works if the user is dragging a start/end node, and is not trying to drag it onto a start/end node and is not trying to drag it onto a wall if the situtation requires him not to
      if (this.state.dragging[0]) {
        let firstGrid = this.state.grid;
        let nodeBeingDraggedOnto = firstGrid[row][col];

        if (!nodeBeingDraggedOnto.isStart && !nodeBeingDraggedOnto.isEnd) {
          // Retrieves the previous node and removes its start/end properties
          let previousNode = {
            ...this.state.dragging[2],
            isStart: false,
            isEnd: false,
          };

          // Finds the row and column of the previous node so we can add the updated previous node (with no classes on it because it is no longer a start or end node) to the grid
          let previousRow = previousNode.row;
          let previousCol = previousNode.col;

          // Store the current state of the grid
          let grid2 = this.state.grid;
          let node = grid2[row][col];
          let newNode = { ...node };

          // Finds the type of node that is being dragged- is it a start or end node
          let typeBeingDragged;
          if (this.state.dragging[1].isStart) typeBeingDragged = 'start';
          if (this.state.dragging[1].isEnd) typeBeingDragged = 'end';

          // Changes the properties of the current node depending on whether it is a start or end node.
          if (typeBeingDragged === 'start') {
            newNode = {
              ...node,
              isStart: !node.isStart,
            };
          } else if (typeBeingDragged === 'end') {
            newNode = {
              ...node,
              isEnd: !node.isEnd,
            };
          }

          grid2[row][col] = newNode; // sets the position in the grid to the new node with the new properties
          grid2[previousRow][previousCol] = previousNode; // sets the previous node of the grid to have default properties, ie. it is no longer a start or end node

          this.setState({ dragging: [true, this.state.dragging[1], newNode] }); // sets the status of dragging with all the new changes
        }
      } else if (this.state.draggingWall) {
        // These lines of code only run if the user is dragging a wall
        let grid = this.state.grid;
        let node = grid[row][col];
        let newNode = { ...node };
        if (!node.isStart && !node.isEnd && !node.isPermanentWall) {
          newNode = {
            ...node,
            isWall: true,
          };
          grid[row][col] = newNode;
          this.setState({ grid });
        }
      }
    }
  }

  // This function is called when the user releases their mouse button and therefore is no longer dragging
  dragStop() {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      // Only works if dragging is taking place
      if (this.state.dragging[0]) {
        // Finds the new position of the start OR end node- it doesnt matter
        let newRow = this.state.dragging[2].row;
        let newCol = this.state.dragging[2].col;

        let newSepcialNode = this.state.dragging[2];
        newSepcialNode = {
          ...newSepcialNode,
          isWall: false,
          isPermanentWall: false,
        };

        let grid = this.state.grid;
        grid[newRow][newCol] = newSepcialNode;
        this.setState({ grid: grid });

        // Checks whether the new node is a start or end node, and then updates the cooridinates of them, otherwise the algorithm will use the old values
        if (this.state.dragging[2].isStart) {
          START_NODE_ROW = newRow;
          START_NODE_COL = newCol;
        } else if (this.state.dragging[2].isEnd) {
          END_NODE_ROW = newRow;
          END_NODE_COL = newCol;
        }

        this.setState({ dragging: [false, null, null] }); // sets the state of dragging to the main default values, waiting for the next time dragging is needed
      } else if (this.state.draggingWall) {
        this.setState({ draggingWall: false });
      }
    }
  }

  // When a node is clicked, unless it is the start or end node, it gets toggled between a wall and not-wall
  toggleWall(row, col, isWall, unWallable, isPermanentWall) {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      if (!getHasGridBeenReset() && !getToggleWallOnClick()) {
        resetAllNodes(this.state.grid);
        setHasGridBeenReset(true);
        return;
      } else {
        resetAllNodes(this.state.grid);
        setHasGridBeenReset(true);
      }

      // If the error animation has shown, then the grid need to be reset to its default state

      if (!unWallable) {
        let node = this.state.grid[row][col];
        let grid = this.state.grid;
        if (permanentWallToggled) {
          // Creates a temporary node with the new property of isWall set to the opposite of its current state. If permanent wall is toggled, then the new node will switch between a permanent and non-permanent wall.
          const newNode = {
            ...node,
            isWall: !isPermanentWall,
            isPermanentWall: !isPermanentWall,
          };
          // Places the new node into the grid
          grid[row][col] = newNode;
        } else {
          const newNode = {
            ...node,
            isWall: !isWall,
            isPermanentWall: false,
          };
          // Places the new node into the grid
          grid[row][col] = newNode;
        }
        // Changes the overall state of the grid which re-renders it.
        this.setState({ grid: grid });
      }
    }
  }

  toggleGrid() {
    let node = document.getElementById(`node-toggleGrid`);
    if (node.classList.contains(`node-toggledGrid-true`))
      document.getElementById(`node-toggleGrid`).className = `node-toggleGrid`;
    else
      document.getElementById(
        `node-toggleGrid`
      ).className = `node-toggleGrid node-toggledGrid-true`;
    let grid = this.state.grid;

    for (const row of grid) {
      for (const node of row) {
        let nodeElement = document.getElementById(
          `node-${node.row}-${node.col}`
        );
        if (gridOutlineToggled) {
          nodeElement.classList.remove('nodeOutline');
          nodeElement.classList.add('nodeNoOutline');
        } else {
          nodeElement.classList.remove('nodeNoOutline');
          nodeElement.classList.add('nodeOutline');
        }
      }
    }

    if (gridOutlineToggled) {
      setGridOutlineToggled(false);
    } else {
      setGridOutlineToggled(true);
    }
  }

  toggleBetweenWallType() {
    togglePermanentWall();
    let node = document.getElementById(`node-clickable`);
    if (node.classList.contains(`node-clickable-toggled`))
      document.getElementById(`node-clickable`).className = `node-clickable`;
    else
      document.getElementById(
        `node-clickable`
      ).className = `node-clickable node-clickable-toggled`;
  }

  toggleOnClick() {
    setToggleWallOnClick(!getToggleWallOnClick());

    let node = document.getElementById(`node-toggleOnClick`);

    if (node.classList.contains(`node-onclick-true`))
      document.getElementById(
        `node-toggleOnClick`
      ).className = `node-onclick-false`;
    else
      document.getElementById(
        `node-toggleOnClick`
      ).className = `node-onclick-true`;
  }

  nextOptionsMenuPage(next) {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      if (next) {
        this.setState({ optionsPage: 2 });
      } else {
        this.setState({
          defaultUserLevelInput: '',
          lastAddedUserLevel: '',
          levelClicked: -1,
          renamingUserLevel: false,
        });
        this.setState({ optionsPage: 1 });
      }
    }
  }

  userLevelButtonClicked(id) {
    if (!this.state.renamingUserLevel) {
      if (id === this.state.levelClicked) {
        this.setState({ levelClicked: -1 });
        document.getElementById('saveLevelInput').style.display = '';
        document.getElementById('saveCurrentGridText').style.display = '';
      } else {
        this.setState({ levelClicked: Number(id) });
        document.getElementById('saveLevelInput').style.display = 'none';
        document.getElementById('saveCurrentGridText').style.display = 'none';
      }
    }
  }

  deleteUserLevel(id) {
    this.setState({ levelClicked: -1 });
    this.setState({ renamingUserLevel: false });
    this.setState({ lastAddedUserLevel: '' });
    this.setState({ defaultUserLevelInput: '' });
    deleteUserLevel(id);
  }

  renameUserLevel(id, name) {
    //  If the id is false, then the user has clicked the rename button. If the name is false, then the user has clicked the svg.
    if (name === false) {
      this.setState({ renamingUserLevel: true });
      document.getElementById('saveLevelInput').value = '';
      document.getElementById(
        'saveCurrentGridText'
      ).innerHTML = `Rename Level ${id + 1}:`;
    } else {
      if (this.checkLevelInput(name)) {
        id = document
          .getElementById('saveCurrentGridText')
          .innerHTML.trim()
          .slice(-2, -1);

        id = Number(id) - 1;

        renameUserLevel(id, name);
        document.getElementById(
          'saveCurrentGridText'
        ).innerHTML = `Save Current Grid:`;
        document.getElementById('saveLevelInput').value = '';
        this.setState({ renamingUserLevel: false });
        this.setState({ lastAddedUserLevel: '' });
        this.setState({ defaultUserLevelInput: '' });
      }
    }
  }

  loadUserGrid(id) {
    this.setState({ grid: getSpecificUserLevel(id)[1] });
    this.setState({ levelClicked: -1 });
    this.setState({ renamingUserLevel: false });
    this.setState({ lastAddedUserLevel: '' });
    this.setState({ defaultUserLevelInput: '' });
    this.setState({ optionsPage: 1 });
    this.setState({ showOptionsMenu: false });

    START_NODE_ROW = getSpecificUserLevel(id)[2][0][0];
    START_NODE_COL = getSpecificUserLevel(id)[2][0][1];
    END_NODE_ROW = getSpecificUserLevel(id)[2][1][0];
    END_NODE_COL = getSpecificUserLevel(id)[2][1][1];
  }

  getUserLevelButtons() {
    const buttons = [];
    let levelName = null;
    let allUserlevels = getUserLevelsFromLocalStorage();

    for (let i = 0; i <= allUserlevels.length - 1; i++) {
      levelName = allUserlevels[i][0];

      buttons.push(
        <button
          className={
            i === this.state.levelClicked
              ? 'userLevelButtonsClicked'
              : 'userLevelButtons'
          }
          id={i}
          onClick={() => {
            this.userLevelButtonClicked(i);
          }}
          key={i}
        >
          <span>
            <div style={{ position: 'absolute', marginLeft: '8px' }}>
              {i + 1}
              {'.'}{' '}
            </div>
            <span
              style={
                i < 10 ? { marginLeft: '3.4rem' } : { marginLeft: '3.5rem' }
              }
            >
              {levelName}

              {i === this.state.levelClicked ? (
                <>
                  <span style={{ float: 'right', marginRight: '10px' }}>
                    <svg
                      stroke="darkgrey"
                      fill="none"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ stroke: 'darkgrey' }} // Add initial stroke color
                      onClick={() => {
                        this.deleteUserLevel(i);
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget
                          .querySelectorAll('line, polyline, path')
                          .forEach((el) => {
                            el.setAttribute('stroke', 'red');
                          });
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget
                          .querySelectorAll('line, polyline, path')
                          .forEach((el) => {
                            el.setAttribute('stroke', 'darkgrey');
                          });
                      }}
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </span>

                  <span style={{ float: 'right', marginRight: '13px' }}>
                    <svg
                      stroke="darkgrey"
                      fill="none"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                      onClick={() => {
                        this.renameUserLevel(i, false);
                      }}
                      style={{ stroke: 'darkgrey' }} // Add initial stroke color
                      onMouseOver={(e) => {
                        e.currentTarget
                          .querySelectorAll('line, polyline, path')
                          .forEach((el) => {
                            el.setAttribute('stroke', 'white');
                          });
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget
                          .querySelectorAll('line, polyline, path')
                          .forEach((el) => {
                            el.setAttribute('stroke', 'darkgrey');
                          });
                      }}
                    >
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </span>
                </>
              ) : null}
            </span>
          </span>
        </button>
      );
    }

    return buttons;
  }

  // This function will alert the user that the level name they entered is not allowed
  checkLevelInput(saveLevelInput) {
    if (
      saveLevelInput === ' ' ||
      saveLevelInput === '' ||
      saveLevelInput === 'ERROR: INVALID INPUT' ||
      saveLevelInput.match(/[!#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/) ||
      saveLevelInput.match(/^(\s{2,}|[!#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/) ||
      saveLevelInput.match(/\s{2,}/) ||
      saveLevelInput.charAt(saveLevelInput.length - 1) === ' '
    ) {
      document.getElementById('saveLevelInput').value = 'ERROR: INVALID INPUT';
      document.getElementById('saveLevelInput').style.color = 'red';

      // Change the box style/value default after a set amount of time
      setTimeout(() => {
        if (document.getElementById('saveLevelInput')) {
          if (
            document.getElementById('saveLevelInput').value ===
            'ERROR: INVALID INPUT'
          ) {
            document.getElementById('saveLevelInput').value = '';
            document.getElementById('saveLevelInput').style.color = 'white';
            this.setState({ defaultUserLevelInput: '' });
          }
        }
      }, 3000);
      return false;
    } else {
      return true;
    }
  }

  handleInputChange = (event) => {
    this.setState({
      defaultUserLevelInput: event.target.value,
    });
  };

  getOptionsMenu() {
    let currentPermanentWallClass = null;

    if (permanentWallToggled)
      currentPermanentWallClass = 'node-clickable-toggled';
    else currentPermanentWallClass = 'node-clickable';

    let optionsMenuPageButton = null;
    if (this.state.optionsPage === 1) {
      optionsMenuPageButton = (
        <button
          style={{ left: '12px', top: '558px' }}
          className="optionsMenuButton"
          onClick={() => {
            this.nextOptionsMenuPage(true);
          }}
        >
          Next
        </button>
      );
    } else {
      optionsMenuPageButton = (
        <button
          style={{ left: '12px', top: '558px' }}
          className="optionsMenuButton"
          onClick={() => {
            this.nextOptionsMenuPage(false);
          }}
        >
          Previous
        </button>
      );
    }

    function addUserLevel(saveLevelInput) {
      let userLevel = [
        saveLevelInput,
        this.state.grid,
        [
          [START_NODE_ROW, START_NODE_COL],
          [END_NODE_ROW, END_NODE_COL],
        ],
      ];
      if (this.checkLevelInput(saveLevelInput)) {
        this.setState({ defaultUserLevelInput: '' });
        saveUserLevels(userLevel);
        changeColorSuccess();
      }
    }

    function changeColorSuccess() {
      document.getElementById('saveLevelInput').value = 'LEVEL SAVED!';
      document.getElementById('saveLevelInput').style.color = 'green';
    }

    // Changes the color of the input box text to the default colour (from red), if the user clicks the box before it changes automatically
    function changeColor() {
      if (document.getElementById('saveLevelInput').style.color === 'red') {
        document.getElementById('saveLevelInput').value = '';
        this.setState({ defaultUserLevelInput: '' });
      } else if (
        document.getElementById('saveLevelInput').style.color === 'green'
      ) {
        document.getElementById('saveLevelInput').value =
          this.state.lastAddedUserLevel;
      }
      document.getElementById('saveLevelInput').style.color = 'white';
    }

    let grid = null;
    if (this.state.levelClicked !== -1)
      grid = getSpecificUserLevel(this.state.levelClicked)[1];

    return (
      <>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '200vh',
            background: '#1a1717',
            opacity: '0.5',
            backdropFilter: 'blur(100px)',
            zIndex: '99',
          }}
        ></div>
        <div style={{ position: 'absolute', left: '-249px', zIndex: '100' }}>
          <div className="mainInfoContainer">
            <p
              style={{ left: '143px', opacity: '1' }}
              className="mainTextToRender"
            >
              Settings
            </p>
          </div>

          <div className="mainInfoContainer2">
            {this.state.optionsPage === 1 ? (
              <>
                <div>
                  <div
                    style={{ right: '10px' }}
                    className="toggle-grid-holder text-info"
                  >
                    Toggle Grid Outline
                    <div>
                      <NodeToggleGrid
                        currentState={isGridOutlineToggled()}
                        onClick={() => this.toggleGrid()}
                      ></NodeToggleGrid>
                    </div>
                  </div>

                  <div className="toggle-onclick-holder text-info">
                    Toggle Wall After Animation
                    <div>
                      <NodeToggleOnClick
                        currentState={getToggleWallOnClick()}
                        onClick={() => this.toggleOnClick()}
                      ></NodeToggleOnClick>
                    </div>
                  </div>

                  <div className="toggle-permanent-holder text-info">
                    Toggle Permanent Wall
                    <div>
                      <NodeChangeWallType
                        currentState={currentPermanentWallClass}
                        onClick={() => this.toggleBetweenWallType()}
                      ></NodeChangeWallType>
                    </div>
                  </div>
                  <div
                    style={{ zIndex: '100' }}
                    className="optionsMenuDevelopment"
                  >
                    <p className="developmentOptionsText">
                      Development Options
                    </p>
                    <div>
                      <div>
                        <p
                          style={{ top: '80px' }}
                          className="endDistanceOptions"
                        >
                          Load Level Name:
                        </p>
                        <input
                          type="text"
                          id="loadLevelInput"
                          className="usernameInput"
                          style={{
                            top: '70px',
                            zIndex: '1',
                            width: '35px',
                            right: '150px',
                          }}
                          maxLength={22}
                          spellCheck="false"
                          defaultValue={''}
                        ></input>
                      </div>
                      <button
                        className="standard-button-options saveGridButton"
                        onClick={() => saveGrid(this.state.grid)} // outputs the current grid so that it can be saved
                      >
                        Save Grid
                      </button>
                      <button
                        className="standard-button-options loadGridButton"
                        onClick={() => this.loadTestGrid()} // loads current grid
                      >
                        Load Grid
                      </button>

                      <div>
                        <p className="endDistanceOptions">Set End Distance:</p>
                        <input
                          type="text"
                          id="endDistanceInput"
                          className="usernameInput"
                          style={{
                            bottom: '20px',
                            zIndex: '1',
                            width: '35px',
                            right: '150px',
                          }}
                          maxLength={22}
                          spellCheck="false"
                          defaultValue={getActualCurrentEndDistance()}
                        ></input>
                      </div>
                    </div>
                  </div>
                  {optionsMenuPageButton}

                  <button
                    style={{ right: '12px', top: '558px' }}
                    className="optionsMenuButton"
                    onClick={() => {
                      this.saveOptions();
                    }}
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                <ScrollableBox height={200}>
                  {this.getUserLevelButtons()}
                </ScrollableBox>

                <div>
                  <div>
                    <p
                      id="saveCurrentGridText"
                      style={{ top: '350px', fontSize: '25px' }}
                      className="endDistanceOptions"
                    >
                      Save Current Grid:
                    </p>

                    <input
                      type="text"
                      id="saveLevelInput"
                      className="usernameInput"
                      style={{
                        top: '345px',
                        zIndex: '1',
                        width: '350px',
                        right: '10px',
                      }}
                      maxLength={250}
                      spellCheck="false"
                      defaultValue={this.state.defaultUserLevelInput}
                      onClick={() => {
                        changeColor.call(this);
                      }}
                      onChange={this.handleInputChange}
                    ></input>

                    {!this.state.renamingUserLevel &&
                    this.state.levelClicked !== -1 ? (
                      <>
                        <div className="wrapperDiv">
                          <div className="outerSmallerGridContainer">
                            <div className="gridSmaller">
                              {grid.map((row, rowID) => {
                                return (
                                  <div key={rowID}>
                                    {row.map((node, nodeID) => {
                                      const {
                                        row,
                                        col,
                                        isEnd,
                                        isStart,
                                        isWall,
                                        isPermanentWall,
                                      } = node;

                                      return (
                                        <NodeSmaller
                                          col={col}
                                          row={row}
                                          isStart={isStart}
                                          isEnd={isEnd}
                                          isWall={isWall}
                                          isPermanentWall={isPermanentWall}
                                          key={nodeID}
                                        ></NodeSmaller>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <button
                          style={{ right: '12px', top: '558px' }}
                          className="optionsMenuButton"
                          id="loadUserGridButton"
                          onClick={() => {
                            this.loadUserGrid(this.state.levelClicked);
                          }}
                        >
                          Load Grid
                        </button>
                      </>
                    ) : null}

                    {this.state.defaultUserLevelInput !== '' &&
                    !this.state.renamingUserLevel &&
                    this.state.levelClicked === -1 &&
                    document.getElementById('saveLevelInput').value !== '' ? (
                      <>
                        <button
                          className="standard-button-options saveUserGridButton"
                          onClick={() =>
                            addUserLevel.call(
                              this,
                              document.getElementById('saveLevelInput').value
                            )
                          }
                        >
                          Save Grid
                        </button>
                      </>
                    ) : null}
                    {this.state.renamingUserLevel ? (
                      <button
                        className="standard-button-options saveUserGridButton"
                        onClick={() =>
                          this.renameUserLevel(
                            null,
                            document.getElementById('saveLevelInput').value
                          )
                        }
                      >
                        Rename Level
                      </button>
                    ) : null}
                  </div>
                </div>
              </>
            )}

            {optionsMenuPageButton}

            {this.state.optionsPage === 1 ? (
              <>
                <button
                  style={{ right: '12px', top: '558px' }}
                  className="optionsMenuButton"
                  onClick={() => {
                    this.saveOptions();
                  }}
                >
                  Save
                </button>
              </>
            ) : null}
          </div>
        </div>
      </>
    );
  }

  saveOptions() {
    if (
      document.getElementById('endDistanceInput').value !==
      getActualCurrentEndDistance()
    ) {
      setCurrentEndDistance(document.getElementById('endDistanceInput').value);
    }
    this.toggleOptionsMenu();
  }

  // This function is purely for testing the grid templates
  loadTestGrid() {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      // If the value of loadLevelInput is not between 1 and 15 (or is not a special grid template), then nothing will happen. If it is, then the grid will be loaded with the corresponding grid template
      if (
        document.getElementById('loadLevelInput').value >= 1 &&
        document.getElementById('loadLevelInput').value <= 15
      ) {
        this.removeAllWalls(); // removes all existing walls

        const json = require(`../levels/level${
          document.getElementById('loadLevelInput').value
        }.json`);

        this.setState({
          grid: json.grid,
        });

        // Change the coordinates of the start and end nodes
        START_NODE_ROW = json.startNodeCoords[1];
        START_NODE_COL = json.startNodeCoords[0];
        END_NODE_ROW = json.endNodeCoords[1];
        END_NODE_COL = json.endNodeCoords[0];
      } else if (
        document.getElementById('loadLevelInput').value === 'NO-PATH-SANDBOX'
      ) {
        this.removeAllWalls(); // removes all existing walls

        const json = require(`./templates/NO-PATH-SANDBOX.json`);

        this.setState({
          grid: json.grid,
        });
      } else if (
        document.getElementById('loadLevelInput').value === 'NO-PATH'
      ) {
        this.removeAllWalls(); // removes all existing walls

        const json = require(`./templates/NO-PATH.json`);

        this.setState({
          grid: json.grid,
        });
      } else if (
        document.getElementById('loadLevelInput').value === 'VICTORY'
      ) {
        this.removeAllWalls(); // removes all existing walls

        const json = require(`./templates/VICTORY.json`);

        this.setState({
          grid: json.grid,
        });
      } else if (
        document.getElementById('loadLevelInput').value === 'MISSION-FAILED'
      ) {
        this.removeAllWalls(); // removes all existing walls

        const json = require(`./templates/MISSION-FAILED.json`);

        this.setState({
          grid: json.grid,
        });
      } else if (
        document.getElementById('loadLevelInput').value === 'GAME-COMPLETE'
      ) {
        this.removeAllWalls(); // removes all existing walls

        const json = require(`./templates/GAME-COMPLETE.json`);

        this.setState({
          grid: json.grid,
        });
      }
    }
  }

  // This function removes every wall on the grid
  removeAllWalls() {
    let grid = [];
    this.setState({ grid: grid });
    grid = initialiseGrid();
    this.setState({ grid: grid });
  }

  render() {
    const { grid } = this.state;

    let src = require(`.././assets/Animated/1.png`).default;

    let plane = null;

    plane = (
      <img
        className="plane"
        src={src}
        alt={`plane`}
        id={`plane`}
        key={`planes`}
        height={500}
        width={350}
        style={{ left: `-450px`, display: 'none' }}
      />
    );

    return (
      <>
        {this.state.showOptionsMenu ? this.getOptionsMenu() : null}

        <div
          style={{
            backgroundColor: 'lightblue',
            position: 'absolute',
            left: '0px',
            width: '100%',
            height: '100vh',
          }}
        ></div>

        {plane}

        <div className="topButtonsContainerOutline"></div>
        <div className="topButtonsContainer">
          <button
            style={{ left: '10px', top: '16px', padding: '5px' }}
            className="standard-button"
            onClick={() => this.startToAnimatePlane()} // add random walls to the grid and animate plane
          >
            Random Walls
          </button>

          <button
            className="button-82-pushable"
            onClick={() =>
              startDijkstra(
                this.state.grid,
                END_NODE_ROW,
                END_NODE_COL,
                START_NODE_ROW,
                START_NODE_COL,
                NUM_ROWS,
                NUM_COLUMNS
              )
            }
          >
            <span className="button-82-shadow"></span>
            <span className="button-82-edge"></span>
            <span className="button-82-front text">Start</span>
          </button>

          <button
            style={{ right: '100px', top: '16px', padding: '5px' }}
            className="standard-button"
            onClick={() => this.toggleOptionsMenu()} // Options
          >
            Settings
          </button>

          <button
            style={{ right: '10px', top: '16px', padding: '5px' }}
            className="standard-button enabled"
            id="homeButton"
            onClick={() => EnterHome(this.state.animatingPlane)}
          >
            Home
          </button>
        </div>

        <div className="grid" /*  creates the div that holds the rows*/>
          {/* Loops through the grid variable */}
          {grid.map((row, rowID) => {
            return (
              <div
                key={
                  rowID
                } /* Creates a div for each row, and assigns a key to it*/
              >
                {row.map((node, nodeID) => {
                  // Destructures the node object and assigns it to variables
                  const { row, col, isEnd, isStart, isWall, isPermanentWall } =
                    node;
                  let unWallable = isEnd || isStart; // checks to see if the node is an End or start node

                  return (
                    // Creates the node object inside each row div. Each node is a div that is returned in Node.jsx
                    <Node
                      col={col}
                      row={row}
                      isStart={isStart}
                      isEnd={isEnd}
                      isWall={isWall}
                      isPermanentWall={isPermanentWall}
                      key={nodeID}
                      onClick={(row, col) => {
                        this.toggleWall(
                          row,
                          col,
                          isWall,
                          unWallable,
                          isPermanentWall
                        );
                      }}
                      onMouseUp={() => this.dragStop()}
                      onMouseDown={(row, col) => this.dragStart(row, col)}
                      onMouseEnter={(row, col) => this.dragNode(row, col)}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

// Initialises the grid
const initialiseGrid = () => {
  // Loops through the rows and columns and creates a node for each position
  const grid = [];
  for (let row = 0; row < NUM_ROWS; row++) {
    const currentRow = [];
    for (let column = 0; column < NUM_COLUMNS; column++) {
      let isStart, isEnd;
      // Checks if the current node is the start or end node, and sets the boolean accordingly
      if (row === START_NODE_ROW && column === START_NODE_COL) {
        isStart = true;
      } else if (row === END_NODE_ROW && column === END_NODE_COL) {
        isEnd = true;
      }
      // Creates the node given the paremeters, and adds it to the current row
      currentRow.push(createNode(column, row, isStart, isEnd));
    }
    // Adds the current row to the grid
    grid.push(currentRow);
  }
  // returns the grid
  return grid;
};

const createNode = (col, row, isStart = false, isEnd = false) => {
  // Actually creates the node. It has certain paramemeters which can be changed later on
  return {
    col,
    row,
    isStart: isStart === true,
    isEnd: isEnd === true,
    distance: Infinity,
    isWall: false,
    isPermanentWall: false,
    previousNode: null,
  };
};

// This function sends the current state of the grid to the console. You can then copy this string and paste it into a json file to easily load the grid.
function saveGrid(grid) {
  const jsonString = JSON.stringify(grid);
  console.log(jsonString);
}
