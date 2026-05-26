import React, { Component } from 'react';
import {
  getCurrentTutorialStatus,
  randomIntFromInterval,
  toggleHasShownTutorial,
  toggleHasTutorialEnded,
} from '../actualLeveHandling';
import {
  currentLevel,
  getCurrentLevelEndDistance,
  getCurrentLevelGrid,
  getCurrentLevelID,
  getCurrentLevelName,
  getCurrentLevelNodeCoords,
  getCurrentLevelRandomWallPresses,
  getCurrentLevelWallsAllowed,
} from '../currentLevelHandling';
import {
  getCurrentDialogueLineNumberEnd,
  getCurrentDialogueStatus,
  getCurrentLevelDialogue,
  getCurrentLevelSpeakerPosition,
  getHasDialogueEnded,
  getSceneBreakerIndexes,
  getSceneNextPageIndexes,
  setHasDialogueEnded,
  setHasShownDialogueMenu,
  toggleDialogueMenu,
} from '../dialogueManager';
import { EnterHome } from '../Navigation';
import {
  getHasGridBeenReset,
  getMissileTrailLength,
  getShowCampaignNodeNumbers,
  getToggleWallOnClick,
  gridOutlineToggled,
  setGridOutlineToggled,
  setHasGridBeenReset,
  setMissileTrailLength,
  setShowCampaignNodeNumbers,
  setToggleWallOnClick,
} from '../optionsHandling';
import Node from './Node/Node';
import NodeToggleGrid from './Node/NodeToggleGrid';
import NodeToggleOnClick from './Node/NodeToggleOnClick';
import planeFrame1 from '../assets/Animated/1.png';
import planeFrame2 from '../assets/Animated/2.png';
import planeFrame3 from '../assets/Animated/3.png';
import planeFrame4 from '../assets/Animated/4.png';
import planeSoundEffect from '../assets/Animated/plane_sound_effect.mp3';
import blankTemplate from './templates/BLANK.json';
import './VisualizeLevel.css';
import { cloneVariable, resetAllNodes, startDijkstra } from './Visualizer';
import { getPlaneTravelBounds, getVisualizerLayout } from './visualizerLayout';

// Placeholders for start node coordinates. It gets the current level data
let START_NODE_ROW;
let START_NODE_COL;

let END_NODE_ROW;
let END_NODE_COL;

// Specifies the number of rows and columns
const NUM_ROWS = 26;
const NUM_COLUMNS = 51;
const PLANE_FRAMES = [planeFrame1, planeFrame2, planeFrame3, planeFrame4];

// Specifies the number of walls the player can have active at one time
let NUM_WALLS_TOTAL;
let NUM_WALLS_ACTIVE;

// Wall Presses
let NUM_RANDOM_WALL_PRESSES;
let RANDOM_WALL_NUMBER;

// Other level constants
let LEVEL_NAME;
let LEVEL_ID;

// reloads all level data
function reloadLevelData() {
  // Placeholders for start node coordinates. It gets the current level data
  START_NODE_ROW = getCurrentLevelNodeCoords()[0][1];
  START_NODE_COL = getCurrentLevelNodeCoords()[0][0];

  END_NODE_ROW = getCurrentLevelNodeCoords()[1][1];
  END_NODE_COL = getCurrentLevelNodeCoords()[1][0];

  // Specifies the number of walls the player can have active at one time
  NUM_WALLS_TOTAL = getCurrentLevelWallsAllowed();
  NUM_WALLS_ACTIVE = 0;

  // Wall Presses
  NUM_RANDOM_WALL_PRESSES = getCurrentLevelRandomWallPresses();
  RANDOM_WALL_NUMBER = 400;

  // Other level constants
  LEVEL_NAME = getCurrentLevelName();
  LEVEL_ID = getCurrentLevelID();
}

