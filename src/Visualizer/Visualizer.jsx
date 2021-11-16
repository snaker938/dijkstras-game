import React, { Component } from "react";
import { dijkstra } from "../algorithms/dijkstra";
import Node from "./Node/Node";

import "./Visualizer.css";

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const END_NODE_ROW = 10;
const END_NODE_COL = 35;

export default class dijkstraVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
    };
  }

  componentDidMount() {
    const grid = initialiseGrid();
    this.setState({ grid });
  }

  startDijkstra() {
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const endNode = grid[END_NODE_ROW][END_NODE_COL];
    const visitedNodesInOrder = dijkstra(grid, startNode, endNode);
  }

  render() {
    const { grid } = this.state;

    return (
      <>
        <button onClick={() => this.startDijkstra()}>Start</button>
        <div className="grid">
          {grid.map((row, rowID) => {
            return (
              <div key={rowID}>
                {row.map((node, nodeID) => {
                  const { row, col, isEnd, isStart, isWall } = node;
                  return (
                    <Node
                      col={col}
                      row={row}
                      isStart={isStart}
                      isEnd={isEnd}
                      isWall={isWall}
                      key={nodeID}
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

const initialiseGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let column = 0; column < 50; column++) {
      let isStart, isEnd;
      if (row === START_NODE_ROW && column === START_NODE_COL) {
        isStart = true;
      } else if (row === END_NODE_ROW && column === END_NODE_COL) {
        isEnd = true;
      }
      currentRow.push(createNode(column, row, isStart, isEnd));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row, isStart = false, isEnd = false) => {
  return {
    col,
    row,
    isStart: isStart === true,
    isEnd: isEnd === true,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};
