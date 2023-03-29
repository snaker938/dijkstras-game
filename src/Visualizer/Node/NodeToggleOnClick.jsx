import React, { Component } from 'react';

import './Node.css';

export default class NodeToggleOnClick extends Component {
  render() {
    const { currentState, onClick } = this.props; // defines the properties of the

    return (
      <div
        id={`node-toggleOnClick`}
        className={`node-onclick-${currentState}`}
        onClick={() => onClick()}
      ></div>
    );
  }
}
