import React, { Component } from 'react';
import { EnterHome } from '../Navigation';
import Node from './Node/Node';
import { resetAllNodes, startDijkstra } from './Visualizer';
import './VisualizerLevel.css';
import './VisualizerSandbox.css';
import './VisualizerBoth.css';
import {
  currentLevel,
  getCurrentLevelGrid,
  getCurrentLevelID,
  getCurrentLevelLives,
  getCurrentLevelName,
  getCurrentLevelNodeCoords,
  getCurrentLevelRandomWallNumber,
  getCurrentLevelRandomWallPresses,
  getCurrentLevelWallsAllowed,
} from '../currentLevelHandling';
import {
  displayOutlineValue,
  randomIntFromInterval,
  setDisplayOutlineValue,
} from '../actualLevelHandling';
import {
  gridOutlineToggled,
  toggleGridOutline,
  toggleShowingOptionsMenu,
} from '../optionsHandling.jsx';
import NodeToggleGrid from './Node/NodeToggleGrid';

// // Placeholders for start node coordinates. It gets the current level data
let START_NODE_ROW;
let START_NODE_COL;

let END_NODE_ROW;
let END_NODE_COL;

// Specifies the number of rows and columns
const NUM_ROWS = 26;
const NUM_COLUMNS = 51;

// Specifies the number of walls the player can have active at one time
let NUM_WALLS_TOTAL;
let NUM_WALLS_ACTIVE;

// Wall Presses
let NUM_RANDOM_WALL_PRESSES;
let RANDOM_WALL_NUMBER = getCurrentLevelRandomWallNumber();

// Other level constants
let LEVEL_NAME;
let LEVEL_ID;
let LIVES;

// reloads all level data
export function reloadLevelData() {
  // Placeholders for start node coordinates. It gets the current level data
  START_NODE_ROW = getCurrentLevelNodeCoords()[0][1];
  START_NODE_COL = getCurrentLevelNodeCoords()[0][0];

  END_NODE_ROW = getCurrentLevelNodeCoords()[1][1];
  END_NODE_COL = getCurrentLevelNodeCoords()[1][0];

  // Specifies the number of walls the player can have active at one time
  NUM_WALLS_TOTAL = getCurrentLevelWallsAllowed();
  NUM_WALLS_ACTIVE = 0;

  // Wall Presses
  NUM_RANDOM_WALL_PRESSES = getCurrentLevelRandomWallPresses();
  RANDOM_WALL_NUMBER = 400;

  // Other level constants
  LEVEL_NAME = getCurrentLevelName();
  LEVEL_ID = getCurrentLevelID();
  LIVES = getCurrentLevelLives();
  // 0,1,2,3 star ---
}