export default class levelVisualizer extends Component {
  constructor() {
    super();
    const initialLayout = getVisualizerLayout({
      rows: NUM_ROWS,
      columns: NUM_COLUMNS,
      topbarHeight: 70,
    });

    this.state = {
      grid: [],
      showOptionsMenu: false, // is the options menu showing
      showTutorialMenu: false,
      tutorialPage: 1,
      animatingPlane: false,
      showDialogueMenu: false,
      dialogueLineNumber: 0,
      dialogueStartLoop: 0,
      dialogueNeedsPageBreak: false,
      dialogueOverflowNextLine: null,
      ...initialLayout,
      settingsRefresh: 0,
    };

    this.visualizerRef = React.createRef();
    this.dialogueBodyRef = React.createRef();
    this.planeRef = React.createRef();
    this.activeTimeouts = new Set();
    this.layoutFrameId = null;
    this.dialogueFrameId = null;
    this.planeFrameId = null;
    this.topbarResizeObserver = null;
    this.activePlaneAudio = null;
    this.isUnmounted = false;
    reloadLevelData();
    NUM_WALLS_ACTIVE = 0;
  }

  // If the Escape button is pressed, run the Show Options function
  handleKeyPress = (event) => {
    if (
      event.key === 'Escape' &&
      !this.state.showTutorialMenu &&
      !this.state.showDialogueMenu
    ) {
      if (!this.state.showOptionsMenu) this.toggleOptionsMenu();
    }

    // If the Enter button is pressed, go to the Next page of the tutorial menu
    if (
      event.key === 'Enter' &&
      this.state.showTutorialMenu &&
      !(this.state.tutorialPage === 3)
    ) {
      this.nextPage();
    }

    if (event.key === 'Enter' && this.state.showDialogueMenu) {
      event.preventDefault();
      this.advanceDialogueLine();
    }
  };

