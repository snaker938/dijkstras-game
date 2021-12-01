import React, { Component } from "react";
import { EnterHome } from "../Navigation";
import Node from "./Node/Node";
import { resetAllNodes, startDijkstra } from "./Visualizer";
import "./Visualizer.css";

// Placeholders for start node coordinates
let START_NODE_ROW = 0;
let START_NODE_COL = 0;
let END_NODE_ROW = 20;
let END_NODE_COL = 50;

// Specifies the number of rows and columns
const NUM_ROWS = 21;
const NUM_COLUMNS = 51;

// Specifies the number of walls the player can have active at one time
let NUM_WALLS_TOTAL = NUM_ROWS * NUM_COLUMNS;
let NUM_WALLS_ACTIVE = 0;

// Wall Presses
// let NUM_RANDOM_WALL_PRESSES = 5
let RANDOM_WALL_NUMBER = 400;

export default class sandboxVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      dragging: [false, null, null], // 0: is-dragging ; 1: node-being-dragged ; 2: end/previous node
      // sets the default dragging values of the dragging state. The first index is whether dragging is taking place or node. The second index holds the value of the node that dragging first occured on, ie. the node the user originally clicks. The third index holds the value of the previous node, and also holds the value of the current node the user is on when they stop dragging alltogether. The second index is used to get what type of node is being dragged: a start or end node. The third index allows us to remove the class of the previous node, when the new one gets updated to creatr an illusion like the user is actuall dragging the node around.
    };
  }

  //   Initialises grid
  componentDidMount() {
    const grid = initialiseGrid();
    this.setState({ grid });
  }

  // This function is called when a user presses, and holds, but no releases their mouse button on ANY node.
  dragStart(row, col) {
    resetAllNodes(this.state.grid);
    let grid = this.state.grid;
    let node = grid[row][col];
    let nodeBeingDragged = null;
    if (node.isStart || node.isEnd) nodeBeingDragged = node; // this conditional statement is the deciding factor on whether the user is able to drag the node. Aka- it is draggable. A node is only draggable if it is a start or end node
    if (!this.state.dragging[0] && nodeBeingDragged) {
      console.log("starting to drag...");
      this.setState({ dragging: [true, node, node] }); // sets the default dragging values of the dragging state. The first index is whether dragging is taking place or node. The second index holds the value of the node that dragging first occured on, ie. the node the user originally clicks. The third index holds the value of the previous node, and also holds the value of the current node the user is on when they stop dragging alltogether. The second index is used to get what type of node is being dragged: a start or end node. The third index allows us to remove the class of the previous node, when the new one gets updated to create an illusion like the user is actuall dragging the node around.
    }
  }

  dragNode(row, col) {
    // This function only works if the user is dragging a start/end node, and is not trying to drag it onto a start/end node and is not trying to drag it onto a wall if the situtation requires him not to
    if (this.state.dragging[0]) {
      let firstGrid = this.state.grid;
      let nodeBeingDraggedOnto = firstGrid[row][col];

      if (!nodeBeingDraggedOnto.isStart && !nodeBeingDraggedOnto.isEnd) {
        // Stores the previous node so that its class can be removed later to give an illusion that we are dragging the node
        let previousNode = {
          ...this.state.dragging[2],
          isStart: false,
          isEnd: false,
        };

        // Finds the row and column of the previous node so we can add the updated previous node (with no classes on it because it is no longer a start or end node) to the grid
        let previousRow = previousNode.row;
        let previousCol = previousNode.col;
        this.setState({
          dragging: [true, this.state.dragging[1], previousNode],
        }); // sets the current state of dragging with its current indexs so it can be used later on, with the ammended previous node

        // Finds the type of node that is being dragged- is it a start or end node
        let typeBeingDragged;
        if (this.state.dragging[1].isStart) typeBeingDragged = "start";
        if (this.state.dragging[1].isEnd) typeBeingDragged = "end";

        // Store the current state of the grid
        let grid2 = this.state.grid;
        let node = grid2[row][col];
        let newNode = { ...node };

        // Changes the properties of the current node depending on whether it is a start or end node.
        if (typeBeingDragged === "start") {
          newNode = {
            ...node,
            isStart: !node.isStart,
          };
        } else if (typeBeingDragged === "end") {
          newNode = {
            ...node,
            isEnd: !node.isEnd,
          };
        }

        grid2[row][col] = newNode; // sets the position in the grid to the new node with the new properties
        grid2[previousRow][previousCol] = previousNode; // sets the previous node of the grid to have default properties, ie. it is no longer a start or end node
        this.setState({ dragging: [true, this.state.dragging[1], newNode] }); // sets the status of dragging with all the new changes
      }
    }
  }

  // This function is called when the user releases their mouse button and therefore is no longer dragging
  dragStop() {
    // Only works if dragging is taking place
    if (this.state.dragging[0]) {
      console.log("stopped dragging...");
      // Finds the new position of the start OR end node- it doesnt matter
      let newRow = this.state.dragging[2].row;
      let newCol = this.state.dragging[2].col;

      let newSepcialNode = this.state.dragging[2];
      newSepcialNode = { ...newSepcialNode, isWall: false };
      let grid = this.state.grid;
      grid[newRow][newCol] = newSepcialNode;
      this.setState({ grid: grid });
      // newSepcialNode.isWall = false;

      // Checks whether the new node is a start or end node, and then updates the cooridinates of them, otherwise the algorithm will use the old values
      if (this.state.dragging[2].isStart) {
        START_NODE_ROW = newRow;
        START_NODE_COL = newCol;
      } else if (this.state.dragging[2].isEnd) {
        END_NODE_ROW = newRow;
        END_NODE_COL = newCol;
      }

      this.setState({ dragging: [false, null, null] }); // sets the state of dragging to the main default values, waiting for the next time dragging is needed
    }
  }

  // This function removes every wall on the grid
  removeAllWalls() {
    console.log("removing all walls...");
    let grid = [];
    this.setState({ grid: grid });
    grid = initialiseGrid();
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

  // Function to create random walls on the grid.
  randomWalls() {
    for (let i = 0; i < RANDOM_WALL_NUMBER; i++) {
      // Generates a random row and column number
      let row = Math.floor(Math.random() * NUM_ROWS);
      let column = Math.floor(Math.random() * NUM_COLUMNS);
      let node = this.state.grid[row][column]; // selects the node with the row and column specified above
      let { isEnd, isStart, isWall } = node; // finds out the current properties of the randomly selected node
      let unWallable = isEnd || isStart; // if the node is a start or end node, it cannot be changed
      this.toggleWallRandom(row, column, isWall, unWallable); // attempts to change the random node into a wall, unless it is unwallable, or already a wall- the function is still called regard;ess
    }
    NUM_WALLS_ACTIVE = 10;
  }

  // This function is purely for testing the grid templates. No animating or anything is done here
  loadTestGrid() {
    this.removeAllWalls(); // removes all existing walls
    const json = require(`../levels/level1.json`); // stores the contents of the json file to a variable. The grid template can therefore be accessed.
    let newGrid = json.grid; // this gets the actual grid template
    this.setState({ grid: newGrid }); // sets the current state of the grid to the new grid.
  }

  render() {
    const { grid } = this.state;

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
        <button
          className="cool-button"
          onClick={() => this.randomWalls()} /* adds random walls to the grid */
        >
          Random
        </button>
        <button
          className="cool-button"
          onClick={() =>
            this.removeAllWalls()
          } /* adds random walls to the grid */
        >
          Remove Walls
        </button>
        <button
          className="cool-button"
          onClick={() =>
            saveGrid(this.state.grid)
          } /* saves the current state of the grid */
        >
          Save Grid
        </button>
        <button
          className="cool-button"
          onClick={() => this.loadTestGrid()} /* loads the grid*/
        >
          Load Grid
        </button>
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
        <p className="walls-used text-info">{NUM_WALLS_ACTIVE} walls used</p>
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
  const grid = [];
  for (let row = 0; row < NUM_ROWS; row++) {
    const currentRow = [];
    for (let column = 0; column < NUM_COLUMNS; column++) {
      let isStart, isEnd;
      // Gives a isStart or isEnd property to the nodes if they are in a certain position, otherwise they are false
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
  return grid;
};

const createNode = (col, row, isStart = false, isEnd = false) => {
  // Actually creates the node. It has certain paramemeters which can be changed
  return {
    col,
    row,
    isStart: isStart === true,
    isEnd: isEnd === true,
    distance: Infinity,
    isWall: false,
    previousNode: null,
  };
};

// This function sends the current state of the grid to the console. You can then copy this string and paste it into a json file to easily load the grid.
function saveGrid(grid) {
  const jsonString = JSON.stringify(grid);
  console.log(jsonString);
}
