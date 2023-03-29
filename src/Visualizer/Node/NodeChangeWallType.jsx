import React, { Component } from 'react';

import './Node.css';

export default class NodeChangeWallType extends Component {
  render() {
    const { onClick, currentState } = this.props;
    return (
      <div
        id={`node-clickable`}
        className={`node-clickable ${currentState}`}
        onClick={() => onClick()}
      ></div>
    );
  }
}
