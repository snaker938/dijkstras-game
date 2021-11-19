import React, { Component } from "react";

import "./Node.css";

export default class Node extends Component {
  render() {
    const { col, row, isStart, isEnd, isWall, onClick } = this.props; // defines the properties of the node
    const specialNode = getSpecialNode();

    function getSpecialNode() {
      if (isEnd) return "node-end";
      else if (isStart) return "node-start";
      else if (isWall) return "node-wall";
      else return "";
    }
    return (
      <div
        id={`node-${row}-${col}`}
        className={`node ${specialNode}`}
        onClick={() => onClick(row, col)}
      ></div> // returns the node that contains the node class, and a special class if applicable. You can also access the node at a specific position due to each id being unique to a particular node.
    );
  }
}
