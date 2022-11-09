import React, { Component } from 'react';

import './Node.css';

export default class NodeToggleGrid extends Component {
  render() {
    const { currentState, onClick } = this.props; // defines the properties of the node

    return (
      // Each node has a default display of "&nbsp". this is a blank space. I added it so that when the innerHTML of the div changes, ie when the paths/nodes are animated and the distances are displayed on each node, the grid is not shifted.
      <div
        id={`node-toggleGrid`}
        className={`node-toggleGrid node-toggledGrid-${currentState}`}
        onClick={() => onClick()}
      ></div>
    );
  }
}
