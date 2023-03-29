import React, { Component } from 'react';

import './Node.css';

export default class NodeToggleGrid extends Component {
  render() {
    const { currentState, onClick } = this.props; // defines the properties of the node

    return (
      <div
        id={`node-toggleGrid`}
        className={`node-toggleGrid node-toggledGrid-${currentState}`}
        onClick={() => onClick()}
      ></div>
    );
  }
}
