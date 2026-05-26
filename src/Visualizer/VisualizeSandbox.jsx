import React, { Component } from 'react';
import {
  getActualCurrentEndDistance,
  randomIntFromInterval,
  setCurrentEndDistance,
} from '../actualLeveHandling';
import { getLevelData, numLevels } from '../allLevelData';
import Node from './Node/Node';
import { cloneVariable, resetAllNodes, startDijkstra } from './Visualizer';
import NodeChangeWallType from './Node/NodeChangeWallType';
import './VisualizeSandbox.css';
import {
  togglePermanentWall,
  permanentWallToggled,
  gridOutlineToggled,
  setGridOutlineToggled,
  isGridOutlineToggled,
  getToggleWallOnClick,
  setToggleWallOnClick,
  getHasGridBeenReset,
  setHasGridBeenReset,
} from '../optionsHandling';
import NodeToggleGrid from './Node/NodeToggleGrid';
import { EnterHome } from '../Navigation';
import NodeToggleOnClick from './Node/NodeToggleOnClick';
import ScrollableBox from './Components/ScrollableBox';
import NodeSmaller from './Node/SmallerNode';
import planeFrame1 from '../assets/Animated/1.png';
import planeFrame2 from '../assets/Animated/2.png';
import planeFrame3 from '../assets/Animated/3.png';
import planeFrame4 from '../assets/Animated/4.png';
import planeSoundEffect from '../assets/Animated/plane_sound_effect.mp3';
import {
  deleteUserLevel,
  getSpecificUserLevel,
  getUserLevelsFromLocalStorage,
  renameUserLevel,
  saveUserLevels,
} from '../currentUserDataHandling';
import { getPlaneTravelBounds, getVisualizerLayout } from './visualizerLayout';

// Placeholders for start node coordinates
let START_NODE_ROW = 0;
let START_NODE_COL = 0;
let END_NODE_ROW = 25;
let END_NODE_COL = 50;

// Specifies the number of rows and columns
const NUM_ROWS = 26;
const NUM_COLUMNS = 51;
const PLANE_FRAMES = [planeFrame1, planeFrame2, planeFrame3, planeFrame4];
const templateModules = import.meta.glob('./templates/*.json', { eager: true });

function getTemplateGrid(templateName) {
  const template = templateModules[`./templates/${templateName}.json`];

  if (!template) return null;

  return cloneVariable((template.default ?? template).grid);
}

// The maximum number of walls that can be placed randomly on the grid
let RANDOM_WALL_NUMBER = 400;

