import React, { Component } from "react";

import "./Node.css";

export default class Node extends Component {
  render() {
    const { col, row, isStart, isEnd, isWall, onClick } = this.props; // defines the properties of the node
    const specialNode = isEnd
      ? "node-end"
      : isStart
      ? "node-start"
      : isWall
      ? "node-wall"
      : "";
    return (
      <div
        id={`node-${row}-${col}`}
        className={`node ${specialNode}`}
        onClick={() => onClick(row, col)}
      ></div> // returns the node that contains the node class, and a special class if applicable. You can also access the node at a specific position due to each id being unique to a particular node.
    );
  }
}
