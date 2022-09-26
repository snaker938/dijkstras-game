import React, { Component } from 'react';
import { getCurrentDisplayOutlineClass } from '../../actualLevelHandling';

import './Node.css';

export default class Node extends Component {
  render() {
    const {
      col,
      row,
      isStart,
      isEnd,
      isWall,
      isPermanentWall,
      onClick,
      onMouseDown,
      onMouseEnter,
      onMouseUp,
    } = this.props; // defines the properties of the node
    const specialNode = getSpecialNode();

    // Checks whether the node is special. ie. is it a wall, a start or end node. If so, give them special css classes
    function getSpecialNode() {
      if (isEnd) return 'node-end';
      else if (isStart) return 'node-start';
      else if (isPermanentWall) return 'node-wall node-permanent-wall';
      else if (isWall) return 'node-wall';
      else return '';
    }
    return (
      // Each node has a default display of "&nbsp". this is a blank space. I added it so that when the innerHTML of the div changes, ie when the paths/nodes are animated and the distances are displayed on each node, the grid is not shifted.
      <div
        id={`node-${row}-${col}`}
        className={`${getCurrentDisplayOutlineClass()} ${specialNode}`}
        onClick={() => onClick(row, col)}
        onMouseEnter={() => onMouseEnter(row, col)}
        onMouseDown={() => onMouseDown(row, col)}
        onMouseUp={() => onMouseUp()}
      >
        &nbsp;
      </div> // returns the node that contains the node class, and a special class if applicable. You can also access the node at a specific position due to each id being unique to a particular node.
    );
  }
}
