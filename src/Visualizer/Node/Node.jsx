import React, { Component } from 'react';
import { getCurrentDisplayOutlineClass } from '../../optionsHandling';
import './Node.css';

export default class Node extends Component {
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.col !== this.props.col ||
      nextProps.row !== this.props.row ||
      nextProps.isStart !== this.props.isStart ||
      nextProps.isEnd !== this.props.isEnd ||
      nextProps.isWall !== this.props.isWall ||
      nextProps.isPermanentWall !== this.props.isPermanentWall ||
      nextProps.isRandomWall !== this.props.isRandomWall ||
      nextProps.isSolverWall !== this.props.isSolverWall ||
      nextProps.showNodeNumber !== this.props.showNodeNumber ||
      nextProps.nodeNumber !== this.props.nodeNumber
    );
  }

  render() {
    const {
      col,
      row,
      isStart,
      isEnd,
      isWall,
      isPermanentWall,
      isRandomWall,
      isSolverWall,
      showNodeNumber,
      nodeNumber,
      onClick,
      onMouseDown,
      onMouseEnter,
      onMouseUp,
    } = this.props; // defines the properties of the

    const specialNode = getSpecialNode();
    const canShowNodeNumber =
      showNodeNumber &&
      Number.isFinite(Number(nodeNumber)) &&
      Number(nodeNumber) !== Infinity;

    // Checks whether the node is special. ie. is it a wall, a start or end node. If so, give them special css classes
    function getSpecialNode() {
      if (isEnd) return 'node-end';
      else if (isStart) return 'node-start';
      else if (isSolverWall) return 'node-solver-wall';
      else if (isRandomWall) return 'node-wall node-permanent-wall node-random-wall';
      else if (isPermanentWall) return 'node-wall node-permanent-wall';
      else if (isWall) return 'node-wall';
      else return '';
    }
    return (
      // Each node has a default display of "&nbsp". this is a blank space. I added it so that when the innerHTML of the div changes, ie when the paths/nodes are animated and the distances are displayed on each node, the grid is not shifted.
      <div
        id={`node-${row}-${col}`}
        className={`${getCurrentDisplayOutlineClass()} ${specialNode} ${
          showNodeNumber ? 'node-show-number' : ''
        }`}
        onClick={(event) => onClick(row, col, event)}
        onMouseEnter={(event) => onMouseEnter(row, col, event)}
        onMouseDown={(event) => onMouseDown(row, col, event)}
        onMouseUp={(event) => onMouseUp(event)}
      >
        <span className="node-number-label">
          {canShowNodeNumber ? nodeNumber : ''}
        </span>
        &nbsp;
      </div> // returns the node that contains the node class, and a special class if applicable. You can also access the node at a specific position due to each ID being unique to a particular node.
    );
  }
}
