import React, { Component } from "react";
import { dijkstra } from "../algorithms/dijkstra";
import Node from "./Node/Node";

import "./Visualizer.css";

// Placeholders for start node coordinates
const START_NODE_ROW = 0;
const START_NODE_COL = 0;
const END_NODE_ROW = 20;
const END_NODE_COL = 50;

// Specifies the number of rows and columns
const NUM_ROWS = 21;
const NUM_COLUMNS = 51;

// other constants
// const START_NODE_ROW = Math.floor(Math.random() * NUM_ROWS);
// const START_NODE_COL = Math.floor(Math.random() * Math.floor(NUM_COLUMNS / 2));
// const END_NODE_ROW = Math.floor(Math.random() * NUM_ROWS);
// const END_NODE_COL =
//   Math.floor(NUM_COLUMNS / 2) +
//   Math.floor(Math.random() * Math.floor(NUM_COLUMNS / 2));

// Specifies the number of walls the player can have active at one time
let NUM_WALLS_TOTAL = 10000000;
let NUM_WALLS_ACTIVE = 0;
let NUM_RANDOM_WALL_PRESSES = 2;
// let RANDOM_WALL_NUMBER = Math.floor(NUM_ROWS / 2);
let RANDOM_WALL_NUMBER = 400;

export default class dijkstraVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
    };
  }
  // Initialises grid
  componentDidMount() {
    const grid = initialiseGrid();
    this.setState({ grid });
  }
  // Initialises grid
  removeAllWalls() {
    console.log("removing all walls...");
    let grid = [];
    this.setState({ grid });
    grid = initialiseGrid();
    this.setState({ grid });
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
      // let things = dijkstra(
      //   grid,
      //   current_startNode,
      //   current_endNode,
      //   NUM_ROWS,
      //   NUM_COLUMNS
      // );

      // // Loops 250 times- therefore around 250 walls will be made. Chances are, less than 250 walls will be made, as a node may be picked twice, which will reverse the wall.
      // while (things[0] === current_startNode) {
      //   console.log("random walling...");
      //   this.removeAllWalls();
      //   for (let i = 0; i < RANDOM_WALL_NUMBER; i++) {
      //     // Generates a random row and column number
      //     let row = Math.floor(Math.random() * NUM_ROWS);
      //     let column = Math.floor(Math.random() * NUM_COLUMNS);
      //     let node = this.state.grid[row][column]; // selects the node with the row and column specified above
      //     let { isEnd, isStart, isWall } = node; // finds out the current properties of the randomly selected node
      //     let unWallable = isEnd || isStart; // if the node is a start or end node, it cannot be changed
      //     this.toggleWallRandom(row, column, isWall, unWallable); // attempts to change the random node into a wall, unless it is unwallable, or already a wall- the function is still called regard;ess
      //   }

      //   things = dijkstra(
      //     this.state.grid,
      //     current_startNode,
      //     current_endNode,
      //     NUM_ROWS,
      //     NUM_COLUMNS
    }
    NUM_RANDOM_WALL_PRESSES--;
  }

  animateAllNodes(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 7 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
        document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
          visitedNodesInOrder[i].distance;
      }, 5 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
        document.getElementById(`node-${node.row}-${node.col}`).innerHTML =
          nodesInShortestPathOrder[i].distance;
      }, 5 * i);
    }
  }

  animateNoProperPath() {
    let errorMessage = this.sendError();
    for (let i = 0; i < errorMessage.length; i++) {
      setTimeout(() => {
        const node = errorMessage[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-wall";
      }, 1.5 * i);
    }
  }

  sendError() {
    // this.removeAllWalls();
    const grid = this.state.grid;
    let E = [];
    let R1 = [];
    let R2 = [];
    let O = [];
    let R3 = [];

    let errorMessage = [];
    return errorMessage.concat(E, R1, R2, O, R3);
  }

  saveGrid() {
    const grid = this.state.grid;
    console.log(grid);
    let fs = require("fs");

    fs.readFile("src/templates/NO-PATH.json", "utf8", function (err, data) {
      if (err) {
        console.log(err);
      } else {
        const file = JSON.parse(data);
        file.grid.push({ grid });

        const json = JSON.stringify(file);

        fs.writeFile(
          "src/templates/NO-PATH.json",
          json,
          "utf8",
          function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("DONE!");
              //Everything went OK!
            }
          }
        );
      }
    });
  }

  // Starts the dijkstra algorithm. It calls dijkstra.js to find the visited nodes in order
  startDijkstra() {
    const { grid } = this.state; // gets the current state of the grid at the time of the button being pressed
    const current_endNode = grid[END_NODE_ROW][END_NODE_COL];
    const current_startNode = grid[START_NODE_ROW][START_NODE_COL]; // gets the start and end nodes
    const dijkstraOutputs = dijkstra(
      grid,
      current_startNode,
      current_endNode,
      NUM_ROWS,
      NUM_COLUMNS
    ); // calls dijkstra to get the shortest path to the end node
    let pathFound = dijkstraOutputs[2];
    if (pathFound) {
      let shortestNodePathOrder = dijkstraOutputs[0];
      let allNodes = dijkstraOutputs[1];

      this.animateAllNodes(allNodes, shortestNodePathOrder);
    } else this.animateNoProperPath();
  }

  render() {
    const { grid } = this.state;

    return (
      <>
        <p class="cool-text-bar"></p>
        <button
          className="cool-button"
          onClick={() =>
            this.startDijkstra()
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
            this.saveGrid()
          } /* saves the current state of the grid */
        >
          Save Grid
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
