import React, { Component } from 'react';
import {
  getCurrentTutorialStatus,
  randomIntFromInterval,
  setHasShownTutorial,
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
  getAnimationSpeedMultiplier,
  getGridPalette,
  getGridPaletteCssVariables,
  getGridPaletteOptions,
  getVisualizerPaused,
  getMissileTrailLength,
  getShowCampaignNodeNumbers,
  getSoundMuted,
  getToggleWallOnClick,
  gridOutlineToggled,
  resetCampaignOptions,
  setAnimationSpeedMultiplier,
  setGridPalette,
  setGridOutlineToggled,
  setHasGridBeenReset,
  setMissileTrailLength,
  setShowCampaignNodeNumbers,
  setSoundMuted,
  setToggleWallOnClick,
  setVisualizerPaused,
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
import { clearAnimationQueue } from './Animations';
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
const RANDOM_WALL_ANIMATION_DURATION = 6500 / 2.2;
const RANDOM_WALL_FRAME_INTERVAL = 80;
const TUTORIAL_PAGE_COUNT = 6;
const DIALOGUE_ALERT_PATTERN =
  /alarm|black screen|emergency|explosion|incoming|missile|nuclear|siren/i;
const DIALOGUE_BRIEF_PATTERN =
  /cost|Dijkstra|distance|path|route|self-destruct|shortest|wall limit/i;

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
      dialogueIsScrolling: false,
      ...initialLayout,
      settingsRefresh: 0,
    };

    this.visualizerRef = React.createRef();
    this.dialogueBodyRef = React.createRef();
    this.planeRef = React.createRef();
    this.activeTimeouts = new Set();
    this.layoutFrameId = null;
    this.dialogueFrameId = null;
    this.dialogueScrollTimeoutId = null;
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
      !(this.state.tutorialPage === TUTORIAL_PAGE_COUNT)
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
    resetCampaignOptions();
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

    if (prevState.showOptionsMenu !== this.state.showOptionsMenu) {
      if (this.activePlaneAudio) {
        if (this.state.showOptionsMenu) {
          this.activePlaneAudio.pause();
        } else if (!getSoundMuted()) {
          const playPromise = this.activePlaneAudio.play();
          if (playPromise) playPromise.catch(() => {});
        }
      }
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
    clearAnimationQueue();
    setVisualizerPaused(false);
    resetCampaignOptions();
    this.stopPlaneAudio();
    if (this.topbarResizeObserver) {
      this.topbarResizeObserver.disconnect();
      this.topbarResizeObserver = null;
    }
    if (this.layoutFrameId) window.cancelAnimationFrame(this.layoutFrameId);
    if (this.dialogueFrameId) window.cancelAnimationFrame(this.dialogueFrameId);
    if (this.dialogueScrollTimeoutId) {
      window.clearTimeout(this.dialogueScrollTimeoutId);
    }
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

    this.scrollDialogueToBottom();
  };

  handleDialogueScroll = () => {
    if (this.dialogueScrollTimeoutId) {
      window.clearTimeout(this.dialogueScrollTimeoutId);
    }

    if (!this.state.dialogueIsScrolling) {
      this.setState({ dialogueIsScrolling: true });
    }

    this.dialogueScrollTimeoutId = window.setTimeout(() => {
      this.dialogueScrollTimeoutId = null;
      if (!this.isUnmounted) this.setState({ dialogueIsScrolling: false });
    }, 900);
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
          Close Comms
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
          Continue Transmission
        </button>
      );
    }

    return (
      <button
        className="optionsMenuButton"
        onClick={() => {
          this.advanceDialogueLine();
        }}
      >
        Continue Transmission
      </button>
    );
  }

  getDialogueBlocks(currentDialogueLineNumber) {
    let dialogueBlocks = [];
    let enterText = 'Press Enter or click Continue';
    let continueText = 'Review the next transmission page';
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

      let dialogueBlockPosition;
      if (currentLevelSpeakerPosition[i] === 1) {
        dialogueBlockPosition = 'dialogue-left-side';
      } else if (currentLevelSpeakerPosition[i] === 2) {
        dialogueBlockPosition = 'dialogue-right-side';
      } else {
        dialogueBlockPosition = 'dialogue-centre';
      }

      const currentLineSpeaker = currentLevelDialogue[i][0];
      const currentLineText = currentLevelDialogue[i][1] || '';
      const isCurrentLine = i === currentDialogueLineNumber;
      const isStageLine = currentLineSpeaker === '';
      const isSmithLine = currentLineSpeaker === '<Mr Smith>';
      const isAlertLine = DIALOGUE_ALERT_PATTERN.test(currentLineText);
      const isBriefLine = DIALOGUE_BRIEF_PATTERN.test(currentLineText);
      const dialogueLineClassName = [
        dialogueBlockPosition,
        'dialogue-line',
        isCurrentLine ? 'dialogue-line--current' : '',
        isStageLine ? 'dialogue-line--stage' : '',
        isSmithLine ? 'dialogue-line--smith' : '',
        isAlertLine ? 'dialogue-line--alert' : '',
        isBriefLine ? 'dialogue-line--brief' : '',
      ]
        .filter(Boolean)
        .join(' ');

      if (!this.state.dialogueNeedsPageBreak) {
        if (isAlertLine) textToDisplay = 'Acknowledge alert';
        else if (isBriefLine) textToDisplay = 'Confirm briefing';
      }

      if (currentLevelDialogue[i][0] === '') {
        dialogue = (
          <React.Fragment key={`dialogue-${i}`}>
            <div
              className={dialogueLineClassName}
              style={{
                display: i <= currentDialogueLineNumber ? 'block' : 'none',
              }}
            >
              <p style={{ opacity: '0.85' }} className="dialogueBlockTextOther">
                {currentLevelDialogue[i][1]}
              </p>
            </div>

            {i === currentDialogueLineNumber ? (
              <div
                className={dialogueLineClassName}
                style={{
                  display: i <= currentDialogueLineNumber ? 'block' : 'none',
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
              className={dialogueLineClassName}
              style={{
                display: i <= currentDialogueLineNumber ? 'block' : 'none',
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
                className={dialogueLineClassName}
                style={{
                  display: i <= currentDialogueLineNumber ? 'block' : 'none',
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
        Skip Briefing
      </button>
    );
  }

  isCurrentDialogueAlerting() {
    const currentDialogue = cloneVariable(getCurrentLevelDialogue());
    const currentLine = currentDialogue[this.state.dialogueLineNumber];
    const currentText = currentLine?.[1] || '';
    return DIALOGUE_ALERT_PATTERN.test(currentText);
  }

  getDialogueMenu() {
    let dialogueNextButton = this.getDialogueNextButton(
      this.state.dialogueLineNumber
    );

    let skipAllDialogueButton = this.getSkipAllDialogueButton();

    let dialogueBlocks = this.getDialogueBlocks(this.state.dialogueLineNumber);
    const isAlerting = this.isCurrentDialogueAlerting();

    return (
      <>
        <div
          onClick={() => {}}
          className="visualizer-modal-backdrop"
        ></div>
        {skipAllDialogueButton}
        <div
          className={`dialogueMenuPositionClass visualizer-modal-shell visualizer-dialogue-shell ${
            isAlerting ? 'is-alerting' : ''
          }`}
        >
          <div className="dialogueBigContainer">
            <div
              className={`dialogue-status-strip ${
                isAlerting ? 'dialogue-status-strip--alert' : ''
              }`}
            >
              <span className="dialogue-status-dot"></span>
              {isAlerting ? 'MISSILE ALERT' : 'LIVE COMMS'}
            </div>
            <p className="levelNameToRender">
              {LEVEL_NAME}
            </p>
            <p className="dialogueBriefingHint">
              Tactical briefing
            </p>
          </div>

          <div
            className={`dialogueBigContainer2 ${
              this.state.dialogueIsScrolling ? 'is-scrolling' : ''
            }`}
            ref={this.dialogueBodyRef}
            onScroll={this.handleDialogueScroll}
          >
            {dialogueBlocks}

            {dialogueNextButton}
          </div>
        </div>
      </>
    );
  }

  nextPage() {
    if (this.state.tutorialPage < TUTORIAL_PAGE_COUNT) {
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
    if (this.state.tutorialPage === TUTORIAL_PAGE_COUNT) {
      tutorialNextPageText = 'Start Mission';
    }

    let tutorialPreviousPageText = 'Back';
    if (this.state.tutorialPage === 1) tutorialPreviousPageText = '';

    function getCurrentTutorialPageText(pageNum) {
      const pages = [
        {
          title: 'Your Mission',
          body:
            'The missile always follows the shortest available route from the green start node to the red end node. Your job is to slow it down, not block it completely.',
        },
        {
          title: 'The Grid',
          body:
            'Each square is a node. Moving up, down, left, or right costs 1. Black squares are walls. Permanent walls are fixed obstacles. Empty squares are the spaces you can usually change.',
        },
        {
          title: 'End Distance',
          body:
            'The end distance is the missile self-destruct range. If the end distance is 75, the shortest valid route must be 76 steps or longer. If the shortest route is 75 or less, the missile reaches the target.',
        },
        {
          title: 'How Dijkstra Thinks',
          body:
            'Dijkstra spreads out from the start node in distance order. It always checks the closest unfinished node next. When it reaches the end node, it has found the shortest route the missile can take.',
        },
        {
          title: 'Placing Walls',
          body:
            'A wall only helps if it changes the shortest route. Use the wall limit carefully, then press Start to run the algorithm again and see the new missile path.',
        },
        {
          title: 'Common Mistakes',
          body:
            'Do not block every route. If there is no path, the enemy detects our interference and patches the backdoor. Leave a route open, make it too long, and let the missile destroy itself.',
        },
      ];
      const page = pages[pageNum - 1] || pages[0];

      return (
        <div className="tutorialPage">
          <p className="tutorialStep">
            {pageNum} / {TUTORIAL_PAGE_COUNT}
          </p>
          <h2>{page.title}</h2>
          <p className="tutorialText">{page.body}</p>
        </div>
      );
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
              {tutorialPreviousPageText ? (
                <button
                  className="optionsMenuButton"
                  onClick={() => {
                    this.previousPage();
                  }}
                >
                  {tutorialPreviousPageText}
                </button>
              ) : (
                <span></span>
              )}

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

    const duration = RANDOM_WALL_ANIMATION_DURATION;
    let startTime = null;
    let lastFrameTimestamp = null;
    let lastWallTick = -1;
    let frameIndex = 0;
    let lastTurbineFrameTime = 0;

    planeElement.style.display = 'block';
    planeElement.style.left = `${travelBounds.startX}px`;
    planeElement.style.top = `${travelBounds.centerY}px`;
    planeElement.src = PLANE_FRAMES[0];

    if (!getSoundMuted()) {
      this.activePlaneAudio = new Audio(planeSoundEffect);
      const playPromise = this.activePlaneAudio.play();
      if (playPromise) playPromise.catch(() => {});
    }

    const step = (timestamp) => {
      if (this.isUnmounted) return;

      if (startTime === null) startTime = timestamp;
      if (lastFrameTimestamp === null) lastFrameTimestamp = timestamp;

      if (getVisualizerPaused()) {
        startTime += timestamp - lastFrameTimestamp;
        lastFrameTimestamp = timestamp;
        this.planeFrameId = window.requestAnimationFrame(step);
        return;
      }

      lastFrameTimestamp = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const currentLeft =
        travelBounds.startX +
        (travelBounds.endX - travelBounds.startX) * easedProgress;
      planeElement.style.left = `${currentLeft}px`;

      if (timestamp - lastTurbineFrameTime >= RANDOM_WALL_FRAME_INTERVAL) {
        frameIndex = (frameIndex + 1) % PLANE_FRAMES.length;
        planeElement.src = PLANE_FRAMES[frameIndex];
        lastTurbineFrameTime = timestamp;
      }

      const nextWallTick = Math.min(
        RANDOM_WALL_NUMBER - 1,
        Math.floor(easedProgress * RANDOM_WALL_NUMBER)
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
      const unWallable =
        node.isEnd || node.isStart || node.isWall || node.isPermanentWall;

      if (!unWallable && randomWallsAdded.indexOf(node) === -1) {
        if (Math.floor(Math.random() * 2) === 1) {
          randomWallsAdded.push(node);

          grid[row][column] = {
            ...node,
            isWall: true,
            isPermanentWall: true,
            isRandomWall: true,
          };
          this.markNodeUnwallable(node);
        }
      }
    }

    if (tick % 12 === 0 || tick === RANDOM_WALL_NUMBER - 1) {
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

  updateAnimationSpeedMultiplier = (event) => {
    setAnimationSpeedMultiplier(event.target.value);
    this.refreshSettings();
  };

  updateGridPalette = (event) => {
    setGridPalette(event.target.value);
    this.refreshSettings();
  };

  toggleSoundMuted = () => {
    setSoundMuted(!getSoundMuted());
    if (getSoundMuted()) this.stopPlaneAudio();
    this.refreshSettings();
  };

  resetCampaignSettings = () => {
    resetCampaignOptions();
    setVisualizerPaused(this.state.showOptionsMenu);
    this.refreshSettings();
  };

  preventInvalidIntegerKey = (event) => {
    if (['e', 'E', '+', '-', '.', ','].includes(event.key)) {
      event.preventDefault();
    }
  };

  openTutorialFromHeader = () => {
    if (Number(currentLevel) !== 1 || this.state.showDialogueMenu) return;
    setHasShownTutorial(true);
    this.setState({ showTutorialMenu: true, tutorialPage: 1 });
  };

  toggleOptionsMenu() {
    this.setState(({ showOptionsMenu }) => {
      const nextShowOptionsMenu = !showOptionsMenu;
      setVisualizerPaused(nextShowOptionsMenu);
      return { showOptionsMenu: nextShowOptionsMenu };
    });
  }

  getOptionsMenu() {
    return (
      <>
        <div
          onClick={() => {}}
          className="visualizer-modal-backdrop"
        ></div>
        <div className="visualizer-modal-shell visualizer-options-shell">
          <div className="visualizer-modal-header">
            <p className="visualizer-modal-title">
              Settings
            </p>
          </div>
          <div className="visualizer-modal-body">
            <div className="visualizer-options-grid campaign-settings-grid">
              <section className="visualizer-settings-section">
                <div className="visualizer-section-header">Grid Display</div>
                <div className="visualizer-section-controls">
                  <div className="toggle-grid-holder text-info">
                    Grid Outline
                    <div>
                      <NodeToggleGrid
                        currentState={gridOutlineToggled}
                        onClick={() => this.toggleGrid()}
                      ></NodeToggleGrid>
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
                    <span>Grid Palette</span>
                    <select
                      value={getGridPalette()}
                      onChange={this.updateGridPalette}
                      className="visualizer-select-input"
                    >
                      {getGridPaletteOptions().map((palette) => (
                        <option value={palette.id} key={palette.id}>
                          {palette.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              <section className="visualizer-settings-section">
                <div className="visualizer-section-header">
                  Gameplay & Animation
                </div>
                <div className="visualizer-section-controls">
                  <div className="toggle-onclick-holder text-info">
                    Wall Editing After Animation
                    <div>
                      <NodeToggleOnClick
                        currentState={getToggleWallOnClick()}
                        onClick={() => this.toggleOnClick()}
                      ></NodeToggleOnClick>
                    </div>
                  </div>

                  <label className="visualizer-option-row text-info">
                    <span>Missile Trail Length</span>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={getMissileTrailLength()}
                      onChange={this.updateMissileTrailLength}
                      onKeyDown={this.preventInvalidIntegerKey}
                      className="visualizer-number-input"
                    />
                  </label>

                  <label className="visualizer-option-row text-info visualizer-range-row">
                    <span>Speed Multiplier</span>
                    <span className="visualizer-control-stack">
                      <input
                        type="range"
                        min="0.25"
                        max="3"
                        step="0.25"
                        value={getAnimationSpeedMultiplier()}
                        onChange={this.updateAnimationSpeedMultiplier}
                        className="visualizer-range-input"
                      />
                      <span className="visualizer-range-value">
                        {getAnimationSpeedMultiplier().toFixed(2)}x
                      </span>
                    </span>
                  </label>
                  <div className="visualizer-option-row text-info">
                    <span>Mute Audio</span>
                    <button
                      type="button"
                      className={`visualizer-option-toggle ${
                        getSoundMuted() ? 'is-active' : ''
                      }`}
                      onClick={this.toggleSoundMuted}
                    >
                      {getSoundMuted() ? 'Muted' : 'Sound On'}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <div className="visualizer-modal-footer">
              <button
                className="optionsMenuButton"
                onClick={this.resetCampaignSettings}
              >
                Reset Settings
              </button>
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
        </div>
      </>
    );
  }

  render() {
    const { grid } = this.state;
    const paletteVariables = getGridPaletteCssVariables();

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
        className={`visualize-screen visualize-level-screen ${
          this.state.showOptionsMenu ? 'visualizer-paused' : ''
        }`}
        ref={this.visualizerRef}
        style={{
          ...paletteVariables,
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
          <div className="topbar-section topbar-left">
            {numRandomWallButton}

            {Number(currentLevel) === 1 ? (
              <button
                className="standard-button topbar-control tutorial-button"
                onClick={this.openTutorialFromHeader}
              >
                Tutorial
              </button>
            ) : null}

            <p className="numWallsActiveMessage topbar-message">
              {NUM_WALLS_ACTIVE} out of {NUM_WALLS_TOTAL} walls used
            </p>

            <p className="currentEndDistanceMessage topbar-message">
              End Distance: {getCurrentLevelEndDistance()}
            </p>
          </div>

          <div className="topbar-section topbar-center">
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

          <div className="topbar-section topbar-right">
            <label className="topbar-speed-control">
              <span>Speed</span>
              <input
                type="range"
                min="0.25"
                max="3"
                step="0.25"
                value={getAnimationSpeedMultiplier()}
                onChange={this.updateAnimationSpeedMultiplier}
              />
              <span>{getAnimationSpeedMultiplier().toFixed(2)}x</span>
            </label>

            <button
              className="standard-button topbar-control settings-button"
              onClick={() => this.toggleOptionsMenu()} // Options
            >
              Settings
            </button>

            <button
              className="standard-button topbar-control home-button enabled"
              id="homeButton"
              onClick={() => EnterHome()}
            >
              Home
            </button>
          </div>
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
                      distance,
                      isEnd,
                      isStart,
                      isWall,
                      isPermanentWall,
                      isRandomWall,
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
                        isRandomWall={isRandomWall}
                        showNodeNumber={getShowCampaignNodeNumbers()}
                        nodeNumber={distance}
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