  componentDidMount() {
    this.isUnmounted = false;
    document.addEventListener('keydown', this.handleKeyPress, false);
    window.addEventListener('resize', this.updateVisualizerLayout);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.updateVisualizerLayout);
    }
    this.loadBlankGrid();
    this.updateVisualizerLayout();
    [100, 300, 800, 1600].forEach((delay) => {
      this.setManagedTimeout(this.updateVisualizerLayout, delay);
    });
    this.observeTopbarLayout();
    this.syncIntroMenus();
  }

  componentDidUpdate(prevProps, prevState) {
    this.syncIntroMenus();

    if (
      prevState.showDialogueMenu !== this.state.showDialogueMenu ||
      prevState.showTutorialMenu !== this.state.showTutorialMenu ||
      prevState.showOptionsMenu !== this.state.showOptionsMenu
    ) {
      this.updateVisualizerLayout();
    }

    if (
      this.state.showDialogueMenu &&
      (prevState.showDialogueMenu !== this.state.showDialogueMenu ||
        prevState.dialogueLineNumber !== this.state.dialogueLineNumber ||
        prevState.dialogueStartLoop !== this.state.dialogueStartLoop ||
        prevState.dialogueNeedsPageBreak !== this.state.dialogueNeedsPageBreak)
    ) {
      this.scheduleDialogueMeasurement();
    }
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
    if (this.topbarResizeObserver) {
      this.topbarResizeObserver.disconnect();
      this.topbarResizeObserver = null;
    }
    if (this.layoutFrameId) window.cancelAnimationFrame(this.layoutFrameId);
    if (this.dialogueFrameId) window.cancelAnimationFrame(this.dialogueFrameId);
    if (this.planeFrameId) window.cancelAnimationFrame(this.planeFrameId);
  }

  observeTopbarLayout = () => {
    if (!window.ResizeObserver || !this.visualizerRef.current) return;

    const topbar = this.visualizerRef.current.querySelector(
      '.topButtonsContainer'
    );

    if (!topbar) return;

    this.topbarResizeObserver = new ResizeObserver(this.updateVisualizerLayout);
    this.topbarResizeObserver.observe(topbar);
  };

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

  syncIntroMenus = () => {
    if (LEVEL_ID > 1) toggleHasTutorialEnded();

    if (!getCurrentDialogueStatus() && !this.state.showDialogueMenu) {
      this.setState({ showDialogueMenu: true }, this.updateVisualizerLayout);
      toggleDialogueMenu();
      return;
    }

    if (
      Number(currentLevel) === 1 &&
      !getCurrentTutorialStatus() &&
      getHasDialogueEnded() &&
      !this.state.showTutorialMenu
    ) {
      this.setState({ showTutorialMenu: true }, this.updateVisualizerLayout);
      toggleHasShownTutorial();
    }
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

      if (this.state.showDialogueMenu) {
        if (this.state.dialogueNeedsPageBreak) {
          this.setState(
            {
              dialogueNeedsPageBreak: false,
              dialogueOverflowNextLine: null,
            },
            this.scheduleDialogueMeasurement
          );
        } else {
          this.scheduleDialogueMeasurement();
        }
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

  loadBlankGrid() {
    const newGrid = cloneVariable(blankTemplate.grid);
    this.setState({ grid: newGrid });
  }

  loadRealGrid() {
    const newGrid = getCurrentLevelGrid();
    this.setState({ grid: newGrid });
  }

  toggleDialogueMenu() {
    this.setState({ showDialogueMenu: !this.state.showDialogueMenu });
  }

  closeDialogueMenu() {
    this.setState({
      showDialogueMenu: false,
      dialogueNeedsPageBreak: false,
      dialogueOverflowNextLine: null,
    });
    setHasDialogueEnded(true);
    setHasShownDialogueMenu(true);

    if (currentLevel > 1) this.loadRealGrid();
  }

  getDialogueMarkerIndexes() {
    return new Set([...getSceneBreakerIndexes(), ...getSceneNextPageIndexes()]);
  }

  isDialogueMarkerIndex(index) {
    return this.getDialogueMarkerIndexes().has(Number(index));
  }

  getLastDialogueLineIndex() {
    for (let i = getCurrentDialogueLineNumberEnd() - 1; i >= 0; i--) {
      if (!this.isDialogueMarkerIndex(i)) return i;
    }

    return 0;
  }

  getNextDialogueLineIndex(index) {
    const finalIndex = getCurrentDialogueLineNumberEnd();
    let nextIndex = Number(index) + 1;

    while (nextIndex < finalIndex && this.isDialogueMarkerIndex(nextIndex)) {
      nextIndex++;
    }

    return Math.min(nextIndex, finalIndex);
  }

  advanceDialogueLine = () => {
    if (this.state.dialogueNeedsPageBreak) {
      this.advanceDialoguePage();
      return;
    }

    if (this.state.dialogueLineNumber >= this.getLastDialogueLineIndex()) {
      return;
    }

    const nextIndex = this.getNextDialogueLineIndex(
      this.state.dialogueLineNumber
    );

    if (nextIndex < getCurrentDialogueLineNumberEnd()) {
      this.setState({ dialogueLineNumber: nextIndex });
    }
  };

  advanceDialoguePage = () => {
    const nextIndex =
      this.state.dialogueOverflowNextLine ??
      this.getNextDialogueLineIndex(this.state.dialogueLineNumber);

    if (nextIndex >= getCurrentDialogueLineNumberEnd()) return;

    this.setState({
      dialogueStartLoop: nextIndex,
      dialogueLineNumber: nextIndex,
      dialogueNeedsPageBreak: false,
      dialogueOverflowNextLine: null,
    });
  };

  scrollDialogueToBottom = () => {
    const dialogueBody = this.dialogueBodyRef.current;
    if (!dialogueBody) return;
    dialogueBody.scrollTo({
      top: dialogueBody.scrollHeight,
      behavior: 'smooth',
    });
  };

  scheduleDialogueMeasurement = () => {
    if (this.dialogueFrameId) window.cancelAnimationFrame(this.dialogueFrameId);

    this.dialogueFrameId = window.requestAnimationFrame(() => {
      this.dialogueFrameId = null;
      this.measureDialoguePage();
    });
  };

  measureDialoguePage = () => {
    const dialogueBody = this.dialogueBodyRef.current;
    if (!dialogueBody || !this.state.showDialogueMenu) return;

    const hasOverflow =
      dialogueBody.scrollHeight > dialogueBody.clientHeight + 2;

    if (
      hasOverflow &&
      this.state.dialogueLineNumber > this.state.dialogueStartLoop
    ) {
      const overflowLine = this.state.dialogueLineNumber;

      this.setState({
        dialogueLineNumber: this.getPreviousDialogueLineIndex(overflowLine),
        dialogueNeedsPageBreak: true,
        dialogueOverflowNextLine: overflowLine,
      });
      return;
    }

    this.scrollDialogueToBottom();
  };

  getPreviousDialogueLineIndex(index) {
    for (let i = Number(index) - 1; i >= this.state.dialogueStartLoop; i--) {
      if (!this.isDialogueMarkerIndex(i)) return i;
    }

    return this.state.dialogueStartLoop;
  }

  getDialogueNextButton(dialogueLineNumber) {
    if (dialogueLineNumber >= this.getLastDialogueLineIndex()) {
      return (
        <button
          className="optionsMenuButton"
          onClick={() => {
            this.closeDialogueMenu();
          }}
        >
          Exit
        </button>
      );
    }

    if (this.state.dialogueNeedsPageBreak) {
      return (
        <button
          className="optionsMenuButton"
          onClick={() => {
            this.advanceDialoguePage();
          }}
        >
          Continue
        </button>
      );
    }

    return null;
  }

  getDialogueBlocks(currentDialogueLineNumber) {
    let dialogueBlocks = [];
    let enterText = '<hit enter>';
    let continueText = '<press continue>';
    let markerIndexes = this.getDialogueMarkerIndexes();

    let currentLevelSpeakerPosition = cloneVariable(
      getCurrentLevelSpeakerPosition()
    );
    let currentLevelDialogue = cloneVariable(getCurrentLevelDialogue());

    for (
      let i = this.state.dialogueStartLoop;
      i < getCurrentDialogueLineNumberEnd();
      i++
    ) {
      if (markerIndexes.has(i)) continue;

      let dialogue;

      let textToDisplay = this.state.dialogueNeedsPageBreak
        ? continueText
        : enterText;

      // If the currentLevelDialogue[i][0] is "", then dialogue is given the className of "dialogueBlockTextOther". If the currentLevelSpeakerPosition[i] is 1, then dialogue is given the className of "dialogue-left-side". If it is 2, then dialogue is given the className of "dialogue-right-side".

      // If the currentLevelDialogue[i][0] is not "", then dialogue is given the className of "dialogueBlockText". If the currentLevelSpeakerPosition[i] is 1, then dialogue is given the className of "dialogue-left-side". If it is 2, then dialogue is given the className of "dialogue-right-side".

      // The text "<hit enter>" should only be displayed at the end of all the dialogue that is visible on the screen. This is done by checking if the i is equal to currentDialogueLineNumber. The text should have an opacity of 0.75.

      let dialogueBlockPosition;
      if (currentLevelSpeakerPosition[i] === 1) {
        dialogueBlockPosition = 'dialogue-left-side';
      } else if (currentLevelSpeakerPosition[i] === 2) {
        dialogueBlockPosition = 'dialogue-right-side';
      } else {
        dialogueBlockPosition = 'dialogue-centre';
      }

      if (currentLevelDialogue[i][0] === '') {
        dialogue = (
          <React.Fragment key={`dialogue-${i}`}>
            <div
              className={dialogueBlockPosition}
              style={{
                display: i <= currentDialogueLineNumber ? 'inline' : 'none',
              }}
            >
              <p style={{ opacity: '0.85' }} className="dialogueBlockTextOther">
                {currentLevelDialogue[i][1]}
              </p>
            </div>

            {i === currentDialogueLineNumber ? (
              <div
                className={dialogueBlockPosition}
                style={{
                  display: i <= currentDialogueLineNumber ? 'inline' : 'none',
                }}
              >
                <p
                  style={{
                    opacity: '0.75',
                    display:
                      this.state.dialogueLineNumber ===
                      this.getLastDialogueLineIndex()
                        ? 'none'
                        : null,
                  }}
                  className="dialogueBlockTextOther"
                >
                  {textToDisplay}
                </p>
              </div>
            ) : null}
          </React.Fragment>
        );
      } else {
        dialogue = (
          <React.Fragment key={`dialogue-${i}`}>
            <div
              className={dialogueBlockPosition}
              style={{
                display: i <= currentDialogueLineNumber ? 'inline' : 'none',
              }}
            >
              <p className="dialogueBlockText">
                <span
                  style={{
                    opacity: '0.7',
                    color:
                      currentLevelDialogue[i][0] === '<Mr Smith>'
                        ? '#ffcccc'
                        : null,
                  }}
                >
                  {currentLevelDialogue[i][0]}
                </span>{' '}
                {currentLevelDialogue[i][1]}
              </p>
            </div>
            {i === currentDialogueLineNumber ? (
              <div
                className={dialogueBlockPosition}
                style={{
                  display: i <= currentDialogueLineNumber ? 'inline' : 'none',
                }}
              >
                <p
                  style={{
                    opacity: '0.75',
                    display:
                      this.state.dialogueLineNumber ===
                      this.getLastDialogueLineIndex()
                        ? 'none'
                        : null,
                  }}
                  className="dialogueBlockTextOther"
                >
                  {textToDisplay}
                </p>
              </div>
            ) : null}
          </React.Fragment>
        );
      }

      dialogueBlocks.push(dialogue);
    }
    return dialogueBlocks;
  }

  getSkipAllDialogueButton() {
    return (
        <button
          id="skipAllDialogueButton"
          className="optionsMenuButton visualizer-skip-button"
          onClick={() => {
            this.closeDialogueMenu();
          }}
      >
        Skip...
      </button>
    );
  }

  getDialogueMenu() {
    let dialogueNextButton = this.getDialogueNextButton(
      this.state.dialogueLineNumber
    );

    let skipAllDialogueButton = this.getSkipAllDialogueButton();

    let dialogueBlocks = this.getDialogueBlocks(this.state.dialogueLineNumber);

    return (
      <>
        <div
          onClick={() => {}}
          className="visualizer-modal-backdrop"
        ></div>
        {skipAllDialogueButton}
        <div
          className="dialogueMenuPositionClass visualizer-modal-shell visualizer-dialogue-shell"
        >
          <div className="dialogueBigContainer">
            <p className="levelNameToRender">
              {LEVEL_NAME}
            </p>
          </div>

          <div className="dialogueBigContainer2" ref={this.dialogueBodyRef}>
            {dialogueBlocks}

            {dialogueNextButton}
          </div>
        </div>
      </>
    );
  }

  nextPage() {
    if (this.state.tutorialPage < 3) {
      this.setState({ tutorialPage: this.state.tutorialPage + 1 });
    } else {
      toggleHasTutorialEnded();
      this.toggleTutorialMenu();

      if (currentLevel === 1) this.loadRealGrid();
    }
  }

  previousPage() {
    this.setState({ tutorialPage: this.state.tutorialPage - 1 });
  }

  toggleTutorialMenu() {
    this.setState({ showTutorialMenu: !this.state.showTutorialMenu });
  }

  getTutorialMenu() {
    let tutorialNextPageText = 'Next';
    if (this.state.tutorialPage === 3) tutorialNextPageText = 'Exit';

    let tutorialPreviousPageText = 'Back';
    if (this.state.tutorialPage === 1) tutorialPreviousPageText = '';

    function getCurrentTutorialPageText(pageNum) {
      if (pageNum === 1) {
        return (
          <p className="tutorialText">
            Welcome to Dijkstra's Game! This is a game where you can learn about
            Dijkstra's Algorithm. Dijkstra's Algorithm is a pathfinding
            algorithm that finds the shortest path between two nodes. In this
            game, you will be able to see how the algorithm works and how it
            finds the shortest path between two nodes. This tutorial will teach
            you how to play the game.
          </p>
        );
      } else if (pageNum === 2) {
        return (
          <p className="tutorialText">
            The grid is where the algorithm will run. It is made up of square
            nodes. The nodes can be walls, permanent walls, start nodes, end
            nodes, or empty nodes. The walls are the black squares and the
            permanent walls are a bit lighter. The start nodes are the green
            squares. The end nodes are the red squares. The empty nodes are the
            grey-ish squares. The empty and wall nodes are the only nodes that
            can be changed.
            <br></br>
            <br></br>
            On the top of the screen, you will find the Home, Settings and Run
            buttons. You may also find powerup buttons, if they are available to
            you. The Run button will run the Dijkstra algorithm, starting from
            the start node.
          </p>
        );
      } else if (pageNum === 3) {
        return (
          <p className="tutorialText">
            The aim of the game is simple, make the "missile" self-destruct by
            making it take the longest path you can. The "missile" will
            self-destruct after a given distance. If the missile reaches the end
            node, you will lose the level. You can stop this by placing walls in
            the path of the missile, but be careful, do not fully block the
            missile path because then the enemy who sent the missile will know
            that we can view the missile's path, and change their software. You
            will only have a limited amount of walls to place, so use them
            wisely, and some walls are permanent, and cannot be removed.
            Powerups, such as the Random Wall Powerup, can aid you in your
            mission.
          </p>
        );
      }
    }

    return (
      <>
        <div
          onClick={() => {}}
          className="visualizer-modal-backdrop"
        ></div>
        <div className="visualizer-modal-shell visualizer-tutorial-shell">
          <div className="levelInfoContainer">
            <p className="levelNameToRender">
              Tutorial
            </p>
          </div>

          <div className="levelInfoContainer2">
            <div className="tutorialContainer">
              <span>{getCurrentTutorialPageText(this.state.tutorialPage)}</span>
            </div>

            <div className="visualizer-modal-actions">
              <button
                className="optionsMenuButton"
                onClick={() => {
                  this.previousPage();
                }}
              >
                {tutorialPreviousPageText}
              </button>

              <button
                className="optionsMenuButton"
                onClick={() => {
                  this.nextPage();
                }}
              >
                {tutorialNextPageText}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Removes all added walls by the user
  removeAllWalls() {
    let grid = [];
    this.setState({ grid: grid });
    grid = getCurrentLevelGrid();
    this.setState({ grid: grid });
    NUM_WALLS_ACTIVE = 0;
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

  markNodeUnwallable(node) {
    const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
    if (nodeElement) nodeElement.classList.add('node-unwallable');
  }

  addRandomPlaneWall(randomWallsAdded, tick) {
    const column = this.getPlaneWallColumn();
    const grid = this.state.grid;

    if (column !== null && column >= 0 && column < NUM_COLUMNS) {
      const row = Math.floor(Math.random() * NUM_ROWS);
      const node = grid[row][column];
      const unWallable = node.isEnd || node.isStart || node.isPermanentWall;

      if (!unWallable && randomWallsAdded.indexOf(node) === -1) {
        if (Math.floor(Math.random() * 2) === 1) {
          randomWallsAdded.push(node);

          grid[row][column] = {
            ...node,
            isWall: true,
            isPermanentWall: true,
          };
          this.markNodeUnwallable(node);
        }
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
      NUM_RANDOM_WALL_PRESSES <= 0 ||
      this.state.animatingPlane
    ) {
      return;
    }

    this.setHomeButtonEnabled(false);
    NUM_RANDOM_WALL_PRESSES--;
    resetAllNodes(this.state.grid);
    this.setState({ animatingPlane: true });

    const randomWallsAdded = [];
    this.startPlaneRun((tick) => {
      this.addRandomPlaneWall(randomWallsAdded, tick);
    });
  }

  // When a node is clicked, it will toggle the wall property of the node
  toggleWall(row, col, isWall, unWallable) {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      if (
        document
          .getElementById(`node-${row}-${col}`)
          .classList.contains('node-unwallable')
      )
        return;

      if (!getHasGridBeenReset() && !getToggleWallOnClick()) {
        resetAllNodes(this.state.grid);
        setHasGridBeenReset(true);
        return;
      } else {
        resetAllNodes(this.state.grid);
        setHasGridBeenReset(true);
      }

      const { grid } = this.state;
      let node = grid[row][col];
      if (!node.isPermanentWall && !unWallable) {
        // Makes sure the target node is not a perm wall, and max number of active walls hasnt been reached. Will continue if you are turning a wall into a non wall and the active walls is not 0.
        if (
          (NUM_WALLS_ACTIVE < NUM_WALLS_TOTAL && NUM_WALLS_ACTIVE > 0) ||
          (isWall && NUM_WALLS_ACTIVE > 0) ||
          (!isWall && NUM_WALLS_ACTIVE === 0)
        ) {
          // If it isnt a wall currently, increase the number of active walls by one, else decrease them
          if (!isWall) NUM_WALLS_ACTIVE = NUM_WALLS_ACTIVE + 1;
          else if (isWall) NUM_WALLS_ACTIVE = NUM_WALLS_ACTIVE - 1;

          // Creates a temporary node with the new property of isWall set to the opposite of its current state.
          const newNode = {
            ...node,
            isWall: !isWall,
          };
          //   Places the new node into the grid
          grid[row][col] = newNode;
          //   Changes the overall state of the grid which re-renders it.
          this.setState({ grid: grid });
        }
      }
    }
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

  refreshSettings = () => {
    this.setState(({ settingsRefresh }) => ({
      settingsRefresh: settingsRefresh + 1,
    }));
  };

  toggleCampaignNodeNumbers = () => {
    setShowCampaignNodeNumbers(!getShowCampaignNodeNumbers());
    this.refreshSettings();
  };

  updateMissileTrailLength = (event) => {
    setMissileTrailLength(event.target.value);
    this.refreshSettings();
  };

  toggleOptionsMenu() {
    this.setState({ showOptionsMenu: !this.state.showOptionsMenu });
  }

  getOptionsMenu() {
    return (
      <>
        <div
          onClick={() => {}}
          className="visualizer-modal-backdrop"
        ></div>
        <div className="visualizer-modal-shell visualizer-options-shell">
          <div className="mainInfoContainer">
            <p className="mainTextToRender">
              Settings
            </p>
          </div>
          <div className="mainInfoContainer2">
            <div className="toggle-grid-holder text-info">
              Toggle Grid Outline
              <div>
                <NodeToggleGrid
                  currentState={gridOutlineToggled}
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

            <div className="visualizer-option-row text-info">
              <span>Show Node Numbers</span>
              <button
                type="button"
                className={`visualizer-option-toggle ${
                  getShowCampaignNodeNumbers() ? 'is-active' : ''
                }`}
                onClick={this.toggleCampaignNodeNumbers}
              >
                {getShowCampaignNodeNumbers() ? 'On' : 'Off'}
              </button>
            </div>

            <label className="visualizer-option-row text-info">
              <span>Missile Trail Length</span>
              <input
                type="number"
                min="1"
                max="12"
                value={getMissileTrailLength()}
                onChange={this.updateMissileTrailLength}
                className="visualizer-number-input"
              />
            </label>

            <button
              className="optionsMenuButton"
              onClick={() => {
                this.toggleOptionsMenu();
              }}
            >
              Save
            </button>
          </div>
        </div>
      </>
    );
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

    let numRandomWallButton;

    if (getCurrentLevelRandomWallPresses() !== 0) {
      if (NUM_RANDOM_WALL_PRESSES > 0) {
        numRandomWallButton = (
          <button
            className="standard-button topbar-control random-walls-button"
            onClick={() => this.startToAnimatePlane()} // add random walls to the grid and animate plane
          >
            Random Walls
          </button>
        );
      } else {
        numRandomWallButton = (
          <button
            className="standard-button-disabled topbar-control random-walls-button"
            onClick={() => this.startToAnimatePlane()} // add random walls to the grid and animate plane
          >
            Random Walls
          </button>
        );
      }
    } else {
      numRandomWallButton = null;
    }

    return (
      <div
        className="visualize-screen visualize-level-screen"
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

        {this.state.showDialogueMenu
          ? this.getDialogueMenu()
          : null}

        {this.state.showTutorialMenu && Number(currentLevel) === 1
          ? this.getTutorialMenu()
          : null}

        {plane}

        <div className="topButtonsContainerOutline"> </div>

        <div className="topButtonsContainer">
          {numRandomWallButton}

          <p className="numWallsActiveMessage topbar-message">
            {NUM_WALLS_ACTIVE} out of {NUM_WALLS_TOTAL} walls used
          </p>

          <p className="currentEndDistanceMessage topbar-message">
            End Distance: {getCurrentLevelEndDistance()}
          </p>

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
        </div>

        <div className="visualizer-grid-viewport">
          <div
            className="grid visualizer-grid"
            /*  creates the div that holds the rows*/
          >
            {grid.map((row, rowID) => {
              return (
                <div
                  key={
                    rowID
                  } /*  creates the div that holds all the nodes in the row*/
                >
                  {row.map((node, nodeID) => {
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
                        onClick={(row, col) =>
                          this.toggleWall(
                            row,
                            col,
                            isWall,
                            unWallable,
                            isPermanentWall
                          )
                        }
                        onMouseUp={() => {}}
                        onMouseDown={(row, col) => {}}
                        onMouseEnter={(row, col) => {}}
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