export default class sandboxVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      showOptionsMenu: false,
      optionsPage: 1,
      animatingPlane: false,
      draggingWall: false,
      defaultUserLevelInput: '',
      lastAddedUserLevel: '',
      levelClicked: -1,
      renamingUserLevel: false,
      gridScale: 1,
      gridTop: 88,
      gridLeft: 24,
      gridWidth: 1281,
      gridHeight: 650,
      nodeWidth: 25.1,
      nodeHeight: 25,
      nodeFontSize: 12,
      dragging: [false, null, null], // 0: is-dragging ; 1: node-being-dragged ; 2: end/previous node
      //sets the default dragging values of the dragging state. The first index is whether dragging is taking place or node. The second index holds the value of the node that dragging first occurred on, ie. the node the user originally clicks. The third index holds the value of the previous node, and also holds the value of the current node the user is on when they stop dragging all together. The second index is used to get what type of node is being dragged: a start or end node. The third index allows us to remove the class of the previous node, when the new one gets updated to create an illusion like the user is actual dragging the node around.
    };

    this.visualizerRef = React.createRef();
    this.planeRef = React.createRef();
    this.activeTimeouts = new Set();
    this.layoutFrameId = null;
    this.planeFrameId = null;
    this.activePlaneAudio = null;
    this.isUnmounted = false;
  }

  // If the Escape button is pressed, run the Show Options function
  handleKeyPress = (event) => {
    if (event.key === 'Escape') {
      if (!this.state.showOptionsMenu) this.toggleOptionsMenu();
    }
  };

  componentDidMount() {
    this.isUnmounted = false;
    document.addEventListener('keydown', this.handleKeyPress, false);
    window.addEventListener('resize', this.updateVisualizerLayout);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.updateVisualizerLayout);
    }
    const grid = initialiseGrid();
    this.setState({ grid });
    this.updateVisualizerLayout();
    [100, 300, 800, 1600].forEach((delay) => {
      this.setManagedTimeout(this.updateVisualizerLayout, delay);
    });
  }

  componentWillUnmount() {
    this.isUnmounted = true;
    document.removeEventListener('keydown', this.handleKeyPress, false);
    window.removeEventListener('resize', this.updateVisualizerLayout);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener(
        'resize',
        this.updateVisualizerLayout
      );
    }
    this.clearManagedTimers();
    this.stopPlaneAudio();
    if (this.layoutFrameId) window.cancelAnimationFrame(this.layoutFrameId);
    if (this.planeFrameId) window.cancelAnimationFrame(this.planeFrameId);
  }

  setManagedTimeout = (callback, delay) => {
    const timeoutId = window.setTimeout(() => {
      this.activeTimeouts.delete(timeoutId);
      if (!this.isUnmounted) callback();
    }, delay);

    this.activeTimeouts.add(timeoutId);
    return timeoutId;
  };

  clearManagedTimers = () => {
    for (const timeoutId of this.activeTimeouts) {
      window.clearTimeout(timeoutId);
    }
    this.activeTimeouts.clear();
  };

  stopPlaneAudio = () => {
    if (!this.activePlaneAudio) return;

    this.activePlaneAudio.pause();
    this.activePlaneAudio.currentTime = 0;
    this.activePlaneAudio = null;
  };

  updateVisualizerLayout = () => {
    if (this.layoutFrameId) window.cancelAnimationFrame(this.layoutFrameId);

    this.layoutFrameId = window.requestAnimationFrame(() => {
      this.layoutFrameId = null;
      if (this.isUnmounted || !this.visualizerRef.current) return;

      const topbar =
        this.visualizerRef.current &&
        this.visualizerRef.current.querySelector('.topButtonsContainer');
      const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 70;
      const {
        gridScale: nextGridScale,
        gridTop: nextGridTop,
        gridLeft: nextGridLeft,
        gridWidth: nextGridWidth,
        gridHeight: nextGridHeight,
        nodeWidth: nextNodeWidth,
        nodeHeight: nextNodeHeight,
        nodeFontSize: nextNodeFontSize,
      } = getVisualizerLayout({
        rows: NUM_ROWS,
        columns: NUM_COLUMNS,
        topbarHeight,
      });

      if (
        nextGridScale !== this.state.gridScale ||
        nextGridTop !== this.state.gridTop ||
        nextGridLeft !== this.state.gridLeft ||
        nextGridWidth !== this.state.gridWidth ||
        nextGridHeight !== this.state.gridHeight ||
        nextNodeWidth !== this.state.nodeWidth ||
        nextNodeHeight !== this.state.nodeHeight ||
        nextNodeFontSize !== this.state.nodeFontSize
      ) {
        this.setState({
          gridScale: nextGridScale,
          gridTop: nextGridTop,
          gridLeft: nextGridLeft,
          gridWidth: nextGridWidth,
          gridHeight: nextGridHeight,
          nodeWidth: nextNodeWidth,
          nodeHeight: nextNodeHeight,
          nodeFontSize: nextNodeFontSize,
        });
      }
    });
  };

  getPlaneWallColumn() {
    const planeElement = this.planeRef.current;
    const gridElement =
      this.visualizerRef.current &&
      this.visualizerRef.current.querySelector('.visualizer-grid');

    if (!planeElement || !gridElement) return null;

    const planeRect = planeElement.getBoundingClientRect();
    const gridRect = gridElement.getBoundingClientRect();
    const cellWidth = gridRect.width / NUM_COLUMNS;

    if (!cellWidth) return null;

    const columnPosition = (planeRect.right - gridRect.left) / cellWidth;

    return randomIntFromInterval(
      Math.floor(columnPosition),
      Math.ceil(columnPosition)
    );
  }

  toggleOptionsMenu() {
    this.setState({ showOptionsMenu: !this.state.showOptionsMenu });
  }

  setHomeButtonEnabled(enabled) {
    const homeButton = document.getElementById('homeButton');
    if (!homeButton) return;

    homeButton.classList.toggle('enabled', enabled);
  }

  finishPlaneAnimation = () => {
    if (this.planeFrameId) {
      window.cancelAnimationFrame(this.planeFrameId);
      this.planeFrameId = null;
    }

    this.stopPlaneAudio();
    const planeElement = this.planeRef.current;
    if (planeElement) planeElement.style.display = 'none';

    if (!this.isUnmounted) {
      this.setState({ animatingPlane: false });
      this.setHomeButtonEnabled(true);
    }
  };

  startPlaneRun(onWallTick) {
    const planeElement = this.planeRef.current;
    const gridElement =
      this.visualizerRef.current &&
      this.visualizerRef.current.querySelector('.visualizer-grid');
    const travelBounds = getPlaneTravelBounds(gridElement, planeElement);

    if (!planeElement || !travelBounds) {
      this.finishPlaneAnimation();
      return;
    }

    const duration = 6500;
    let startTime = null;
    let lastWallTick = -1;
    let frameIndex = 0;
    let lastTurbineFrameTime = 0;

    planeElement.style.display = 'block';
    planeElement.style.left = `${travelBounds.startX}px`;
    planeElement.src = PLANE_FRAMES[0];

    this.activePlaneAudio = new Audio(planeSoundEffect);
    const playPromise = this.activePlaneAudio.play();
    if (playPromise) playPromise.catch(() => {});
    this.setManagedTimeout(this.stopPlaneAudio, 6300);

    const step = (timestamp) => {
      if (this.isUnmounted) return;

      if (startTime === null) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentLeft =
        travelBounds.startX +
        (travelBounds.endX - travelBounds.startX) * progress;
      planeElement.style.left = `${currentLeft}px`;

      if (timestamp - lastTurbineFrameTime >= 100) {
        frameIndex = (frameIndex + 1) % PLANE_FRAMES.length;
        planeElement.src = PLANE_FRAMES[frameIndex];
        lastTurbineFrameTime = timestamp;
      }

      const nextWallTick = Math.min(
        RANDOM_WALL_NUMBER - 1,
        Math.floor(progress * RANDOM_WALL_NUMBER)
      );
      for (let tick = lastWallTick + 1; tick <= nextWallTick; tick++) {
        onWallTick(tick);
      }
      lastWallTick = nextWallTick;

      if (progress < 1) {
        this.planeFrameId = window.requestAnimationFrame(step);
      } else {
        this.finishPlaneAnimation();
      }
    };

    this.planeFrameId = window.requestAnimationFrame(step);
  }

  addRandomPlaneWall(tick) {
    const column = this.getPlaneWallColumn();
    const grid = this.state.grid;

    if (column !== null && column >= 0 && column < NUM_COLUMNS) {
      const row = Math.floor(Math.random() * NUM_ROWS);
      const node = grid[row][column];
      const unWallable = node.isEnd || node.isStart || node.isPermanentWall;

      if (!unWallable) {
        grid[row][column] = {
          ...node,
          isWall: true,
        };
      }
    }

    if (tick % 45 === 0 || tick === RANDOM_WALL_NUMBER - 1) {
      this.setState({ grid });
    }
  }

  // Animate plane and place random walls on the grid
  startToAnimatePlane() {
    const homeButton = document.getElementById('homeButton');
    if (
      !homeButton ||
      !homeButton.classList.contains('enabled') ||
      this.state.animatingPlane
    ) {
      return;
    }

    this.setHomeButtonEnabled(false);
    resetAllNodes(this.state.grid);
    this.setState({ animatingPlane: true });
    this.startPlaneRun((tick) => this.addRandomPlaneWall(tick));
  }

  dragWallStart() {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      resetAllNodes(this.state.grid);
      this.setState({ draggingWall: true });
    }
  }

  // This function is called when a user presses, and holds, but not releases their mouse button on ANY node.
  dragStart(row, col) {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      resetAllNodes(this.state.grid);
      let grid = this.state.grid;
      let node = grid[row][col];
      let nodeBeingDragged = null;

      if (node.isStart || node.isEnd) nodeBeingDragged = node; // this conditional statement is the deciding factor on whether the user is able to drag the node. Aka- it is draggable. A node is only draggable if it is a start or end node

      if (nodeBeingDragged == null && node.isWall && !node.isPermanentWall)
        // if the node is a wall, but not a permanent one, then the dragWall function is called
        this.dragWallStart();
      else if (!this.state.dragging[0] && nodeBeingDragged) {
        this.setState({ dragging: [true, node, node] }); // sets the default dragging values of the dragging state. The first index is whether dragging is taking place or node. The second index holds the value of the node that dragging first occured on, ie. the node the user originally clicks. The third index holds the value of the previous node, and also holds the value of the current node the user is on when they stop dragging alltogether. The second index is used to get what type of node is being dragged: a start or end node. The third index allows us to remove the class of the previous node, when the new one gets updated to create an illusion like the user is actuall dragging the node around.
      }
    }
  }

  // This function is called when a user moves their mouse while holding down their mouse button on ANY node (i.e. hovering over a node)
  dragNode(row, col) {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      // This function only works if the user is dragging a start/end node, and is not trying to drag it onto a start/end node and is not trying to drag it onto a wall if the situtation requires him not to
      if (this.state.dragging[0]) {
        let firstGrid = this.state.grid;
        let nodeBeingDraggedOnto = firstGrid[row][col];

        if (!nodeBeingDraggedOnto.isStart && !nodeBeingDraggedOnto.isEnd) {
          // Retrieves the previous node and removes its start/end properties
          let previousNode = {
            ...this.state.dragging[2],
            isStart: false,
            isEnd: false,
          };

          // Finds the row and column of the previous node so we can add the updated previous node (with no classes on it because it is no longer a start or end node) to the grid
          let previousRow = previousNode.row;
          let previousCol = previousNode.col;

          // Store the current state of the grid
          let grid2 = this.state.grid;
          let node = grid2[row][col];
          let newNode = { ...node };

          // Finds the type of node that is being dragged- is it a start or end node
          let typeBeingDragged;
          if (this.state.dragging[1].isStart) typeBeingDragged = 'start';
          if (this.state.dragging[1].isEnd) typeBeingDragged = 'end';

          // Changes the properties of the current node depending on whether it is a start or end node.
          if (typeBeingDragged === 'start') {
            newNode = {
              ...node,
              isStart: !node.isStart,
            };
          } else if (typeBeingDragged === 'end') {
            newNode = {
              ...node,
              isEnd: !node.isEnd,
            };
          }

          grid2[row][col] = newNode; // sets the position in the grid to the new node with the new properties
          grid2[previousRow][previousCol] = previousNode; // sets the previous node of the grid to have default properties, ie. it is no longer a start or end node

          this.setState({ dragging: [true, this.state.dragging[1], newNode] }); // sets the status of dragging with all the new changes
        }
      } else if (this.state.draggingWall) {
        // These lines of code only run if the user is dragging a wall
        let grid = this.state.grid;
        let node = grid[row][col];
        let newNode = { ...node };
        if (!node.isStart && !node.isEnd && !node.isPermanentWall) {
          newNode = {
            ...node,
            isWall: true,
          };
          grid[row][col] = newNode;
          this.setState({ grid });
        }
      }
    }
  }

  // This function is called when the user releases their mouse button and therefore is no longer dragging
  dragStop() {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      // Only works if dragging is taking place
      if (this.state.dragging[0]) {
        // Finds the new position of the start OR end node- it doesnt matter
        let newRow = this.state.dragging[2].row;
        let newCol = this.state.dragging[2].col;

        let newSepcialNode = this.state.dragging[2];
        newSepcialNode = {
          ...newSepcialNode,
          isWall: false,
          isPermanentWall: false,
        };

        let grid = this.state.grid;
        grid[newRow][newCol] = newSepcialNode;
        this.setState({ grid: grid });

        // Checks whether the new node is a start or end node, and then updates the cooridinates of them, otherwise the algorithm will use the old values
        if (this.state.dragging[2].isStart) {
          START_NODE_ROW = newRow;
          START_NODE_COL = newCol;
        } else if (this.state.dragging[2].isEnd) {
          END_NODE_ROW = newRow;
          END_NODE_COL = newCol;
        }

        this.setState({ dragging: [false, null, null] }); // sets the state of dragging to the main default values, waiting for the next time dragging is needed
      } else if (this.state.draggingWall) {
        this.setState({ draggingWall: false });
      }
    }
  }

  // When a node is clicked, unless it is the start or end node, it gets toggled between a wall and not-wall
  toggleWall(row, col, isWall, unWallable, isPermanentWall) {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      if (!getHasGridBeenReset() && !getToggleWallOnClick()) {
        resetAllNodes(this.state.grid);
        setHasGridBeenReset(true);
        return;
      } else {
        resetAllNodes(this.state.grid);
        setHasGridBeenReset(true);
      }

      // If the error animation has shown, then the grid need to be reset to its default state
      if (!unWallable) {
        let node = this.state.grid[row][col];
        let grid = this.state.grid;
        if (permanentWallToggled) {
          // Creates a temporary node with the new property of isWall set to the opposite of its current state. If permanent wall is toggled, then the new node will switch between a permanent and non-permanent wall.
          const newNode = {
            ...node,
            isWall: !isPermanentWall,
            isPermanentWall: !isPermanentWall,
          };
          // Places the new node into the grid
          grid[row][col] = newNode;
        } else {
          const newNode = {
            ...node,
            isWall: !isWall,
            isPermanentWall: false,
          };
          // Places the new node into the grid
          grid[row][col] = newNode;
        }
        // Changes the overall state of the grid which re-renders it.
        this.setState({ grid: grid });
      }
    }
  }

  toggleGrid() {
    let node = document.getElementById(`node-toggleGrid`);
    if (node.classList.contains(`node-toggledGrid-true`))
      document.getElementById(`node-toggleGrid`).className = `node-toggleGrid`;
    else
      document.getElementById(
        `node-toggleGrid`
      ).className = `node-toggleGrid node-toggledGrid-true`;
    let grid = this.state.grid;

    for (const row of grid) {
      for (const node of row) {
        let nodeElement = document.getElementById(
          `node-${node.row}-${node.col}`
        );
        if (gridOutlineToggled) {
          nodeElement.classList.remove('nodeOutline');
          nodeElement.classList.add('nodeNoOutline');
        } else {
          nodeElement.classList.remove('nodeNoOutline');
          nodeElement.classList.add('nodeOutline');
        }
      }
    }

    if (gridOutlineToggled) {
      setGridOutlineToggled(false);
    } else {
      setGridOutlineToggled(true);
    }
  }

  toggleBetweenWallType() {
    togglePermanentWall();
    let node = document.getElementById(`node-clickable`);
    if (node.classList.contains(`node-clickable-toggled`))
      document.getElementById(`node-clickable`).className = `node-clickable`;
    else
      document.getElementById(
        `node-clickable`
      ).className = `node-clickable node-clickable-toggled`;
  }

  toggleOnClick() {
    setToggleWallOnClick(!getToggleWallOnClick());

    let node = document.getElementById(`node-toggleOnClick`);

    if (node.classList.contains(`node-onclick-true`))
      document.getElementById(
        `node-toggleOnClick`
      ).className = `node-onclick-false`;
    else
      document.getElementById(
        `node-toggleOnClick`
      ).className = `node-onclick-true`;
  }

  nextOptionsMenuPage(next) {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      if (next) {
        this.setState({ optionsPage: 2 });
      } else {
        this.setState({
          defaultUserLevelInput: '',
          lastAddedUserLevel: '',
          levelClicked: -1,
          renamingUserLevel: false,
        });
        this.setState({ optionsPage: 1 });
      }
    }
  }

  userLevelButtonClicked(id) {
    if (!this.state.renamingUserLevel) {
      if (id === this.state.levelClicked) {
        this.setState({ levelClicked: -1 });
        document.getElementById('saveLevelInput').style.display = '';
        document.getElementById('saveCurrentGridText').style.display = '';
      } else {
        this.setState({ levelClicked: Number(id) });
        document.getElementById('saveLevelInput').style.display = 'none';
        document.getElementById('saveCurrentGridText').style.display = 'none';
      }
    }
  }

  deleteUserLevel(id) {
    this.setState({ levelClicked: -1 });
    this.setState({ renamingUserLevel: false });
    this.setState({ lastAddedUserLevel: '' });
    this.setState({ defaultUserLevelInput: '' });
    deleteUserLevel(id);
  }

  renameUserLevel(id, name) {
    //  If the id is false, then the user has clicked the rename button. If the name is false, then the user has clicked the svg.
    if (name === false) {
      this.setState({ renamingUserLevel: true });
      document.getElementById('saveLevelInput').value = '';
      document.getElementById(
        'saveCurrentGridText'
      ).innerHTML = `Rename Level ${id + 1}:`;
    } else {
      if (this.checkLevelInput(name)) {
        id = document
          .getElementById('saveCurrentGridText')
          .innerHTML.trim()
          .slice(-2, -1);

        id = Number(id) - 1;

        renameUserLevel(id, name);
        document.getElementById(
          'saveCurrentGridText'
        ).innerHTML = `Save Current Grid:`;
        document.getElementById('saveLevelInput').value = '';
        this.setState({ renamingUserLevel: false });
        this.setState({ lastAddedUserLevel: '' });
        this.setState({ defaultUserLevelInput: '' });
      }
    }
  }

  loadUserGrid(id) {
    resetAllNodes(this.state.grid);
    setHasGridBeenReset(true);

    this.setState({ grid: getSpecificUserLevel(id)[1] });
    this.setState({ levelClicked: -1 });
    this.setState({ renamingUserLevel: false });
    this.setState({ lastAddedUserLevel: '' });
    this.setState({ defaultUserLevelInput: '' });
    this.setState({ optionsPage: 1 });
    this.setState({ showOptionsMenu: false });

    START_NODE_ROW = getSpecificUserLevel(id)[2][0][0];
    START_NODE_COL = getSpecificUserLevel(id)[2][0][1];
    END_NODE_ROW = getSpecificUserLevel(id)[2][1][0];
    END_NODE_COL = getSpecificUserLevel(id)[2][1][1];
  }

  getUserLevelButtons() {
    const buttons = [];
    let levelName = null;
    let allUserlevels = getUserLevelsFromLocalStorage();

    for (let i = 0; i <= allUserlevels.length - 1; i++) {
      levelName = allUserlevels[i][0];

      buttons.push(
        <button
          className={
            i === this.state.levelClicked
              ? 'userLevelButtonsClicked'
              : 'userLevelButtons'
          }
          id={i}
          onClick={() => {
            this.userLevelButtonClicked(i);
          }}
          key={i}
        >
          <span>
            <div style={{ position: 'absolute', marginLeft: '8px' }}>
              {i + 1}
              {'.'}{' '}
            </div>
            <span
              style={
                i < 10 ? { marginLeft: '3.4rem' } : { marginLeft: '3.5rem' }
              }
            >
              {levelName}

              {i === this.state.levelClicked ? (
                <>
                  <span style={{ float: 'right', marginRight: '10px' }}>
                    <svg
                      stroke="darkgrey"
                      fill="none"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ stroke: 'darkgrey' }} // Add initial stroke color
                      onClick={() => {
                        this.deleteUserLevel(i);
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget
                          .querySelectorAll('line, polyline, path')
                          .forEach((el) => {
                            el.setAttribute('stroke', 'red');
                          });
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget
                          .querySelectorAll('line, polyline, path')
                          .forEach((el) => {
                            el.setAttribute('stroke', 'darkgrey');
                          });
                      }}
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </span>

                  <span style={{ float: 'right', marginRight: '13px' }}>
                    <svg
                      stroke="darkgrey"
                      fill="none"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                      onClick={() => {
                        this.renameUserLevel(i, false);
                      }}
                      style={{ stroke: 'darkgrey' }} // Add initial stroke color
                      onMouseOver={(e) => {
                        e.currentTarget
                          .querySelectorAll('line, polyline, path')
                          .forEach((el) => {
                            el.setAttribute('stroke', 'white');
                          });
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget
                          .querySelectorAll('line, polyline, path')
                          .forEach((el) => {
                            el.setAttribute('stroke', 'darkgrey');
                          });
                      }}
                    >
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </span>
                </>
              ) : null}
            </span>
          </span>
        </button>
      );
    }

    return buttons;
  }

  // This function will alert the user that the level name they entered is not allowed
  checkLevelInput(saveLevelInput) {
    if (
      saveLevelInput === ' ' ||
      saveLevelInput === '' ||
      saveLevelInput === 'ERROR: INVALID INPUT' ||
      saveLevelInput.match(/[!#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/) ||
      saveLevelInput.match(/^(\s{2,}|[!#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/) ||
      saveLevelInput.match(/\s{2,}/) ||
      saveLevelInput.charAt(saveLevelInput.length - 1) === ' '
    ) {
      document.getElementById('saveLevelInput').value = 'ERROR: INVALID INPUT';
      document.getElementById('saveLevelInput').style.color = 'red';

      // Change the box style/value default after a set amount of time
      this.setManagedTimeout(() => {
        if (document.getElementById('saveLevelInput')) {
          if (
            document.getElementById('saveLevelInput').value ===
            'ERROR: INVALID INPUT'
          ) {
            document.getElementById('saveLevelInput').value = '';
            document.getElementById('saveLevelInput').style.color = 'white';
            this.setState({ defaultUserLevelInput: '' });
          }
        }
      }, 3000);
      return false;
    } else {
      return true;
    }
  }

  handleInputChange = (event) => {
    this.setState({
      defaultUserLevelInput: event.target.value,
    });
  };

  getOptionsMenu() {
    let currentPermanentWallClass = null;

    if (permanentWallToggled)
      currentPermanentWallClass = 'node-clickable-toggled';
    else currentPermanentWallClass = 'node-clickable';

    let optionsMenuPageButton = null;
    if (this.state.optionsPage === 1) {
      optionsMenuPageButton = (
        <button
          className="optionsMenuButton"
          onClick={() => {
            this.nextOptionsMenuPage(true);
          }}
        >
          Next
        </button>
      );
    } else {
      optionsMenuPageButton = (
        <button
          className="optionsMenuButton"
          onClick={() => {
            this.nextOptionsMenuPage(false);
          }}
        >
          Previous
        </button>
      );
    }

    function addUserLevel(saveLevelInput) {
      let userLevel = [
        saveLevelInput,
        this.state.grid,
        [
          [START_NODE_ROW, START_NODE_COL],
          [END_NODE_ROW, END_NODE_COL],
        ],
      ];

      if (this.checkLevelInput(saveLevelInput)) {
        this.setState({ defaultUserLevelInput: '' });
        saveUserLevels(userLevel);
        changeColorSuccess();
      }
    }

    function changeColorSuccess() {
      document.getElementById('saveLevelInput').value = 'LEVEL SAVED!';
      document.getElementById('saveLevelInput').style.color = 'green';
    }

    // Changes the color of the input box text to the default colour (from red), if the user clicks the box before it changes automatically
    function changeColor() {
      if (document.getElementById('saveLevelInput').style.color === 'red') {
        document.getElementById('saveLevelInput').value = '';
        this.setState({ defaultUserLevelInput: '' });
      } else if (
        document.getElementById('saveLevelInput').style.color === 'green'
      ) {
        document.getElementById('saveLevelInput').value =
          this.state.lastAddedUserLevel;
      }
      document.getElementById('saveLevelInput').style.color = 'white';
    }

    let grid = null;
    if (this.state.levelClicked !== -1)
      grid = getSpecificUserLevel(this.state.levelClicked)[1];

    return (
      <>
        <div
          className="visualizer-modal-backdrop"
        ></div>
        <div className="visualizer-modal-shell visualizer-options-shell">
          <div className="mainInfoContainer">
            <p className="mainTextToRender">
              Settings
            </p>
          </div>

          <div className="mainInfoContainer2">
            {this.state.optionsPage === 1 ? (
              <>
                <div>
                  <div className="toggle-grid-holder text-info">
                    Toggle Grid Outline
                    <div>
                      <NodeToggleGrid
                        currentState={isGridOutlineToggled()}
                        onClick={() => this.toggleGrid()}
                      ></NodeToggleGrid>
                    </div>
                  </div>

                  <div className="toggle-onclick-holder text-info">
                    Toggle Wall After Animation
                    <div>
                      <NodeToggleOnClick
                        currentState={getToggleWallOnClick()}
                        onClick={() => this.toggleOnClick()}
                      ></NodeToggleOnClick>
                    </div>
                  </div>

                  <div className="toggle-permanent-holder text-info">
                    Toggle Permanent Wall
                    <div>
                      <NodeChangeWallType
                        currentState={currentPermanentWallClass}
                        onClick={() => this.toggleBetweenWallType()}
                      ></NodeChangeWallType>
                    </div>
                  </div>
                  <div
                    className="optionsMenuDevelopment"
                  >
                    <p className="developmentOptionsText">
                      Development Options
                    </p>
                    <div>
                      <div>
                        <p
                          className="endDistanceOptions"
                        >
                          Load Level Name:
                        </p>
                        <input
                          type="text"
                          id="loadLevelInput"
                          className="usernameInput visualizer-small-input"
                          maxLength={22}
                          spellCheck="false"
                          defaultValue={''}
                        ></input>
                      </div>
                      <button
                        className="standard-button-options saveGridButton"
                        onClick={() => saveGrid(this.state.grid)} // outputs the current grid so that it can be saved
                      >
                        Save Grid
                      </button>
                      <button
                        className="standard-button-options loadGridButton"
                        onClick={() => this.loadTestGrid()} // loads current grid
                      >
                        Load Grid
                      </button>

                      <div>
                        <p className="endDistanceOptions">Set End Distance:</p>
                        <input
                          type="text"
                          id="endDistanceInput"
                          className="usernameInput visualizer-small-input"
                          maxLength={22}
                          spellCheck="false"
                          defaultValue={getActualCurrentEndDistance()}
                        ></input>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <ScrollableBox height={200}>
                  {this.getUserLevelButtons()}
                </ScrollableBox>

                <div>
                  <div>
                    <p
                      id="saveCurrentGridText"
                      className="endDistanceOptions save-current-grid-text"
                    >
                      Save Current Grid:
                    </p>

                    <input
                      type="text"
                      id="saveLevelInput"
                      className="usernameInput save-level-input"
                      maxLength={250}
                      spellCheck="false"
                      defaultValue={this.state.defaultUserLevelInput}
                      onClick={() => {
                        changeColor.call(this);
                      }}
                      onChange={this.handleInputChange}
                    ></input>

                    {!this.state.renamingUserLevel &&
                    this.state.levelClicked !== -1 ? (
                      <>
                        <div className="wrapperDiv">
                          <div className="outerSmallerGridContainer">
                            <div className="gridSmaller">
                              {grid.map((row, rowID) => {
                                return (
                                  <div key={rowID}>
                                    {row.map((node, nodeID) => {
                                      const {
                                        row,
                                        col,
                                        isEnd,
                                        isStart,
                                        isWall,
                                        isPermanentWall,
                                      } = node;

                                      return (
                                        <NodeSmaller
                                          col={col}
                                          row={row}
                                          isStart={isStart}
                                          isEnd={isEnd}
                                          isWall={isWall}
                                          isPermanentWall={isPermanentWall}
                                          key={nodeID}
                                        ></NodeSmaller>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <button
                          className="optionsMenuButton"
                          id="loadUserGridButton"
                          onClick={() => {
                            this.loadUserGrid(this.state.levelClicked);
                          }}
                        >
                          Load Grid
                        </button>
                      </>
                    ) : null}

                    {this.state.defaultUserLevelInput !== '' &&
                    !this.state.renamingUserLevel &&
                    this.state.levelClicked === -1 &&
                    document.getElementById('saveLevelInput').value !== '' ? (
                      <>
                        <button
                          className="standard-button-options saveUserGridButton"
                          onClick={() =>
                            addUserLevel.call(
                              this,
                              document.getElementById('saveLevelInput').value
                            )
                          }
                        >
                          Save Grid
                        </button>
                      </>
                    ) : null}
                    {this.state.renamingUserLevel ? (
                      <button
                        className="standard-button-options saveUserGridButton"
                        onClick={() =>
                          this.renameUserLevel(
                            null,
                            document.getElementById('saveLevelInput').value
                          )
                        }
                      >
                        Rename Level
                      </button>
                    ) : null}
                  </div>
                </div>
              </>
            )}

            {optionsMenuPageButton}

            {this.state.optionsPage === 1 ? (
              <>
                <button
                  className="optionsMenuButton"
                  onClick={() => {
                    this.saveOptions();
                  }}
                >
                  Save
                </button>
              </>
            ) : null}
          </div>
        </div>
      </>
    );
  }

  saveOptions() {
    if (
      document.getElementById('endDistanceInput').value !==
      getActualCurrentEndDistance()
    ) {
      setCurrentEndDistance(document.getElementById('endDistanceInput').value);
    }
    this.toggleOptionsMenu();
  }

  // This function is purely for testing the grid templates
  loadTestGrid() {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      // If the value of loadLevelInput is not between 1 and 15 (or is not a special grid template), then nothing will happen. If it is, then the grid will be loaded with the corresponding grid template
      const loadLevelInput = document.getElementById('loadLevelInput').value.trim();
      const levelNumber = Number(loadLevelInput);

      if (
        Number.isInteger(levelNumber) &&
        levelNumber >= 1 &&
        levelNumber <= numLevels
      ) {
        this.removeAllWalls(); // removes all existing walls

        const level = getLevelData(levelNumber);

        this.setState({
          grid: cloneVariable(level.grid),
        });

        // Change the coordinates of the start and end nodes
        START_NODE_ROW = level.startNodeCoords[1];
        START_NODE_COL = level.startNodeCoords[0];
        END_NODE_ROW = level.endNodeCoords[1];
        END_NODE_COL = level.endNodeCoords[0];
      } else {
        const templateGrid = getTemplateGrid(loadLevelInput);

        if (templateGrid) {
          this.removeAllWalls(); // removes all existing walls
          this.setState({ grid: templateGrid });
        }
      }
    }
  }

  // This function removes every wall on the grid
  removeAllWalls() {
    let grid = [];
    this.setState({ grid: grid });
    grid = initialiseGrid();
    this.setState({ grid: grid });
  }

  render() {
    const { grid } = this.state;

    let src = planeFrame1;

    let plane = null;

    plane = (
      <img
        className="plane"
        src={src}
        alt={`plane`}
        id={`plane`}
        key={`planes`}
        height={500}
        width={350}
        ref={this.planeRef}
        style={{ display: 'none' }}
      />
    );

    return (
      <div
        className="visualize-screen visualize-sandbox-screen"
        ref={this.visualizerRef}
        style={{
          '--visualizer-grid-scale': String(this.state.gridScale),
          '--visualizer-grid-top': `${this.state.gridTop}px`,
          '--visualizer-grid-left': `${this.state.gridLeft}px`,
          '--visualizer-grid-width': `${this.state.gridWidth}px`,
          '--visualizer-grid-height': `${this.state.gridHeight}px`,
          '--visualizer-node-width': `${this.state.nodeWidth}px`,
          '--visualizer-node-height': `${this.state.nodeHeight}px`,
          '--visualizer-node-font-size': `${this.state.nodeFontSize}px`,
        }}
      >
        {this.state.showOptionsMenu ? this.getOptionsMenu() : null}

        <div
          style={{
            backgroundColor: 'lightblue',
            position: 'absolute',
            left: '0px',
            width: '100%',
            height: '100vh',
          }}
        ></div>

        {plane}
        <div className="topButtonsContainerOutline"></div>
        <div className="topButtonsContainer">
          <button
            className="standard-button topbar-control random-walls-button"
            onClick={() => this.startToAnimatePlane()} // add random walls to the grid and animate plane
          >
            Random Walls
          </button>

          <button
            className="button-82-pushable start-button"
            onClick={() =>
              startDijkstra(
                this.state.grid,
                END_NODE_ROW,
                END_NODE_COL,
                START_NODE_ROW,
                START_NODE_COL,
                NUM_ROWS,
                NUM_COLUMNS
              )
            }
          >
            <span className="button-82-shadow"></span>
            <span className="button-82-edge"></span>
            <span className="button-82-front text">Start</span>
          </button>

          <button
            className="standard-button topbar-control settings-button"
            onClick={() => this.toggleOptionsMenu()} // Options
          >
            Settings
          </button>

          <button
            className="standard-button topbar-control home-button enabled"
            id="homeButton"
            onClick={() => EnterHome(this.state.animatingPlane)}
          >
            Home
          </button>
        </div>

        <div className="visualizer-grid-viewport">
          <div
            className="grid visualizer-grid"
            /*  creates the div that holds the rows*/
          >
            {/* Loops through the grid variable */}
            {grid.map((row, rowID) => {
              return (
                <div
                  key={
                    rowID
                  } /* Creates a div for each row, and assigns a key to it*/
                >
                  {row.map((node, nodeID) => {
                    // Destructures the node object and assigns it to variables
                    const {
                      row,
                      col,
                      isEnd,
                      isStart,
                      isWall,
                      isPermanentWall,
                    } = node;
                    let unWallable = isEnd || isStart; // checks to see if the node is an End or start node

                    return (
                      // Creates the node object inside each row div. Each node is a div that is returned in Node.jsx
                      <Node
                        col={col}
                        row={row}
                        isStart={isStart}
                        isEnd={isEnd}
                        isWall={isWall}
                        isPermanentWall={isPermanentWall}
                        key={nodeID}
                        onClick={(row, col) => {
                          this.toggleWall(
                            row,
                            col,
                            isWall,
                            unWallable,
                            isPermanentWall
                          );
                        }}
                        onMouseUp={() => this.dragStop()}
                        onMouseDown={(row, col) => this.dragStart(row, col)}
                        onMouseEnter={(row, col) => this.dragNode(row, col)}
                      ></Node>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

// Initialises the grid
const initialiseGrid = () => {
  // Loops through the rows and columns and creates a node for each position
  const grid = [];
  for (let row = 0; row < NUM_ROWS; row++) {
    const currentRow = [];
    for (let column = 0; column < NUM_COLUMNS; column++) {
      let isStart, isEnd;
      // Checks if the current node is the start or end node, and sets the boolean accordingly
      if (row === START_NODE_ROW && column === START_NODE_COL) {
        isStart = true;
      } else if (row === END_NODE_ROW && column === END_NODE_COL) {
        isEnd = true;
      }
      // Creates the node given the paremeters, and adds it to the current row
      currentRow.push(createNode(column, row, isStart, isEnd));
    }
    // Adds the current row to the grid
    grid.push(currentRow);
  }
  // returns the grid
  return grid;
};

const createNode = (col, row, isStart = false, isEnd = false) => {
  // Actually creates the node. It has certain paramemeters which can be changed later on
  return {
    col,
    row,
    isStart: isStart === true,
    isEnd: isEnd === true,
    distance: Infinity,
    isWall: false,
    isPermanentWall: false,
    previousNode: null,
  };
};

// This function sends the current state of the grid to the console. You can then copy this string and paste it into a json file to easily load the grid.
function saveGrid(grid) {
  return JSON.stringify(grid);
}
