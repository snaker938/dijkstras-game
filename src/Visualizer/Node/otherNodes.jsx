import React, { Component } from "react";

import "./Node.css";

export default class NodeClickable extends Component {
  render() {
    const { type, onClick } = this.props; // defines the properties of the node

    return (
      // Each node has a default display of "&nbsp". this is a blank space. I added it so that when the innerHTML of the div changes, ie when the paths/nodes are animated and the distances are displayed on each node, the grid is not shifted.
      <div
        id={`node-${type}`}
        className={`node-clickable `}
        onClick={() => onClick(type)}
      ></div> // returns the node that contains the node class, and a special class if applicable. You can also access the node at a specific position due to each id being unique to a particular node.
    );
  }
}
