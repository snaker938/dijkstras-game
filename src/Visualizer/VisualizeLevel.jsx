import React, { Component } from "react";
// import { dijkstra } from "../algorithms/dijkstra";
import { resetAllNodes, startDijkstra } from "./Visualizer2";
import {
  getCurrentLevelGrid,
  getCurrentLevelID,
  getCurrentLevelLives,
  getCurrentLevelName,
  getCurrentLevelNodeCoords,
  getCurrentLevelRandomWallNumber,
  getCurrentLevelRandomWallPresses,
  getCurrentLevelWallsAllowed,
} from "../currentLevelHandling";
import { EnterHome } from "../Navigation";
import Node from "./Node/Node";
import "./Visualizer.css";

// Placeholders for start node coordinates. It gets the current level data
let START_NODE_ROW = getCurrentLevelNodeCoords()[0][1];
let START_NODE_COL = getCurrentLevelNodeCoords()[0][0];
let END_NODE_ROW = getCurrentLevelNodeCoords()[1][1];
let END_NODE_COL = getCurrentLevelNodeCoords()[1][0];

// Specifies the number of rows and columns
const NUM_ROWS = 21;
const NUM_COLUMNS = 51;

// Specifies the number of walls the player can have active at one time
let NUM_WALLS_TOTAL = getCurrentLevelWallsAllowed();
let NUM_WALLS_ACTIVE = 0;

// Wall Presses
let NUM_RANDOM_WALL_PRESSES = getCurrentLevelRandomWallPresses();
let RANDOM_WALL_NUMBER = getCurrentLevelRandomWallNumber();

// Other level constants
let LEVEL_NAME = getCurrentLevelName();
let LEVEL_ID = getCurrentLevelID();
let LIVES = getCurrentLevelLives();
// 0,1,2,3 star ---