export default class levelVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      showOptionsMenu: false,
      animatingPlane: false,
    };
    reloadLevelData();
    NUM_WALLS_ACTIVE = 0;
  }

  // If the Escape button is pressed, run the Show Options function
  handleKeyPress = (event) => {
    if (event.key === 'Escape') {
      if (!this.state.showOptionsMenu) this.toggleOptionsMenu();
    }
  };

  //   Initialises grid
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress, false);
    const grid = getCurrentLevelGrid();
    this.setState({ grid });
  }

  removeAllWalls() {
    let grid = [];
    this.setState({ grid: grid });
    grid = getCurrentLevelGrid();
    this.setState({ grid: grid });
    NUM_WALLS_ACTIVE = 0;
  }

  toggleGrid() {
    toggleGridOutline();

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
        if (displayOutlineValue) {
          nodeElement.classList.remove('nodeOutline');
          nodeElement.classList.add('nodeNoOutline');
        } else {
          nodeElement.classList.remove('nodeNoOutline');
          nodeElement.classList.add('nodeOutline');
        }
      }
    }

    if (displayOutlineValue) {
      setDisplayOutlineValue(false);
    } else {
      setDisplayOutlineValue(true);
    }
  }

  // When a node is clicked, unless it is the start or end node, it gets toggled between a wall and not-wall
  toggleWall(row, col, isWall, unWallable) {
    resetAllNodes(this.state.grid);
    const { grid } = this.state;
    let node = grid[row][col];
    if (!node.isPermanentWall) {
      // Makes sure the target node is not a wall, and max number of active walls hasnt been reached. Will continue if you are turning a wall into a non wall and the active walls is not 0.
      if (
        (!unWallable &&
          NUM_WALLS_ACTIVE < NUM_WALLS_TOTAL &&
          NUM_WALLS_ACTIVE > 0) ||
        (isWall && NUM_WALLS_ACTIVE > 0) ||
        (!isWall && NUM_WALLS_ACTIVE === 0)
      ) {
        // If it isnt a wall currently, increase the number of active walls by one, else decrease them
        if (!unWallable && !isWall) NUM_WALLS_ACTIVE = NUM_WALLS_ACTIVE + 1;
        else if (!unWallable && isWall) NUM_WALLS_ACTIVE = NUM_WALLS_ACTIVE - 1;
        // Creates a temporary node with the new property of isWall set to the opposite of its current state.
        const newNode = {
          ...node,
          isWall: !isWall,
        };
        //   Places the new node into the grid
        grid[row][col] = newNode;
        //   Changes the overall state of the grid which re-renders it.
        this.setState({ grid: grid });
      }
    }
  }

  // // When a node is clicked, unless it is the start or end node, it gets toggled between a wall and not-wall
  // toggleWall(row, col, isWall, unWallable, isPermanentWall) {
  //   let node = this.state.grid[row][col];
  //   let grid = this.state.grid;
  //   // Makes sure the target node is not a wall, and max number of active walls hasnt been reached. Will continue if you are turning a wall into a non wall.
  //   if (!unWallable) {
  //     // If it isnt a wall currently, increase the number of active walls by one, else decrease them
  //     if (isWall && !isPermanentWall) NUM_WALLS_ACTIVE = NUM_WALLS_ACTIVE + 0;
  //     else if (!unWallable && !isWall) NUM_WALLS_ACTIVE = NUM_WALLS_ACTIVE + 1;
  //     else if (!unWallable && isWall) NUM_WALLS_ACTIVE = NUM_WALLS_ACTIVE - 1;

  //     if (NUM_WALLS_ACTIVE < 0) NUM_WALLS_ACTIVE = 0;
  //   } else {
  //     const newNode = {
  //       ...node,
  //       isWall: !isWall,
  //       isPermanentWall: false,
  //     };
  //     // Places the new node into the grid
  //     grid[row][col] = newNode;
  //   }
  //   // Changes the overall state of the grid which re-renders it.
  //   this.setState({ grid: grid });
  // }

  // Animate plane and place random walls on the grid
  startToAnimatePlane() {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      if (NUM_RANDOM_WALL_PRESSES > 0) {
        // This function only runs if the animation is not already playing
        if (!this.state.animatingPlane) {
          NUM_RANDOM_WALL_PRESSES--;
          resetAllNodes(this.state.grid);
          // Set the animation running to true, which prevents further animations from playing
          this.setState({ animatingPlane: true });

          // Changed the display from "none" to "block" so it becomes visible again
          document.getElementById('plane').style.display = 'block';

          // Play "plane_sound_effect.mp3" then stop it after 6.3 seconds
          let audio = new Audio(
            require(`.././assets/Animated/plane_sound_effect.mp3`).default
          );
          audio.play();
          setTimeout(() => {
            audio.pause();
          }, 6300);

          this.setState({ animatingPlane: true });

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
              document.getElementById('plane').style.left = `${
                -450 + i * 3.4
              }px`;
              if (i === 799) {
                this.setState({ animatingPlane: false });
              }
            }, 10 * i);
          }

          // getCurrentLevelRandomWallNumber()
          // This is the code to add random walls onto the grid. The grid is properly re-rendered every 45n i to prevent lag and once again at the end of the iternation
          for (let i = 0; i < Number(getCurrentLevelRandomWallNumber()); i++) {
            setTimeout(() => {
              // console.log(RANDOM_WALL_NUMBER);
              let firstColumn =
                (document.getElementById('plane').getBoundingClientRect().x +
                  520) /
                27.5;

              // Generates a random row and column number
              let row = Math.floor(Math.random() * NUM_ROWS);
              let column = randomIntFromInterval(
                Math.floor(firstColumn),
                Math.ceil(firstColumn)
              );

              let node = this.state.grid[row][column]; // selects the node with the row and column specified above
              let { isEnd, isStart, isWall } = node; // finds out the current properties of the randomly selected node
              let unWallable = isEnd || isStart || node.isPermanentWall; // if the node is a start or end node, or permanent, it cannot be changed

              let grid = this.state.grid;
              // Makes sure the target node is not a wall, and max number of active walls hasnt been reached. Will continue if you are turning a wall into a non wall.
              if (!unWallable) {
                const newNode = {
                  ...node,
                  isWall: !isWall,
                };

                // Places the new node into the grid
                grid[row][column] = newNode;
                // Changes the overall state of the grid which re-renders it.
              }
              if (
                i % 45 === 0 ||
                i === Number(getCurrentLevelRandomWallNumber()) - 1
              )
                this.setState({ grid: grid });
            }, i * 10);
          }
          NUM_WALLS_ACTIVE = 10;
        }
      }
    }
  }

  toggleOptionsMenu() {
    toggleShowingOptionsMenu();
    this.setState({ showOptionsMenu: !this.state.showOptionsMenu });
  }
  saveOptions() {
    toggleShowingOptionsMenu();

    this.toggleOptionsMenu();
  }

  getOptionsMenu() {
    return (
      <>
        <div
          onClick={() => {}}
          style={{
            // backgroundColor: 'rgb(187, 211, 223)',
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
          <div className="levelInfoContainer">
            <p
              style={{ left: '143px', opacity: '1' }}
              className="levelNameToRender"
            >
              Settings
            </p>
          </div>
          <div className="levelInfoContainer2">
            <div
              style={{ right: '220px' }}
              className="toggle-grid-holder text-info"
            >
              Toggle Grid Outline
              <div>
                <NodeToggleGrid
                  currentState={gridOutlineToggled}
                  onClick={() => this.toggleGrid()}
                ></NodeToggleGrid>
              </div>
            </div>

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
        </div>
      </>
    );
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

    let numRandomWallButton;
    let numRandomWallText;

    if (getCurrentLevelRandomWallPresses() !== 0) {
      if (NUM_RANDOM_WALL_PRESSES > 0) {
        numRandomWallButton = (
          <button
            style={{ left: '10px', top: '16px', padding: '5px' }}
            className="standard-button"
            onClick={() => this.startToAnimatePlane()} // add random walls to the grid and animate plane
          >
            Random Walls
          </button>
        );
      } else {
        numRandomWallButton = (
          <button
            style={{
              left: '10px',
              top: '16px',
              padding: '5px',
              opacity: '0.3',
            }}
            className="standard-button-disabled"
            onClick={() => this.startToAnimatePlane()} // add random walls to the grid and animate plane
          >
            Random Walls
          </button>
        );
      }
      numRandomWallText = (
        <p className="numRandomWallText">
          {NUM_RANDOM_WALL_PRESSES} random wall presses left
        </p>
      );
    } else {
      numRandomWallText = null;
      numRandomWallButton = null;
    }

    return (
      <>
        {this.state.showOptionsMenu ? this.getOptionsMenu() : null}
        {plane}

        <div className="topButtonsContainerOutline"> </div>

        <div className="topButtonsContainer">
          {numRandomWallButton}
          <p className="numWallsActiveMessage">
            {NUM_WALLS_ACTIVE} out of {NUM_WALLS_TOTAL} walls used
          </p>
          {numRandomWallText}
          <button
            style={{ right: '100px', top: '16px', padding: '5px' }}
            className="standard-button"
            onClick={() => this.toggleOptionsMenu()} // Options
          >
            Settings
          </button>
          <button
            style={{ right: '10px', top: '16px', padding: '5px' }}
            className="standard-button home-button enabled"
            id="homeButton"
            onClick={() => EnterHome(this.state.animatingPlane)}
          >
            Home
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
        </div>

        <div className="grid" /*  creates the div that holds the rows*/>
          {grid.map((row, rowID) => {
            return (
              <div
                key={
                  rowID
                } /*  creates the div that holds all the nodes in the row*/
              >
                {row.map((node, nodeID) => {
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
                      onClick={(row, col) =>
                        this.toggleWall(
                          row,
                          col,
                          isWall,
                          unWallable,
                          isPermanentWall
                        )
                      }
                      onMouseUp={() => {}}
                      onMouseDown={(row, col) => {}}
                      onMouseEnter={(row, col) => {}}
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
