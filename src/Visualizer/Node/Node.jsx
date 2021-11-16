import React, { Component } from "react";

import "./Node.css";

export default class Node extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { col, row, isStart, isEnd, isWall } = this.props;
    const specialNode = isEnd
      ? "node-end"
      : isStart
      ? "node-start"
      : isWall
      ? "node-wall"
      : "";
    return (
      <div id={`node-${row}-${col}`} className={`node ${specialNode}`}></div>
    );
  }
}
