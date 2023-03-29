import React, { Component } from 'react';
import './Node.css';

export default class NodeSmaller extends Component {
  render() {
    const { col, row, isStart, isEnd, isWall, isPermanentWall } = this.props; // defines the properties of the node

    const specialNode = getSpecialNode();

    // Checks whether the node is special. ie. is it a wall, a start or end node. If so, give them special CSS classes
    function getSpecialNode() {
      if (isEnd) return 'node-smaller-end';
      else if (isStart) return 'node-smaller-start';
      else if (isPermanentWall)
        return 'node-smaller-wall node-smaller-permanent-wall';
      else if (isWall) return 'node-smaller-wall';
      else return '';
    }
    return (
      // Each node has a default display of "&nbsp". this is a blank space. I added it so that when the innerHTML of the div changes, ie when the paths/nodes are animated and the distances are displayed on each node, the grid is not shifted.
      <div
        id={`node-smaller-${row}-${col}`}
        className={`nodeSmallerNoOutline ${specialNode}`}
      >
        &nbsp;
      </div> // returns the node that contains the node class, and a special class if applicable. You can also access the node at a specific position due to each ID being unique to a particular node.
    );
  }
}