// The class for the level visualizer
export default class levelVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      dragging: [false, null, null], // 0: is-dragging ; 1: node-being-dragged ; 2: end/previous node
      // sets the default dragging values of the dragging state. The first index is whether dragging is taking place or node. The second index holds the value of the node that dragging first occured on, ie. the node the user originally clicks. The third index holds the value of the previous node, and also holds the value of the current node the user is on when they stop dragging alltogether. The second index is used to get what type of node is being dragged: a start or end node. The third index allows us to remove the class of the previous node, when the new one gets updated to creatr an illusion like the user is actuall dragging the node around.
    };
  }

  //Initialises grid to the level grid
  componentDidMount() {
    const grid = getCurrentLevelGrid();
    this.setState({ grid: grid });
  }

  // This function removes every wall on the grid
  removeAllWalls() {
    console.log("removing all walls...");
    let grid = [];
    this.setState({ grid: grid });
    grid = getCurrentLevelGrid();
    this.setState({ grid: grid });
    NUM_WALLS_ACTIVE = 0;
  }

  // When a node is clicked, unless it is the start or end node, it gets toggled between a wall and not-wall
  toggleWall(row, col, isWall, unWallable) {
    let node = this.state.grid[row][col];
    let grid = this.state.grid;
    // Makes sure the target node is not a wall, and max number of active walls hasnt been reached. Will continue if you are turning a wall into a non wall.
    if ((!unWallable && NUM_WALLS_ACTIVE < NUM_WALLS_TOTAL) || isWall) {
      // If it isnt a wall currently, increase the number of active walls by one, else decrease them
      if (!unWallable && !isWall) NUM_WALLS_ACTIVE = NUM_WALLS_ACTIVE + 1;
      else if (!unWallable && isWall) NUM_WALLS_ACTIVE = NUM_WALLS_ACTIVE - 1;
      // Creates a temporary node with the new property of isWall set to the opposite of its current state.
      const newNode = {
        ...node,
        isWall: !isWall,
      };
      // Places the new node into the grid
      grid[row][col] = newNode;
      // Changes the overall state of the grid which re-renders it.
      this.setState({ grid: grid });
    }
  }
  toggleWallRandom(row, col, isWall, unWallable) {
    let node = this.state.grid[row][col];
    let grid = this.state.grid;
    // Makes sure the target node is not a wall, and max number of active walls hasnt been reached. Will continue if you are turning a wall into a non wall.
    if (!unWallable) {
      const newNode = {
        ...node,
        isWall: !isWall,
      };
      // Places the new node into the grid
      grid[row][col] = newNode;
      // Changes the overall state of the grid which re-renders it.
      this.setState({ grid: grid });
    }
  }

  // Function to create random walls on the grid. There will ALWAYS be a path, no matter what.
  randomWalls() {
    if (NUM_RANDOM_WALL_PRESSES > 0) {
      // let { grid } = this.state; // gets the current state of the grid at the time of the button being pressed
      // let current_endNode = grid[END_NODE_ROW][END_NODE_COL];
      // let current_startNode = grid[START_NODE_ROW][START_NODE_COL]; // gets the start and end nodes

      for (let i = 0; i < RANDOM_WALL_NUMBER; i++) {
        // Generates a random row and column number
        let row = Math.floor(Math.random() * NUM_ROWS);
        let column = Math.floor(Math.random() * NUM_COLUMNS);
        let node = this.state.grid[row][column]; // selects the node with the row and column specified above
        let { isEnd, isStart, isWall } = node; // finds out the current properties of the randomly selected node
        let unWallable = isEnd || isStart; // if the node is a start or end node, it cannot be changed
        this.toggleWallRandom(row, column, isWall, unWallable); // attempts to change the random node into a wall, unless it is unwallable, or already a wall- the function is still called regard;ess
      }
      NUM_RANDOM_WALL_PRESSES--;
      NUM_WALLS_ACTIVE = 10;
    }
  }

  render() {
    const { grid } = this.state;
    let numRandomWallButton;

    if (NUM_RANDOM_WALL_PRESSES !== 0) {
      numRandomWallButton = (
        <button
          className="cool-button"
          onClick={() => this.randomWalls()} /* adds random walls to the grid */
        >
          Random
        </button>
      );
    } else {
      numRandomWallButton = null;
    }

    return (
      <>
        <p className="cool-text-bar"></p>
        <button
          className="cool-button"
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
          } /* starts the dijstra algorithm process */
        >
          Start
        </button>
        {numRandomWallButton}
        <button
          className="cool-button"
          onClick={() =>
            resetAllNodes(this.state.grid)
          } /* resets all animations*/
        >
          UnAnimate
        </button>
        <button
          className="cool-button"
          onClick={() => EnterHome()} /* goes home*/
        >
          Home
        </button>
        <p className="walls-used text-info">
          {NUM_WALLS_ACTIVE} out of {NUM_WALLS_TOTAL} walls used
        </p>
        <p className="walls-random-used text-info">
          {NUM_RANDOM_WALL_PRESSES} random wall presses left
        </p>
        <div className="grid" /*  creates the div that holds the rows*/>
          {grid.map((row, rowID) => {
            return (
              <div
                key={
                  rowID
                } /*  creates the div that holds all the nodes in the row*/
              >
                {row.map((node, nodeID) => {
                  const { row, col, isEnd, isStart, isWall } = node;
                  let unWallable = isEnd || isStart; // checks to see if the node is an End or start node
                  return (
                    // Creates the node object inside each row div. Each node is a div that is returned in Node.jsx
                    <Node
                      col={col}
                      row={row}
                      isStart={isStart}
                      isEnd={isEnd}
                      isWall={isWall}
                      key={nodeID}
                      onClick={(row, col) =>
                        this.toggleWall(row, col, isWall, unWallable)
                      }
                      onMouseUp={() => {}}
                      onMouseDown={() => {}}
                      onMouseEnter={() => {}}
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
