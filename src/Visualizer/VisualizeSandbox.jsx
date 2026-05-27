import React, { Component, useEffect, useRef } from 'react';
import {
  getActualCurrentEndDistance,
  randomIntFromInterval,
  setCurrentEndDistance,
} from '../actualLeveHandling';
import { allLevelNames, getLevelData, numLevels } from '../allLevelData';
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
  getAnimationSpeedMultiplier,
  getGridPalette,
  getGridPaletteCssVariables,
  getGridPaletteOptions,
  getVisualizerPaused,
  getMissileTrailLength,
  getSandboxEndExplosionToggled,
  getSandboxWallLimit,
  getShowSandboxNodeNumbers,
  getShowSandboxWallUsage,
  getSoundMuted,
  getUseCampaignMissileTrailInSandbox,
  setAnimationSpeedMultiplier,
  setGridPalette,
  setToggleWallOnClick,
  setMissileTrailLength,
  setSandboxEndExplosionToggled,
  setSandboxWallLimit,
  getHasGridBeenReset,
  resetSandboxOptions,
  setShowSandboxNodeNumbers,
  setShowSandboxWallUsage,
  setSoundMuted,
  setUseCampaignMissileTrailInSandbox,
  setHasGridBeenReset,
  setVisualizerPaused,
} from '../optionsHandling';
import NodeToggleGrid from './Node/NodeToggleGrid';
import { EnterHome } from '../Navigation';
import NodeToggleOnClick from './Node/NodeToggleOnClick';
import ScrollableBox from './Components/ScrollableBox';
import { clearAnimationQueue } from './Animations';
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
import { getSandboxNodeKey, parseSandboxNodeKey } from './sandboxSolver';

// Placeholders for start node coordinates
let START_NODE_ROW = 0;
let START_NODE_COL = 0;
let END_NODE_ROW = 25;
let END_NODE_COL = 50;

function resetSandboxGridCoordinates() {
  START_NODE_ROW = 0;
  START_NODE_COL = 0;
  END_NODE_ROW = 25;
  END_NODE_COL = 50;
}

// Specifies the number of rows and columns
const NUM_ROWS = 26;
const NUM_COLUMNS = 51;
const DEFAULT_SANDBOX_END_DISTANCE = 75;
const PLANE_FRAMES = [planeFrame1, planeFrame2, planeFrame3, planeFrame4];
const RANDOM_WALL_ANIMATION_DURATION = 6500 / 2.2;
const RANDOM_WALL_FRAME_INTERVAL = 80;
const SANDBOX_SOLVER_MAX_TIME_MS = 750;
const SOLUTIONS_MENU_MIN_WIDTH = 560;
const SOLUTIONS_MENU_MIN_HEIGHT = 520;
const SOLUTIONS_MENU_ASPECT_RATIO =
  SOLUTIONS_MENU_MIN_WIDTH / SOLUTIONS_MENU_MIN_HEIGHT;
const templateModules = import.meta.glob('./templates/*.json', { eager: true });
const templateLevelNames = Object.keys(templateModules)
  .map((path) => path.match(/\/([^/]+)\.json$/)?.[1])
  .filter(Boolean)
  .sort((first, second) => first.localeCompare(second));

function formatTemplateOptionLabel(templateName) {
  const labels = {
    BLANK: 'Blank Grid',
    'GAME-COMPLETE': 'Game Complete',
    'MISSION-FAILED': 'Mission Failed',
    'NO-PATH': 'No Path',
    'NO-PATH-SANDBOX': 'No Path Sandbox',
    VICTORY: 'Victory',
  };

  return labels[templateName] || templateName;
}

function getLoadLevelOptions() {
  const campaignOptions = Array.from({ length: numLevels }, (_, index) => {
    const value = String(index + 1);
    return {
      value,
      label: `${value} - ${allLevelNames[index]}`,
      type: 'Campaign',
    };
  });

  const templateOptions = templateLevelNames.map((templateName) => ({
    value: templateName,
    label: formatTemplateOptionLabel(templateName),
    type: 'Template',
  }));

  return [...campaignOptions, ...templateOptions];
}

function getTemplateGrid(templateName) {
  const template = templateModules[`./templates/${templateName}.json`];

  if (!template) return null;

  return cloneVariable((template.default ?? template).grid);
}

function getSavedSandboxSettings(level) {
  const metadata = Array.isArray(level) ? level[3] : null;
  const settings = metadata?.settings || metadata || {};
  const wallLimit = /^\d+$/.test(String(settings.wallLimit ?? '').trim())
    ? Number(settings.wallLimit)
    : Number.NaN;
  const endDistance = /^\d+$/.test(String(settings.endDistance ?? '').trim())
    ? Number(settings.endDistance)
    : Number.NaN;

  return {
    wallLimit: Number.isFinite(wallLimit) ? Math.max(0, wallLimit) : 0,
    endDistance: Number.isFinite(endDistance) ? Math.max(1, endDistance) : null,
    displayWallUsage:
      typeof settings.displayWallUsage === 'boolean'
        ? settings.displayWallUsage
        : Boolean(settings.showWallUsage),
  };
}

function MiniGridPreview({ grid, highlightWallKeys = [], ariaLabel }) {
  const canvasRef = useRef(null);
  const wallKeys = new Set(highlightWallKeys);
  const rows = grid.length;
  const columns = grid[0]?.length || 0;
  const highlightKey = [...wallKeys].sort().join('|');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || rows === 0 || columns === 0) return;

    const width = columns * 4;
    const height = rows * 4;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return;

    const styles = getComputedStyle(canvas);
    const cssColor = (name, fallback) =>
      styles.getPropertyValue(name).trim() || fallback;
    const colors = {
      empty: 'rgb(101, 97, 97)',
      end: cssColor('--node-end-color', 'red'),
      start: cssColor('--node-start-color', 'green'),
      wall: cssColor('--node-wall-color', 'rgb(0, 0, 0)'),
      permanentWall: cssColor(
        '--node-permanent-wall-color',
        'rgb(57, 55, 55)'
      ),
      randomWall: cssColor('--node-random-wall-color', 'rgb(72, 68, 68)'),
      solverWall: cssColor(
        '--node-solver-wall-color',
        'rgba(58, 188, 255, 0.72)'
      ),
    };
    const cellWidth = width / columns;
    const cellHeight = height / rows;

    context.clearRect(0, 0, width, height);
    context.fillStyle = colors.empty;
    context.fillRect(0, 0, width, height);

    grid.forEach((gridRow) => {
      gridRow.forEach((node) => {
        const key = getSandboxNodeKey(node.row, node.col);
        let color = null;

        if (node.isEnd) color = colors.end;
        else if (node.isStart) color = colors.start;
        else if (wallKeys.has(key)) color = colors.solverWall;
        else if (node.isRandomWall) color = colors.randomWall;
        else if (node.isPermanentWall) color = colors.permanentWall;
        else if (node.isWall) color = colors.wall;

        if (!color) return;

        context.fillStyle = color;
        context.fillRect(
          node.col * cellWidth,
          node.row * cellHeight,
          Math.ceil(cellWidth),
          Math.ceil(cellHeight)
        );
      });
    });
  }, [grid, rows, columns, highlightKey]);

  return (
    <div
      className="mini-grid-preview"
      role="img"
      aria-label={ariaLabel}
      style={{
        '--mini-grid-rows': rows,
        '--mini-grid-columns': columns,
      }}
    >
      <canvas className="mini-grid-preview__canvas" ref={canvasRef} />
    </div>
  );
}

// The maximum number of walls that can be placed randomly on the grid
let RANDOM_WALL_NUMBER = 400;

export default class sandboxVisualizer extends Component {
  constructor() {
    super();
    const initialLayout = getVisualizerLayout({
      rows: NUM_ROWS,
      columns: NUM_COLUMNS,
      topbarHeight: 70,
    });

    this.state = {
      grid: [],
      showOptionsMenu: false,
      animatingPlane: false,
      draggingWall: false,
      loadLevelInputValue: '',
      loadLevelSearch: '',
      showLoadLevelDropdown: false,
      defaultUserLevelInput: '',
      saveLevelInputStatus: 'default',
      lastAddedUserLevel: '',
      levelClicked: -1,
      renamingUserLevel: false,
      renamingUserLevelId: null,
      solverResult: null,
      solverStatus: 'idle',
      solverProgress: null,
      solverResultStale: false,
      solverOverlayEnabled: false,
      solverOverlayHidden: false,
      solverPanelClosed: false,
      solverPanelPosition: null,
      solverSolutionsMenuPosition: null,
      solverSolutionsMenuSize: null,
      showSolverSolutionPreviews: false,
      selectedSolverSolutionIndex: 0,
      showSolverSolutionsMenu: false,
      headerEditField: null,
      headerWallLimitDraft: '',
      headerEndDistanceDraft: '',
      sandboxWallLimitDraft: null,
      sandboxEndDistanceDraft: null,
      ...initialLayout,
      settingsRefresh: 0,
      dragging: [false, null, null], // 0: is-dragging ; 1: node-being-dragged ; 2: end/previous node
      //sets the default dragging values of the dragging state. The first index is whether dragging is taking place or node. The second index holds the value of the node that dragging first occurred on, ie. the node the user originally clicks. The third index holds the value of the previous node, and also holds the value of the current node the user is on when they stop dragging all together. The second index is used to get what type of node is being dragged: a start or end node. The third index allows us to remove the class of the previous node, when the new one gets updated to create an illusion like the user is actual dragging the node around.
    };

    this.visualizerRef = React.createRef();
    this.planeRef = React.createRef();
    this.loadLevelPickerRef = React.createRef();
    this.solverPanelRef = React.createRef();
    this.solverSolutionsMenuRef = React.createRef();
    this.activeTimeouts = new Set();
    this.layoutFrameId = null;
    this.planeFrameId = null;
    this.topbarResizeObserver = null;
    this.activePlaneAudio = null;
    this.draggingWallMode = null;
    this.activeDrag = null;
    this.suppressNextNodeClick = false;
    this.solverPanelDrag = null;
    this.solverSolutionsMenuDrag = null;
    this.solverPanelClampFrameId = null;
    this.solverRunId = 0;
    this.solverFrameId = null;
    this.solverTimeoutId = null;
    this.solverWorker = null;
    this.solverProgressIntervalId = null;
    this.solverStartedAt = null;
    this.lastSolverInputSignature = null;
    this.suppressNextSolverInvalidation = false;
    this.materializedSolverWallKeys = new Set();
    this.randomWallDraftGrid = null;
    this.wallDragDraftGrid = null;
    this.wallDragFrameId = null;
    this.wallDragDirty = false;
    this.wallDragHadChanges = false;
    this.isUnmounted = false;
    this.dragStop = this.dragStop.bind(this);
  }

  // If the Escape button is pressed, run the Show Options function
  handleKeyPress = (event) => {
    if (event.key === 'Escape') {
      if (!this.state.showOptionsMenu) this.toggleOptionsMenu();
    }
  };

  handleDocumentMouseDown = (event) => {
    if (!this.state.showLoadLevelDropdown) return;
    const pickerElement = this.loadLevelPickerRef.current;
    if (pickerElement && pickerElement.contains(event.target)) return;
    this.setState({ showLoadLevelDropdown: false, loadLevelSearch: '' });
  };

  componentDidMount() {
    this.isUnmounted = false;
    resetSandboxOptions();
    resetSandboxGridCoordinates();
    setCurrentEndDistance(DEFAULT_SANDBOX_END_DISTANCE, this.getMaxEndDistance());
    document.addEventListener('keydown', this.handleKeyPress, false);
    document.addEventListener('mousedown', this.handleDocumentMouseDown, true);
    document.addEventListener('mousemove', this.handleGridDragMove);
    document.addEventListener('mouseup', this.dragStop);
    document.addEventListener('mousemove', this.handleSolverPanelDragMove);
    document.addEventListener('mouseup', this.handleSolverPanelDragEnd);
    document.addEventListener('mousemove', this.handleSolverSolutionsMenuMove);
    document.addEventListener('mouseup', this.handleSolverSolutionsMenuEnd);
    window.addEventListener('resize', this.updateVisualizerLayout);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.updateVisualizerLayout);
    }
    const grid = initialiseGrid();
    this.setState({ grid }, () => {
      this.lastSolverInputSignature = this.getSolverInputSignature();
    });
    this.updateVisualizerLayout();
    [100, 300, 800, 1600].forEach((delay) => {
      this.setManagedTimeout(this.updateVisualizerLayout, delay);
    });
    this.observeTopbarLayout();
  }

  componentDidUpdate(prevProps, prevState) {
    const gridChanged = prevState.grid !== this.state.grid;

    if (
      (gridChanged && this.activeDrag?.kind !== 'wall') ||
      prevState.settingsRefresh !== this.state.settingsRefresh ||
      prevState.solverOverlayEnabled !== this.state.solverOverlayEnabled ||
      prevState.solverRefresh !== this.state.solverRefresh
    ) {
      this.handleSolverInputChange();
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
  }

  componentWillUnmount() {
    this.isUnmounted = true;
    document.removeEventListener('keydown', this.handleKeyPress, false);
    document.removeEventListener('mousedown', this.handleDocumentMouseDown, true);
    document.removeEventListener('mousemove', this.handleGridDragMove);
    document.removeEventListener('mouseup', this.dragStop);
    document.removeEventListener('mousemove', this.handleSolverPanelDragMove);
    document.removeEventListener('mouseup', this.handleSolverPanelDragEnd);
    document.removeEventListener('mousemove', this.handleSolverSolutionsMenuMove);
    document.removeEventListener('mouseup', this.handleSolverSolutionsMenuEnd);
    window.removeEventListener('resize', this.updateVisualizerLayout);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener(
        'resize',
        this.updateVisualizerLayout
      );
    }
    this.clearManagedTimers();
    this.cancelPendingSolverRun();
    clearAnimationQueue();
    setVisualizerPaused(false);
    resetSandboxOptions();
    setCurrentEndDistance(DEFAULT_SANDBOX_END_DISTANCE, this.getMaxEndDistance());
    this.stopPlaneAudio();
    if (this.topbarResizeObserver) {
      this.topbarResizeObserver.disconnect();
      this.topbarResizeObserver = null;
    }
    if (this.layoutFrameId) window.cancelAnimationFrame(this.layoutFrameId);
    if (this.planeFrameId) window.cancelAnimationFrame(this.planeFrameId);
    if (this.solverPanelClampFrameId) {
      window.cancelAnimationFrame(this.solverPanelClampFrameId);
    }
    if (this.wallDragFrameId !== null) {
      window.cancelAnimationFrame(this.wallDragFrameId);
      this.wallDragFrameId = null;
    }
  }

  clampSolverPanelPosition = (x, y, width, height) => {
    const panelRect = this.solverPanelRef.current?.getBoundingClientRect();
    const panelWidth = width || panelRect?.width || 320;
    const panelHeight = height || panelRect?.height || 80;
    const margin = 10;
    const maxX = Math.max(margin, window.innerWidth - panelWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - panelHeight - margin);

    return {
      x: Math.min(Math.max(margin, x), maxX),
      y: Math.min(Math.max(margin, y), maxY),
    };
  };

  startSolverPanelDrag = (event) => {
    if (event.button !== 0 || event.target.closest('button')) return;

    const panel = this.solverPanelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    this.solverPanelDrag = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };

    this.setState({
      solverPanelPosition: this.clampSolverPanelPosition(
        rect.left,
        rect.top,
        rect.width,
        rect.height
      ),
    });
    event.preventDefault();
  };

  handleSolverPanelDragMove = (event) => {
    if (!this.solverPanelDrag) return;

    const nextPosition = this.clampSolverPanelPosition(
      event.clientX - this.solverPanelDrag.offsetX,
      event.clientY - this.solverPanelDrag.offsetY,
      this.solverPanelDrag.width,
      this.solverPanelDrag.height
    );

    this.setState({ solverPanelPosition: nextPosition });
  };

  handleSolverPanelDragEnd = () => {
    this.solverPanelDrag = null;
  };

  scheduleSolverPanelClamp = () => {
    if (!this.state.solverPanelPosition || !this.solverPanelRef.current) return;

    if (this.solverPanelClampFrameId) {
      window.cancelAnimationFrame(this.solverPanelClampFrameId);
    }

    this.solverPanelClampFrameId = window.requestAnimationFrame(() => {
      this.solverPanelClampFrameId = null;
      if (
        this.isUnmounted ||
        !this.state.solverPanelPosition ||
        !this.solverPanelRef.current
      ) {
        return;
      }

      const rect = this.solverPanelRef.current.getBoundingClientRect();
      const nextPosition = this.clampSolverPanelPosition(
        this.state.solverPanelPosition.x,
        this.state.solverPanelPosition.y,
        rect.width,
        rect.height
      );

      if (
        nextPosition.x !== this.state.solverPanelPosition.x ||
        nextPosition.y !== this.state.solverPanelPosition.y
      ) {
        this.setState({ solverPanelPosition: nextPosition });
      }
    });
  };

  closeSolverPanel = () => {
    this.setState({ solverPanelClosed: true });
  };

  showSolverPanel = () => {
    this.setState({ solverPanelClosed: false }, this.scheduleSolverPanelClamp);
  };

  toggleSolverOverlayVisibility = () => {
    this.setState(({ solverOverlayHidden }) => ({
      solverOverlayHidden: !solverOverlayHidden,
      solverPanelClosed: false,
    }));
  };

  getSolutionsMenuSize() {
    const maxWidth = Math.max(320, window.innerWidth - 24);
    const maxHeight = Math.max(260, window.innerHeight - 24);
    const defaultWidth = Math.min(
      SOLUTIONS_MENU_MIN_WIDTH,
      maxWidth,
      maxHeight * SOLUTIONS_MENU_ASPECT_RATIO
    );
    const defaultHeight = defaultWidth / SOLUTIONS_MENU_ASPECT_RATIO;

    return (
      this.state.solverSolutionsMenuSize || {
        width: defaultWidth,
        height: defaultHeight,
      }
    );
  }

  clampSolutionsMenuPosition = (x, y, width, height) => {
    const margin = 10;
    const menuWidth = width || this.solverSolutionsMenuRef.current?.offsetWidth || 320;
    const menuHeight =
      height || this.solverSolutionsMenuRef.current?.offsetHeight || 260;
    const maxX = Math.max(margin, window.innerWidth - menuWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - menuHeight - margin);

    return {
      x: Math.min(Math.max(margin, x), maxX),
      y: Math.min(Math.max(margin, y), maxY),
    };
  };

  startSolverSolutionsMenuDrag = (event) => {
    if (
      event.button !== 0 ||
      event.target.closest('button') ||
      event.target.closest('.sandbox-solutions-resize-handle')
    ) {
      return;
    }

    const menu = this.solverSolutionsMenuRef.current;
    if (!menu) return;

    const rect = menu.getBoundingClientRect();
    this.solverSolutionsMenuDrag = {
      mode: 'move',
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
    this.setState({
      solverSolutionsMenuPosition: this.clampSolutionsMenuPosition(
        rect.left,
        rect.top,
        rect.width,
        rect.height
      ),
      solverSolutionsMenuSize: {
        width: rect.width,
        height: rect.height,
      },
    });
    event.preventDefault();
  };

  startSolverSolutionsMenuResize = (event) => {
    if (event.button !== 0) return;

    const menu = this.solverSolutionsMenuRef.current;
    if (!menu) return;

    const rect = menu.getBoundingClientRect();
    this.solverSolutionsMenuDrag = {
      mode: 'resize',
      startX: event.clientX,
      startY: event.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      left: rect.left,
      top: rect.top,
    };
    this.setState({
      solverSolutionsMenuPosition: this.clampSolutionsMenuPosition(
        rect.left,
        rect.top,
        rect.width,
        rect.height
      ),
      solverSolutionsMenuSize: {
        width: rect.width,
        height: rect.height,
      },
    });
    event.preventDefault();
    event.stopPropagation();
  };

  handleSolverSolutionsMenuMove = (event) => {
    if (!this.solverSolutionsMenuDrag) return;

    if (this.solverSolutionsMenuDrag.mode === 'move') {
      const nextSize = this.getSolutionsMenuSize();
      const nextPosition = this.clampSolutionsMenuPosition(
        event.clientX - this.solverSolutionsMenuDrag.offsetX,
        event.clientY - this.solverSolutionsMenuDrag.offsetY,
        nextSize.width,
        nextSize.height
      );
      this.setState({ solverSolutionsMenuPosition: nextPosition });
      return;
    }

    const maxWidth = Math.max(
      this.solverSolutionsMenuDrag.startWidth,
      window.innerWidth - 20
    );
    const maxHeight = Math.max(
      this.solverSolutionsMenuDrag.startHeight,
      window.innerHeight - 20
    );
    const maxAspectWidth = Math.min(
      maxWidth,
      maxHeight * SOLUTIONS_MENU_ASPECT_RATIO
    );
    const requestedWidth = Math.max(
      this.solverSolutionsMenuDrag.startWidth,
      this.solverSolutionsMenuDrag.startWidth +
        (event.clientX - this.solverSolutionsMenuDrag.startX),
      (this.solverSolutionsMenuDrag.startHeight +
        (event.clientY - this.solverSolutionsMenuDrag.startY)) *
        SOLUTIONS_MENU_ASPECT_RATIO
    );
    const nextWidth = Math.min(maxAspectWidth, requestedWidth);
    const nextHeight = nextWidth / SOLUTIONS_MENU_ASPECT_RATIO;

    this.setState({
      solverSolutionsMenuSize: {
        width: nextWidth,
        height: nextHeight,
      },
      solverSolutionsMenuPosition: this.clampSolutionsMenuPosition(
        this.solverSolutionsMenuDrag.left,
        this.solverSolutionsMenuDrag.top,
        nextWidth,
        nextHeight
      ),
    });
  };

  handleSolverSolutionsMenuEnd = () => {
    this.solverSolutionsMenuDrag = null;
  };

  scheduleSolverSolutionsMenuClamp = () => {
    if (!this.state.solverSolutionsMenuPosition) return;

    window.requestAnimationFrame(() => {
      if (
        this.isUnmounted ||
        !this.state.solverSolutionsMenuPosition ||
        this.solverSolutionsMenuDrag
      ) {
        return;
      }

      const size = this.getSolutionsMenuSize();
      const nextPosition = this.clampSolutionsMenuPosition(
        this.state.solverSolutionsMenuPosition.x,
        this.state.solverSolutionsMenuPosition.y,
        size.width,
        size.height
      );

      if (
        nextPosition.x !== this.state.solverSolutionsMenuPosition.x ||
        nextPosition.y !== this.state.solverSolutionsMenuPosition.y
      ) {
        this.setState({ solverSolutionsMenuPosition: nextPosition });
      }
    });
  };

  toggleSolverSolutionPreviews = () => {
    this.setState(({ showSolverSolutionPreviews }) => ({
      showSolverSolutionPreviews: !showSolverSolutionPreviews,
    }));
  };

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

      this.scheduleSolverPanelClamp();
      this.scheduleSolverSolutionsMenuClamp();
    });
  };

  getWallableNodeCount(grid = this.state.grid) {
    return grid.reduce((count, row) => {
      return (
        count +
        row.filter((node) => !node.isStart && !node.isEnd && !node.isPermanentWall)
          .length
      );
    }, 0);
  }

  getMaxEndDistance() {
    return NUM_ROWS * NUM_COLUMNS - 1;
  }

  getSandboxWallUsageCount(grid = this.state.grid) {
    return grid.reduce((count, row) => {
      return (
        count +
        row.filter(
          (node) => node.isWall && !node.isPermanentWall && !node.isRandomWall
        ).length
      );
    }, 0);
  }

  clampIntegerInput(value, min, max, fallback) {
    const stringValue = String(value).trim();
    if (!/^\d+$/.test(stringValue)) return fallback;

    const parsedValue = Number(stringValue);
    if (!Number.isSafeInteger(parsedValue)) return fallback;

    return Math.min(max, Math.max(min, parsedValue));
  }

  normalizeIntegerDraft(value, max) {
    const digits = String(value).replace(/\D/g, '');
    if (digits === '') return '';

    const maxDigits = String(Math.max(0, Number(max) || 0)).length;
    return digits.slice(0, Math.max(1, maxDigits));
  }

  preventInvalidIntegerKey = (event) => {
    if (['e', 'E', '+', '-', '.', ','].includes(event.key)) {
      event.preventDefault();
    }
  };

  applySandboxWallLimitValue(value) {
    const minWallLimit = this.getSandboxWallUsageCount();
    const maxWallLimit = this.getWallableNodeCount();
    const nextWallLimit = this.clampIntegerInput(
      value,
      minWallLimit,
      maxWallLimit,
      getSandboxWallLimit()
    );

    setSandboxWallLimit(nextWallLimit, maxWallLimit, minWallLimit);
    if (!getShowSandboxWallUsage() || getSandboxWallLimit() <= 0) {
      this.cancelPendingSolverRun();
      this.setState({
        solverOverlayEnabled: false,
        solverResult: null,
        solverProgress: null,
        solverResultStale: false,
        solverOverlayHidden: false,
        solverPanelClosed: false,
        showSolverSolutionsMenu: false,
        selectedSolverSolutionIndex: 0,
      });
    }
    this.refreshSettings();
  }

  applySandboxEndDistanceValue(value) {
    const nextEndDistance = this.clampIntegerInput(
      value,
      1,
      this.getMaxEndDistance(),
      getActualCurrentEndDistance()
    );

    setCurrentEndDistance(nextEndDistance, this.getMaxEndDistance());
    this.refreshSettings();
  }

  getDefaultCampaignWallLimit(grid = this.state.grid) {
    const maxWallLimit = this.getWallableNodeCount(grid);
    const wallUsageCount = this.getSandboxWallUsageCount(grid);
    const currentWallLimit = getSandboxWallLimit();

    if (currentWallLimit > 0) return currentWallLimit;

    return Math.min(maxWallLimit, Math.max(wallUsageCount, 10));
  }

  areCampaignLevelSandboxSettingsEnabled() {
    return (
      getShowSandboxWallUsage() &&
      getSandboxWallLimit() > 0 &&
      getUseCampaignMissileTrailInSandbox() &&
      getSandboxEndExplosionToggled() &&
      getActualCurrentEndDistance() > 0
    );
  }

  setCampaignLevelSandboxSettingsEnabled(enabled, level = null, grid = this.state.grid) {
    const maxWallLimit = this.getWallableNodeCount(grid);
    const wallUsageCount = this.getSandboxWallUsageCount(grid);

    if (enabled) {
      const wallLimit = level
        ? level.wallsAllowed
        : this.getDefaultCampaignWallLimit(grid);
      const endDistance = level
        ? level.endDistance
        : getActualCurrentEndDistance() || DEFAULT_SANDBOX_END_DISTANCE;

      setShowSandboxWallUsage(true);
      setUseCampaignMissileTrailInSandbox(true);
      setSandboxEndExplosionToggled(true);
      setSandboxWallLimit(wallLimit, maxWallLimit, wallUsageCount);
      setCurrentEndDistance(endDistance, this.getMaxEndDistance());
      this.refreshSettings();
      return;
    }

    setShowSandboxWallUsage(false);
    setUseCampaignMissileTrailInSandbox(false);
    setSandboxEndExplosionToggled(false);
    setSandboxWallLimit(0, maxWallLimit, 0);
    this.cancelPendingSolverRun();
    setCurrentEndDistance(
      DEFAULT_SANDBOX_END_DISTANCE,
      this.getMaxEndDistance()
    );
    this.setState(
      {
        solverOverlayEnabled: false,
        solverResult: null,
        solverProgress: null,
        solverResultStale: false,
        solverOverlayHidden: false,
        solverPanelClosed: false,
        solverStatus: 'idle',
        showSolverSolutionsMenu: false,
        selectedSolverSolutionIndex: 0,
      },
      this.refreshSettings
    );
  }

  applyCampaignLevelSandboxSettings(level, grid) {
    this.setCampaignLevelSandboxSettingsEnabled(true, level, grid);
  }

  toggleCampaignLevelSandboxSettings = () => {
    this.setCampaignLevelSandboxSettingsEnabled(
      !this.areCampaignLevelSandboxSettingsEnabled()
    );
  };

  resetSandboxSettings = () => {
    this.cancelPendingSolverRun();
    resetSandboxOptions();
    setCurrentEndDistance(
      DEFAULT_SANDBOX_END_DISTANCE,
      this.getMaxEndDistance()
    );
    setVisualizerPaused(this.state.showOptionsMenu);

    this.setState(
      {
        solverOverlayEnabled: false,
        solverResult: null,
        solverProgress: null,
        solverResultStale: false,
        solverOverlayHidden: false,
        solverPanelClosed: false,
        solverStatus: 'idle',
        showSolverSolutionsMenu: false,
        selectedSolverSolutionIndex: 0,
        headerEditField: null,
        headerWallLimitDraft: '',
        headerEndDistanceDraft: '',
        sandboxWallLimitDraft: null,
        sandboxEndDistanceDraft: null,
      },
      this.refreshSettings
    );
  };

  startHeaderEdit = (field) => {
    this.setState({
      headerEditField: field,
      headerWallLimitDraft: String(getSandboxWallLimit()),
      headerEndDistanceDraft: String(getActualCurrentEndDistance()),
    });
  };

  updateHeaderWallLimitDraft = (event) => {
    this.setState({
      headerWallLimitDraft: this.normalizeIntegerDraft(
        event.target.value,
        this.getWallableNodeCount()
      ),
    });
  };

  updateHeaderEndDistanceDraft = (event) => {
    this.setState({
      headerEndDistanceDraft: this.normalizeIntegerDraft(
        event.target.value,
        this.getMaxEndDistance()
      ),
    });
  };

  commitHeaderEdit = () => {
    if (this.state.headerEditField === 'wallLimit') {
      this.applySandboxWallLimitValue(this.state.headerWallLimitDraft);
    } else if (this.state.headerEditField === 'endDistance') {
      this.applySandboxEndDistanceValue(this.state.headerEndDistanceDraft);
    }
    this.setState({ headerEditField: null });
  };

  cancelHeaderEdit = () => {
    this.setState({ headerEditField: null });
  };

  handleHeaderEditKeyDown = (event) => {
    this.preventInvalidIntegerKey(event);
    if (event.defaultPrevented) return;

    if (event.key === 'Enter') {
      this.commitHeaderEdit();
    } else if (event.key === 'Escape') {
      this.cancelHeaderEdit();
    }
  };

  startSandboxWallLimitDraft = () => {
    this.setState({ sandboxWallLimitDraft: String(getSandboxWallLimit()) });
  };

  updateSandboxWallLimitDraft = (event) => {
    this.setState({
      sandboxWallLimitDraft: this.normalizeIntegerDraft(
        event.target.value,
        this.getWallableNodeCount()
      ),
    });
  };

  commitSandboxWallLimitDraft = () => {
    const value = this.state.sandboxWallLimitDraft;
    this.setState({ sandboxWallLimitDraft: null }, () => {
      if (value !== null) this.applySandboxWallLimitValue(value);
    });
  };

  cancelSandboxWallLimitDraft = () => {
    this.setState({ sandboxWallLimitDraft: null });
  };

  handleSandboxWallLimitKeyDown = (event) => {
    this.preventInvalidIntegerKey(event);
    if (event.defaultPrevented) return;

    if (event.key === 'Enter') {
      this.commitSandboxWallLimitDraft();
    } else if (event.key === 'Escape') {
      this.cancelSandboxWallLimitDraft();
    }
  };

  startSandboxEndDistanceDraft = () => {
    this.setState({
      sandboxEndDistanceDraft: String(getActualCurrentEndDistance()),
    });
  };

  updateSandboxEndDistanceDraft = (event) => {
    this.setState({
      sandboxEndDistanceDraft: this.normalizeIntegerDraft(
        event.target.value,
        this.getMaxEndDistance()
      ),
    });
  };

  commitSandboxEndDistanceDraft = () => {
    const value = this.state.sandboxEndDistanceDraft;
    this.setState({ sandboxEndDistanceDraft: null }, () => {
      if (value !== null) this.applySandboxEndDistanceValue(value);
    });
  };

  cancelSandboxEndDistanceDraft = () => {
    this.setState({ sandboxEndDistanceDraft: null });
  };

  handleSandboxEndDistanceKeyDown = (event) => {
    this.preventInvalidIntegerKey(event);
    if (event.defaultPrevented) return;

    if (event.key === 'Enter') {
      this.commitSandboxEndDistanceDraft();
    } else if (event.key === 'Escape') {
      this.cancelSandboxEndDistanceDraft();
    }
  };

  getHeaderWallUsageControl() {
    if (!getShowSandboxWallUsage() || getSandboxWallLimit() <= 0) return null;

    if (this.state.headerEditField === 'wallLimit') {
      return (
        <p className="topbar-message sandbox-inline-setting">
          {this.getSandboxWallUsageCount()} out of{' '}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min={this.getSandboxWallUsageCount()}
            max={this.getWallableNodeCount()}
            value={this.state.headerWallLimitDraft}
            onChange={this.updateHeaderWallLimitDraft}
            onBlur={this.commitHeaderEdit}
            onKeyDown={this.handleHeaderEditKeyDown}
            className="topbar-inline-input"
            autoFocus
          />{' '}
          walls used
        </p>
      );
    }

    return (
      <p className="topbar-message sandbox-inline-setting">
        {this.getSandboxWallUsageCount()} out of{' '}
        <button
          type="button"
          className="topbar-inline-edit"
          aria-label="Edit wall limit"
          title="Edit wall limit"
          onClick={() => this.startHeaderEdit('wallLimit')}
        >
          {getSandboxWallLimit()}
        </button>{' '}
        walls used
      </p>
    );
  }

  getHeaderEndDistanceControl() {
    if (this.state.headerEditField === 'endDistance') {
      return (
        <p className="topbar-message sandbox-inline-setting">
          End Distance:{' '}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            max={this.getMaxEndDistance()}
            value={this.state.headerEndDistanceDraft}
            onChange={this.updateHeaderEndDistanceDraft}
            onBlur={this.commitHeaderEdit}
            onKeyDown={this.handleHeaderEditKeyDown}
            className="topbar-inline-input"
            autoFocus
          />
        </p>
      );
    }

    return (
      <p className="topbar-message sandbox-inline-setting">
        End Distance:{' '}
        <button
          type="button"
          className="topbar-inline-edit"
          aria-label="Edit end distance"
          title="Edit end distance"
          onClick={() => this.startHeaderEdit('endDistance')}
        >
          {getActualCurrentEndDistance()}
        </button>
      </p>
    );
  }

  formatSolverSeconds(milliseconds) {
    return (Math.max(0, milliseconds) / 1000).toFixed(1);
  }

  isSandboxSolverRunning() {
    return (
      this.state.solverStatus === 'queued' ||
      this.state.solverStatus === 'calculating'
    );
  }

  getHeaderSolverRunControl() {
    if (!this.state.solverOverlayEnabled) return null;

    const isSolving = this.isSandboxSolverRunning();
    const canRun = this.canRunSandboxSolver();
    const buttonText = isSolving
      ? 'Solving...'
      : this.state.solverResult
        ? 'Solve Again'
        : 'Find Solution';

    return (
      <button
        type="button"
        className={`standard-button topbar-control sandbox-solver-run-button ${
          !canRun ? 'standard-button-disabled' : ''
        }`}
        onClick={this.runSandboxSolver}
        disabled={!canRun}
      >
        {buttonText}
      </button>
    );
  }

  getHeaderSolverOverlayControls() {
    if (!this.state.solverOverlayEnabled) return null;

    const hasSolutions = this.state.solverResult?.solutions?.length > 0;
    const controls = [];

    if (hasSolutions) {
      controls.push(
        <button
          type="button"
          className="standard-button topbar-control sandbox-solver-visibility-button"
          onClick={this.toggleSolverOverlayVisibility}
          key="visibility"
        >
          {this.state.solverOverlayHidden ? 'Show Overlay' : 'Hide Overlay'}
        </button>
      );
    }

    if (
      this.state.solverPanelClosed &&
      (this.state.solverResult || this.isSandboxSolverRunning())
    ) {
      controls.push(
        <button
          type="button"
          className="standard-button topbar-control sandbox-solver-panel-button"
          onClick={this.showSolverPanel}
          key="panel"
        >
          Show Dev Panel
        </button>
      );
    }

    return controls;
  }

  isSolverOnlyNode(row, col) {
    const node = this.state.grid[row]?.[col];
    if (!node || node.isWall || node.isPermanentWall) return false;

    return this.getSelectedSolverWallKeys().has(getSandboxNodeKey(row, col));
  }

  isMaterializedSolverWall(row, col) {
    if (!this.state.solverOverlayEnabled || !this.state.solverResult) return false;

    const node = this.state.grid[row]?.[col];
    if (!node || !node.isWall || node.isPermanentWall) return false;

    return this.materializedSolverWallKeys.has(getSandboxNodeKey(row, col));
  }

  materializeSolverWall(row, col) {
    if (!this.isGridInteractionEnabled() || !this.isSolverOnlyNode(row, col)) {
      return;
    }

    let materializedKey = null;
    this.suppressNextSolverInvalidation = true;
    this.setState((prevState) => {
      const node = prevState.grid[row]?.[col];
      if (!node || node.isStart || node.isEnd || node.isWall || node.isPermanentWall) {
        return null;
      }

      if (
        getShowSandboxWallUsage() &&
        getSandboxWallLimit() > 0 &&
        this.getSandboxWallUsageCount(prevState.grid) >= getSandboxWallLimit()
      ) {
        return null;
      }

      const grid = prevState.grid.map((gridRow, rowIndex) =>
        rowIndex === row
          ? gridRow.map((gridNode, colIndex) =>
              colIndex === col
                ? {
                    ...gridNode,
                    isWall: true,
                    isPermanentWall: false,
                    isRandomWall: false,
                  }
                : gridNode
            )
          : gridRow
      );

      materializedKey = getSandboxNodeKey(row, col);
      return { grid };
    }, () => {
      if (materializedKey) this.materializedSolverWallKeys.add(materializedKey);
      this.suppressNextSolverInvalidation = false;
      this.lastSolverInputSignature = this.getSolverInputSignature();
      this.refreshSettings();
    });
  }

  removeMaterializedSolverWall(row, col) {
    const key = getSandboxNodeKey(row, col);
    if (
      !this.isGridInteractionEnabled() ||
      !this.materializedSolverWallKeys.has(key)
    ) {
      return;
    }

    this.suppressNextSolverInvalidation = true;
    this.setState((prevState) => {
      const node = prevState.grid[row]?.[col];
      if (!node || node.isStart || node.isEnd || !node.isWall || node.isPermanentWall) {
        return null;
      }

      const grid = prevState.grid.map((gridRow, rowIndex) =>
        rowIndex === row
          ? gridRow.map((gridNode, colIndex) =>
              colIndex === col
                ? {
                    ...gridNode,
                    isWall: false,
                    isPermanentWall: false,
                    isRandomWall: false,
                  }
                : gridNode
            )
          : gridRow
      );

      return { grid };
    }, () => {
      this.materializedSolverWallKeys.delete(key);
      this.suppressNextSolverInvalidation = false;
      this.lastSolverInputSignature = this.getSolverInputSignature();
      this.refreshSettings();
    });
  }

  getSelectedSolverSolution() {
    const solutions = this.state.solverResult?.solutions || [];
    if (solutions.length === 0) return null;
    return solutions[
      Math.min(this.state.selectedSolverSolutionIndex, solutions.length - 1)
    ];
  }

  getSelectedSolverWallKeys({ includeHidden = false } = {}) {
    const selectedSolution = this.getSelectedSolverSolution();
    if (!this.state.solverOverlayEnabled || !selectedSolution) return new Set();
    if (this.state.solverOverlayHidden && !includeHidden) return new Set();
    return new Set(selectedSolution.wallKeys || []);
  }

  getVisibleSolverWallKeys() {
    const selectedSolution = this.getSelectedSolverSolution();
    if (
      !this.state.solverOverlayEnabled ||
      this.state.solverOverlayHidden ||
      !selectedSolution
    ) {
      return [];
    }

    return selectedSolution.wallKeys.filter((key) => {
      const { row, col } = parseSandboxNodeKey(key);
      const node = this.state.grid[row]?.[col];
      return node && !node.isWall && !node.isPermanentWall;
    });
  }

  getMinimumSolverWallCount() {
    const metadataMinimum =
      this.state.solverResult?.metadata?.minimumFoundWallCount ??
      this.state.solverProgress?.minimumFoundWallCount;
    if (Number.isFinite(metadataMinimum)) return metadataMinimum;

    const solutions = this.state.solverResult?.solutions || [];
    if (solutions.length === 0) return null;

    return Math.min(...solutions.map((solution) => solution.wallCount));
  }

  getSolverSolutionCount() {
    return (
      this.state.solverResult?.metadata?.solutionCount ||
      this.state.solverResult?.solutions?.length ||
      this.state.solverProgress?.solutionCount ||
      0
    );
  }

  cancelPendingSolverRun = () => {
    this.solverRunId++;

    if (this.solverWorker) {
      this.solverWorker.terminate();
      this.solverWorker = null;
    }

    this.clearSolverProgressTimer();

    if (this.solverFrameId !== null) {
      window.cancelAnimationFrame(this.solverFrameId);
      this.solverFrameId = null;
    }

    if (this.solverTimeoutId !== null) {
      window.clearTimeout(this.solverTimeoutId);
      this.solverTimeoutId = null;
    }
  };

  clearSolverProgressTimer() {
    if (this.solverProgressIntervalId !== null) {
      window.clearInterval(this.solverProgressIntervalId);
      this.solverProgressIntervalId = null;
    }
    this.solverStartedAt = null;
  }

  startSolverProgressTimer() {
    this.clearSolverProgressTimer();
    this.solverStartedAt =
      typeof performance !== 'undefined' && performance.now
        ? performance.now()
        : Date.now();

    this.solverProgressIntervalId = window.setInterval(() => {
      if (!this.isSandboxSolverRunning() || this.solverStartedAt === null) {
        this.clearSolverProgressTimer();
        return;
      }

      const now =
        typeof performance !== 'undefined' && performance.now
          ? performance.now()
          : Date.now();
      const elapsedMs = Math.max(0, Math.round(now - this.solverStartedAt));

      this.setState((prevState) => {
        if (
          prevState.solverStatus !== 'queued' &&
          prevState.solverStatus !== 'calculating'
        ) {
          return null;
        }

        const previousProgress = prevState.solverProgress || {};
        const maxTimeMs =
          previousProgress.maxTimeMs || SANDBOX_SOLVER_MAX_TIME_MS;

        return {
          solverProgress: {
            ...previousProgress,
            phase: previousProgress.phase || 'calculating',
            solutionCount: previousProgress.solutionCount || 0,
            elapsedMs: Math.min(elapsedMs, maxTimeMs),
            remainingMs: Math.max(0, maxTimeMs - elapsedMs),
            maxTimeMs,
          },
        };
      });
    }, 250);
  }

  getSolverInputSignature(grid = this.state.grid) {
    const normalWalls = [];
    const permanentWalls = [];

    grid.forEach((gridRow) => {
      gridRow.forEach((node) => {
        if (!node.isWall && !node.isPermanentWall && !node.isRandomWall) return;

        const key = getSandboxNodeKey(node.row, node.col);
        if (node.isPermanentWall || node.isRandomWall) permanentWalls.push(key);
        else if (node.isWall) normalWalls.push(key);
      });
    });

    normalWalls.sort();
    permanentWalls.sort();

    return [
      START_NODE_ROW,
      START_NODE_COL,
      END_NODE_ROW,
      END_NODE_COL,
      getShowSandboxWallUsage() ? 1 : 0,
      getSandboxWallLimit(),
      getActualCurrentEndDistance(),
      normalWalls.join(','),
      permanentWalls.join(','),
    ].join('|');
  }

  handleSolverInputChange = () => {
    const nextSignature = this.getSolverInputSignature();
    const signatureChanged = this.lastSolverInputSignature !== nextSignature;
    this.lastSolverInputSignature = nextSignature;

    if (!signatureChanged) return;

    if (this.suppressNextSolverInvalidation) {
      this.suppressNextSolverInvalidation = false;
      return;
    }

    this.materializedSolverWallKeys.clear();

    const isSolving =
      this.state.solverStatus === 'queued' ||
      this.state.solverStatus === 'calculating';
    if (isSolving) this.cancelPendingSolverRun();

    if (
      this.state.solverOverlayEnabled &&
      (this.state.solverResult ||
        this.state.solverProgress ||
        this.state.solverStatus !== 'idle' ||
        this.state.showSolverSolutionsMenu)
    ) {
      this.setState({
        solverProgress: null,
        solverStatus: 'idle',
        solverResultStale: Boolean(this.state.solverResult),
      });
    }
  };

  getRemainingSolverWallBudget(grid = this.state.grid) {
    if (!getShowSandboxWallUsage() || getSandboxWallLimit() <= 0) return 0;

    return Math.max(0, getSandboxWallLimit() - this.getSandboxWallUsageCount(grid));
  }

  canRunSandboxSolver() {
    return (
      this.state.solverOverlayEnabled &&
      getShowSandboxWallUsage() &&
      getSandboxWallLimit() > 0 &&
      getActualCurrentEndDistance() > 0 &&
      this.state.solverStatus !== 'queued' &&
      this.state.solverStatus !== 'calculating'
    );
  }

  buildSandboxSolverInput() {
    return {
      grid: this.state.grid,
      rows: NUM_ROWS,
      columns: NUM_COLUMNS,
      start: { row: START_NODE_ROW, col: START_NODE_COL },
      end: { row: END_NODE_ROW, col: END_NODE_COL },
      allowedWallCount: this.getRemainingSolverWallBudget(),
      endDistance: getActualCurrentEndDistance(),
      includeExistingWalls: true,
      maxSolutions: null,
      maxStates: null,
      maxCombinations: null,
      maxTimeMs: SANDBOX_SOLVER_MAX_TIME_MS,
      candidateLimit: 192,
    };
  }

  createSolverStatusResult(status, message, elapsedMs = 0) {
    return {
      status,
      solutions: [],
      message,
      metadata: {
        status,
        solutionCount: 0,
        minimumFoundWallCount: null,
        minimumFoundSolutionCount: 0,
        elapsedMs,
        maxTimeMs: SANDBOX_SOLVER_MAX_TIME_MS,
        wallBudget: this.getRemainingSolverWallBudget(),
        allowedWallCount: this.getRemainingSolverWallBudget(),
        endDistance: getActualCurrentEndDistance(),
      },
    };
  }

  runSandboxSolver = () => {
    if (!this.state.solverOverlayEnabled) return;

    this.cancelPendingSolverRun();

    if (
      !getShowSandboxWallUsage() ||
      getSandboxWallLimit() <= 0
    ) {
      this.setState({
        solverResult: this.createSolverStatusResult(
          'invalid',
          'Turn on Show Walls Used and set a wall limit before solving.'
        ),
        solverProgress: null,
        solverResultStale: false,
        solverPanelClosed: false,
        solverStatus: 'done',
        selectedSolverSolutionIndex: 0,
        showSolverSolutionsMenu: false,
      });
      return;
    }

    const maxWallLimit = this.getWallableNodeCount();
    if (getSandboxWallLimit() > maxWallLimit) {
      setSandboxWallLimit(maxWallLimit, maxWallLimit);
      this.refreshSettings();
      return;
    }

    const solverInput = this.buildSandboxSolverInput();
    const runId = this.solverRunId;
    this.materializedSolverWallKeys.clear();
    const initialProgress = {
      phase: 'queued',
      solutionCount: 0,
      elapsedMs: 0,
      remainingMs: SANDBOX_SOLVER_MAX_TIME_MS,
      maxTimeMs: SANDBOX_SOLVER_MAX_TIME_MS,
      wallBudget: solverInput.allowedWallCount,
      endDistance: solverInput.endDistance,
    };

    this.lastSolverInputSignature = this.getSolverInputSignature();
    this.setState({
      solverStatus: 'queued',
      solverProgress: initialProgress,
      solverResult: null,
      solverResultStale: false,
      solverOverlayHidden: false,
      solverPanelClosed: false,
      selectedSolverSolutionIndex: 0,
      showSolverSolutionsMenu: false,
    });
    this.startSolverProgressTimer();

    const worker = new Worker(new URL('./sandboxSolver.worker.js', import.meta.url), {
      type: 'module',
    });
    this.solverWorker = worker;

    worker.onmessage = (event) => {
      if (this.isUnmounted || runId !== this.solverRunId) return;

      const { type, progress, result, message } = event.data || {};

      if (type === 'progress') {
        this.setState({
          solverStatus: 'calculating',
          solverProgress: progress,
        });
        return;
      }

      if (type === 'result') {
        worker.terminate();
        if (this.solverWorker === worker) this.solverWorker = null;
        this.clearSolverProgressTimer();

        const nextSelectedIndex =
          result.solutions.length === 0
            ? 0
            : Math.min(
                this.state.selectedSolverSolutionIndex,
                result.solutions.length - 1
              );

        this.setState({
          solverResult: result,
          solverProgress: {
            ...(this.state.solverProgress || initialProgress),
            phase: 'complete',
            solutionCount: result.solutions.length,
            elapsedMs: result.metadata?.elapsedMs || 0,
            remainingMs: 0,
            maxTimeMs: result.metadata?.maxTimeMs || SANDBOX_SOLVER_MAX_TIME_MS,
            minimumFoundWallCount: result.metadata?.minimumFoundWallCount,
          },
          solverStatus: 'done',
          solverResultStale: false,
          solverPanelClosed: false,
          selectedSolverSolutionIndex: nextSelectedIndex,
          showSolverSolutionsMenu:
            result.solutions.length > 1 && this.state.showSolverSolutionsMenu,
        });
        return;
      }

      if (type === 'error') {
        worker.terminate();
        if (this.solverWorker === worker) this.solverWorker = null;
        this.clearSolverProgressTimer();
        const elapsedMs = this.state.solverProgress?.elapsedMs || 0;
        this.setState({
          solverResult: this.createSolverStatusResult(
            'error',
            message || 'Solver failed unexpectedly.',
            elapsedMs
          ),
          solverProgress: null,
          solverResultStale: false,
          solverPanelClosed: false,
          solverStatus: 'done',
          selectedSolverSolutionIndex: 0,
          showSolverSolutionsMenu: false,
        });
      }
    };

    worker.onerror = () => {
      if (this.isUnmounted || runId !== this.solverRunId) return;
      worker.terminate();
      if (this.solverWorker === worker) this.solverWorker = null;
      this.clearSolverProgressTimer();

      const elapsedMs = this.state.solverProgress?.elapsedMs || 0;
      this.setState({
        solverResult: this.createSolverStatusResult(
          'error',
          'Solver failed unexpectedly.',
          elapsedMs
        ),
        solverProgress: null,
        solverResultStale: false,
        solverPanelClosed: false,
        solverStatus: 'done',
        selectedSolverSolutionIndex: 0,
        showSolverSolutionsMenu: false,
      });
    };

    worker.postMessage({
      type: 'solve',
      requestId: runId,
      input: solverInput,
    });
  };

  getSandboxSolverHeaderMessage() {
    if (!this.state.solverOverlayEnabled) return null;
    if (this.isSandboxSolverRunning()) {
      const progress = this.state.solverProgress;
      const foundText = `${progress?.solutionCount || 0} found`;
      const remainingText = progress
        ? `${this.formatSolverSeconds(progress.remainingMs)}s left`
        : `${this.formatSolverSeconds(SANDBOX_SOLVER_MAX_TIME_MS)}s left`;

      return `Dev Mode: calculating safe paths (${foundText}, ${remainingText})`;
    }
    if (!this.state.solverResult) {
      return 'Dev Mode: solver ready. Press Find Solution.';
    }
    if (this.state.solverResult.solutions.length > 0) {
      if (this.state.solverResultStale) {
        return 'Dev Mode: grid changed. Overlay is stale; press Solve Again to refresh.';
      }

      const selectedSolution = this.getSelectedSolverSolution();
      const wallText = selectedSolution
        ? `, ${selectedSolution.wallCount} wall${
            selectedSolution.wallCount === 1 ? '' : 's'
          }`
        : '';

      return `Dev Mode: safe path overlay shown (${this.state.selectedSolverSolutionIndex + 1}/${
        this.state.solverResult.solutions.length
      }${wallText})`;
    }
    return this.state.solverResult.message;
  }

  getSandboxSolverPanel() {
    if (
      !this.state.solverOverlayEnabled ||
      this.state.solverPanelClosed ||
      (!this.state.solverResult &&
        this.state.solverStatus !== 'queued' &&
        this.state.solverStatus !== 'calculating')
    ) {
      return null;
    }

    const isSolving = this.isSandboxSolverRunning();
    const hasSolutions = this.state.solverResult?.solutions.length > 0;
    const selectedSolution = this.getSelectedSolverSolution();
    const unappliedOverlayWallCount =
      this.getUnappliedSolutionWallCount(selectedSolution);
    const minimumFoundWallCount = this.getMinimumSolverWallCount();
    const solutionCount = this.getSolverSolutionCount();
    const progress = this.state.solverProgress;
    const progressMaxMs = progress?.maxTimeMs || SANDBOX_SOLVER_MAX_TIME_MS;
    const progressElapsedMs = progress?.elapsedMs || 0;
    const progressRemainingMs =
      progress?.remainingMs ?? Math.max(0, progressMaxMs - progressElapsedMs);
    const progressPercent = Math.min(
      100,
      Math.max(3, (progressElapsedMs / progressMaxMs) * 100)
    );
    const panelPosition = this.state.solverPanelPosition;
    const overlayStyle = panelPosition
      ? {
          left: `${panelPosition.x}px`,
          top: `${panelPosition.y}px`,
          right: 'auto',
          bottom: 'auto',
        }
      : undefined;

    return (
      <div
        className={`sandbox-solver-overlay ${
          panelPosition ? 'is-positioned' : ''
        }`}
        style={overlayStyle}
      >
        <div className="sandbox-solver-panel" ref={this.solverPanelRef}>
          <div
            className="sandbox-solver-header"
            onMouseDown={this.startSolverPanelDrag}
          >
            <p className="sandbox-solver-title">Dev Mode</p>
            <div className="sandbox-solver-actions">
              {this.state.solverResult?.solutions.length > 1 ? (
                <button
                  type="button"
                  className="sandbox-solver-button"
                  onClick={this.toggleSolverSolutionsMenu}
                >
                  View Solutions
                </button>
              ) : null}
              {hasSolutions ? (
                <button
                  type="button"
                  className="sandbox-solver-button"
                  onClick={this.toggleSolverOverlayVisibility}
                >
                  {this.state.solverOverlayHidden ? 'Show Overlay' : 'Hide Overlay'}
                </button>
              ) : null}
              <button
                type="button"
                className="sandbox-solver-button"
                onClick={this.closeSolverPanel}
              >
                Close
              </button>
            </div>
          </div>

          <p
            className={`sandbox-dev-message ${
              isSolving ? 'is-pending' : hasSolutions ? 'is-success' : 'is-error'
            } ${this.state.solverResultStale ? 'is-stale' : ''}`}
          >
            {isSolving ? (
              <span className="sandbox-solver-loading">
                <span className="sandbox-solver-spinner" aria-hidden="true" />
                Calculating verified wall sets...
              </span>
            ) : (
              this.state.solverResult.message
            )}
          </p>
          {this.state.solverResultStale ? (
            <p className="sandbox-dev-message is-pending">
              Grid changed after this solve. The overlay is kept for reference;
              use Solve Again for a fresh result.
            </p>
          ) : null}
          {isSolving ? (
            <div className="sandbox-solver-progress-block">
              <div
                className="sandbox-solver-progress-bar"
                aria-label="Solver progress"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(progressPercent)}
                role="progressbar"
              >
                <span
                  className="sandbox-solver-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="sandbox-solver-progress-meta">
                <span>
                  {progress?.solutionCount || 0} solution
                  {(progress?.solutionCount || 0) === 1 ? '' : 's'} found
                </span>
                {Number.isFinite(progress?.minimumFoundWallCount) ? (
                  <span>
                    Minimum: {progress.minimumFoundWallCount} wall
                    {progress.minimumFoundWallCount === 1 ? '' : 's'}
                  </span>
                ) : null}
                <span>{this.formatSolverSeconds(progressRemainingMs)}s left</span>
                <span>up to {this.formatSolverSeconds(progressMaxMs)}s</span>
              </div>
            </div>
          ) : null}
          <div className="sandbox-solver-meta">
            {selectedSolution ? (
              <span>
                {selectedSolution.wallCount} wall
                {selectedSolution.wallCount === 1 ? '' : 's'} in current overlay
              </span>
            ) : null}
            {selectedSolution ? (
              <span>
                {unappliedOverlayWallCount} suggested wall
                {unappliedOverlayWallCount === 1 ? '' : 's'} not placed yet
              </span>
            ) : null}
            {Number.isFinite(minimumFoundWallCount) ? (
              <span>
                Minimum found: {minimumFoundWallCount} wall
                {minimumFoundWallCount === 1 ? '' : 's'}
              </span>
            ) : null}
            <span>
              {solutionCount} solution{solutionCount === 1 ? '' : 's'} found
            </span>
          </div>
        </div>
      </div>
    );
  }

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
    this.setState(({ showOptionsMenu }) => {
      const nextShowOptionsMenu = !showOptionsMenu;
      setVisualizerPaused(nextShowOptionsMenu);
      return { showOptionsMenu: nextShowOptionsMenu };
    });
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
    this.randomWallDraftGrid = null;
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

  addRandomPlaneWall(tick) {
    const column = this.getPlaneWallColumn();
    let grid = this.randomWallDraftGrid || this.state.grid;

    if (column !== null && column >= 0 && column < NUM_COLUMNS) {
      const row = Math.floor(Math.random() * NUM_ROWS);
      const node = grid[row][column];
      const unWallable =
        node.isEnd ||
        node.isStart ||
        node.isWall ||
        node.isPermanentWall;

      if (!unWallable) {
        const nextRow = [...grid[row]];
        nextRow[column] = {
          ...node,
          isWall: true,
          isPermanentWall: true,
          isRandomWall: true,
        };
        grid = grid.map((gridRow, rowIndex) =>
          rowIndex === row ? nextRow : gridRow
        );
        this.randomWallDraftGrid = grid;
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
      this.state.animatingPlane
    ) {
      return;
    }

    this.setHomeButtonEnabled(false);
    resetAllNodes(this.state.grid);
    this.cancelPendingSolverRun();
    this.randomWallDraftGrid = this.state.grid;
    this.setState((prevState) => ({
      animatingPlane: true,
      solverProgress: null,
      solverResultStale: Boolean(prevState.solverResult),
      solverOverlayHidden: Boolean(prevState.solverResult),
      solverPanelClosed: false,
      solverStatus: prevState.solverResult ? 'idle' : prevState.solverStatus,
      selectedSolverSolutionIndex: 0,
      showSolverSolutionsMenu: false,
    }));
    this.startPlaneRun((tick) => this.addRandomPlaneWall(tick));
  }

  isGridInteractionEnabled() {
    const homeButton = document.getElementById('homeButton');
    return Boolean(homeButton?.classList.contains('enabled'));
  }

  prepareGridInteraction(row, col, allowWallAfterAnimation = true) {
    if (!this.isGridInteractionEnabled() || this.isSolverOnlyNode(row, col)) {
      return false;
    }

    if (!allowWallAfterAnimation && !getHasGridBeenReset()) {
      resetAllNodes(this.state.grid);
      setHasGridBeenReset(true);
      this.suppressNextNodeClick = true;
      return false;
    }

    resetAllNodes(this.state.grid);
    setHasGridBeenReset(true);
    return true;
  }

  getWallDragMode() {
    return permanentWallToggled ? 'permanent' : 'wall';
  }

  getWallDragAction(node, mode) {
    if (mode === 'permanent') return node.isPermanentWall ? 'remove' : 'add';
    if (node.isRandomWall) return 'remove';
    return node.isWall && !node.isPermanentWall ? 'remove' : 'add';
  }

  getNextWallNode(node, grid, mode, action) {
    if (!node || node.isStart || node.isEnd) return null;
    if (node.isRandomWall) {
      if (action !== 'remove') return null;

      return {
        ...node,
        isWall: false,
        isPermanentWall: false,
        isRandomWall: false,
      };
    }

    if (mode !== 'permanent' && node.isPermanentWall) return null;

    let nextNode = node;

    if (mode === 'permanent') {
      nextNode =
        action === 'remove'
          ? {
              ...node,
              isWall: false,
              isPermanentWall: false,
              isRandomWall: false,
            }
          : {
              ...node,
              isWall: true,
              isPermanentWall: true,
              isRandomWall: false,
            };
    } else if (action === 'remove') {
      if (!node.isWall || node.isPermanentWall) return null;
      nextNode = {
        ...node,
        isWall: false,
        isPermanentWall: false,
        isRandomWall: false,
      };
    } else {
      if (node.isWall) return null;
      if (
        getShowSandboxWallUsage() &&
        getSandboxWallLimit() > 0 &&
        this.getSandboxWallUsageCount(grid) >= getSandboxWallLimit()
      ) {
        return null;
      }
      nextNode = {
        ...node,
        isWall: true,
        isPermanentWall: false,
        isRandomWall: false,
      };
    }

    if (
      nextNode.isWall === node.isWall &&
      nextNode.isPermanentWall === node.isPermanentWall &&
      Boolean(nextNode.isRandomWall) === Boolean(node.isRandomWall)
    ) {
      return null;
    }

    return nextNode;
  }

  getWallDragDraftGrid() {
    if (!this.wallDragDraftGrid) {
      this.wallDragDraftGrid = this.state.grid.map((gridRow) => [...gridRow]);
    }

    return this.wallDragDraftGrid;
  }

  cloneWallDragDraftGrid() {
    return this.wallDragDraftGrid.map((gridRow) => [...gridRow]);
  }

  syncWallNodeElement(row, col, nextNode) {
    const nodeElement = document.getElementById(`node-${row}-${col}`);
    if (!nodeElement) return;

    nodeElement.classList.remove(
      'node-wall',
      'node-permanent-wall',
      'node-random-wall',
      'node-solver-wall'
    );

    if (nextNode.isRandomWall) {
      nodeElement.classList.add(
        'node-wall',
        'node-permanent-wall',
        'node-random-wall'
      );
    } else if (nextNode.isPermanentWall) {
      nodeElement.classList.add('node-wall', 'node-permanent-wall');
    } else if (nextNode.isWall) {
      nodeElement.classList.add('node-wall');
    }
  }

  scheduleWallDragRender() {
    if (this.wallDragFrameId !== null) return;

    this.wallDragFrameId = window.requestAnimationFrame(() => {
      this.wallDragFrameId = null;
      if (!this.wallDragDraftGrid || !this.wallDragDirty || this.isUnmounted) {
        return;
      }

      this.wallDragDirty = false;
      this.setState({ grid: this.cloneWallDragDraftGrid() });
    });
  }

  flushWallDragRender(callback) {
    if (this.wallDragFrameId !== null) {
      window.cancelAnimationFrame(this.wallDragFrameId);
      this.wallDragFrameId = null;
    }

    const shouldFlush = this.wallDragDraftGrid && this.wallDragHadChanges;
    const grid = shouldFlush ? this.cloneWallDragDraftGrid() : null;

    this.wallDragDraftGrid = null;
    this.wallDragDirty = false;
    this.wallDragHadChanges = false;

    if (grid) {
      this.setState({ grid }, callback);
    } else if (callback) {
      callback();
    }
  }

  applyWallAt(row, col, mode, action, { batched = false } = {}) {
    if (this.isSolverOnlyNode(row, col)) return;
    if (action === 'remove' && this.isMaterializedSolverWall(row, col)) {
      this.removeMaterializedSolverWall(row, col);
      return;
    }

    if (batched) {
      const grid = this.getWallDragDraftGrid();
      const node = grid[row]?.[col];
      const nextNode = this.getNextWallNode(node, grid, mode, action);
      if (!nextNode) return;

      grid[row][col] = nextNode;
      this.wallDragDirty = true;
      this.wallDragHadChanges = true;
      this.syncWallNodeElement(row, col, nextNode);
      this.scheduleWallDragRender();
      return;
    }

    let changed = false;
    this.setState((prevState) => {
      const node = prevState.grid[row]?.[col];
      const nextNode = this.getNextWallNode(node, prevState.grid, mode, action);
      if (!nextNode) return null;

      const grid = prevState.grid.map((gridRow, rowIndex) =>
        rowIndex === row
          ? gridRow.map((gridNode, colIndex) =>
              colIndex === col ? nextNode : gridNode
            )
          : gridRow
      );

      changed = true;
      return { grid };
    }, () => {
      if (changed) this.refreshSolver();
    });
  }

  beginWallDrag(row, col) {
    const node = this.state.grid[row]?.[col];
    if (!node || node.isStart || node.isEnd) return;

    const mode = this.getWallDragMode();
    if (mode !== 'permanent' && node.isPermanentWall && !node.isRandomWall) {
      return;
    }

    const action = this.getWallDragAction(node, mode);
    const key = getSandboxNodeKey(row, col);

    this.activeDrag = { kind: 'wall', mode, action, lastKey: key };
    this.draggingWallMode = mode;
    this.suppressNextNodeClick = true;
    this.applyWallAt(row, col, mode, action, { batched: true });
  }

  beginTerminalDrag(node) {
    const type = node.isStart ? 'start' : 'end';
    const key = getSandboxNodeKey(node.row, node.col);

    this.activeDrag = { kind: 'terminal', type, lastKey: key };
    this.suppressNextNodeClick = true;
    this.setState({ dragging: [true, { type }, node] });
  }

  canMoveTerminalTo(node, type) {
    if (!node) return false;
    if (type === 'start' && node.isEnd) return false;
    if (type === 'end' && node.isStart) return false;
    return !node.isWall && !node.isPermanentWall;
  }

  moveTerminalDrag(row, col) {
    if (!this.activeDrag || this.activeDrag.kind !== 'terminal') return;

    const key = getSandboxNodeKey(row, col);
    if (this.activeDrag.lastKey === key) return;

    const { type } = this.activeDrag;

    this.setState((prevState) => {
      const targetNode = prevState.grid[row]?.[col];
      if (!this.canMoveTerminalTo(targetNode, type)) return null;

      const grid = prevState.grid.map((gridRow) =>
        gridRow.map((node) => {
          if (node.row === row && node.col === col) {
            return {
              ...node,
              isStart: type === 'start',
              isEnd: type === 'end',
              isWall: false,
              isPermanentWall: false,
              isRandomWall: false,
            };
          }

          if (type === 'start' && node.isStart) {
            return { ...node, isStart: false };
          }

          if (type === 'end' && node.isEnd) {
            return { ...node, isEnd: false };
          }

          return node;
        })
      );
      const movedNode = grid[row][col];

      if (type === 'start') {
        START_NODE_ROW = row;
        START_NODE_COL = col;
      } else {
        END_NODE_ROW = row;
        END_NODE_COL = col;
      }

      this.activeDrag.lastKey = key;
      return { grid, dragging: [true, { type }, movedNode] };
    }, this.refreshSolver);
  }

  getWallDragLinePoints(fromKey, toRow, toCol) {
    const from = parseSandboxNodeKey(fromKey);
    if (
      !Number.isFinite(from.row) ||
      !Number.isFinite(from.col) ||
      (from.row === toRow && from.col === toCol)
    ) {
      return [{ row: toRow, col: toCol }];
    }

    const points = [];
    let currentRow = from.row;
    let currentCol = from.col;
    const rowStep = currentRow < toRow ? 1 : -1;
    const colStep = currentCol < toCol ? 1 : -1;
    const rowDelta = Math.abs(toRow - currentRow);
    const colDelta = Math.abs(toCol - currentCol);
    let error = rowDelta - colDelta;

    while (currentRow !== toRow || currentCol !== toCol) {
      const doubleError = error * 2;

      if (doubleError > -colDelta) {
        error -= colDelta;
        currentRow += rowStep;
      }

      if (doubleError < rowDelta) {
        error += rowDelta;
        currentCol += colStep;
      }

      points.push({ row: currentRow, col: currentCol });
    }

    return points;
  }

  dragStart(row, col, event) {
    if (event && event.button !== 0) return;
    if (event) event.preventDefault();

    const node = this.state.grid[row]?.[col];
    if (!node) return;

    const isTerminalDrag = node.isStart || node.isEnd;
    const shouldRespectAnimationReset = !isTerminalDrag && !getToggleWallOnClick();

    if (!this.prepareGridInteraction(row, col, !shouldRespectAnimationReset)) {
      return;
    }

    if (isTerminalDrag) {
      this.beginTerminalDrag(node);
      return;
    }

    this.beginWallDrag(row, col);
  }

  dragNode(row, col, event) {
    if (event && event.buttons !== 1) {
      this.dragStop();
      return;
    }

    if (!this.isGridInteractionEnabled()) {
      return;
    }

    if (this.isSolverOnlyNode(row, col)) {
      if (
        this.activeDrag?.kind === 'wall' &&
        this.activeDrag.action === 'add'
      ) {
        const key = getSandboxNodeKey(row, col);
        if (this.activeDrag.lastKey !== key) {
          this.activeDrag.lastKey = key;
          this.materializeSolverWall(row, col);
        }
      }
      return;
    }

    if (
      this.activeDrag?.kind === 'wall' &&
      this.activeDrag.action === 'remove' &&
      this.isMaterializedSolverWall(row, col)
    ) {
      const key = getSandboxNodeKey(row, col);
      if (this.activeDrag.lastKey !== key) {
        this.activeDrag.lastKey = key;
        this.removeMaterializedSolverWall(row, col);
      }
      return;
    }

    if (this.activeDrag?.kind === 'terminal') {
      this.moveTerminalDrag(row, col);
      return;
    }

    if (this.activeDrag?.kind === 'wall') {
      const key = getSandboxNodeKey(row, col);
      if (this.activeDrag.lastKey === key) return;
      const points = this.getWallDragLinePoints(
        this.activeDrag.lastKey,
        row,
        col
      );
      this.activeDrag.lastKey = key;
      points.forEach((point) => {
        this.applyWallAt(
          point.row,
          point.col,
          this.activeDrag.mode,
          this.activeDrag.action,
          { batched: true }
        );
      });
    }
  }

  handleGridDragMove = (event) => {
    if (this.activeDrag?.kind !== 'wall') return;
    if (event.buttons !== 1) {
      this.dragStop();
      return;
    }

    const nodeElement = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest('[id^="node-"]');
    const match = nodeElement?.id.match(/^node-(\d+)-(\d+)$/);
    if (!match) return;

    this.dragNode(Number(match[1]), Number(match[2]), event);
  };

  dragStop() {
    const wasWallDrag = this.activeDrag?.kind === 'wall';

    if (
      !this.activeDrag &&
      !this.state.dragging[0] &&
      !this.state.draggingWall
    ) {
      return;
    }

    this.activeDrag = null;
    this.draggingWallMode = null;

    const finishDrag = () => {
      this.setState(
        {
          dragging: [false, null, null],
          draggingWall: false,
        },
        this.refreshSolver
      );
    };

    if (wasWallDrag) {
      this.flushWallDragRender(finishDrag);
      return;
    }

    this.setState(
      {
        dragging: [false, null, null],
        draggingWall: false,
      },
      this.refreshSolver
    );
  }

  toggleWall(row, col, isWall, unWallable, isPermanentWall) {
    if (this.suppressNextNodeClick) {
      this.suppressNextNodeClick = false;
      return;
    }

    if (this.isSolverOnlyNode(row, col) || !this.isGridInteractionEnabled()) {
      return;
    }

    if (!getHasGridBeenReset() && !getToggleWallOnClick()) {
      resetAllNodes(this.state.grid);
      setHasGridBeenReset(true);
      return;
    }

    resetAllNodes(this.state.grid);
    setHasGridBeenReset(true);

    if (unWallable) return;

    const mode = permanentWallToggled ? 'permanent' : 'wall';
    const action =
      mode === 'permanent'
        ? isPermanentWall
          ? 'remove'
          : 'add'
        : isWall
          ? 'remove'
          : 'add';

    this.applyWallAt(row, col, mode, action);
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
    if (node) {
      if (node.classList.contains(`node-clickable-toggled`))
        document.getElementById(`node-clickable`).className = `node-clickable`;
      else
        document.getElementById(
          `node-clickable`
        ).className = `node-clickable node-clickable-toggled`;
    }
    this.refreshSettings();
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

  userLevelButtonClicked(id) {
    if (!this.state.renamingUserLevel) {
      this.loadUserGrid(Number(id));
    }
  }

  deleteUserLevel(id) {
    this.setState({ levelClicked: -1 });
    this.setState({ renamingUserLevel: false });
    this.setState({ renamingUserLevelId: null });
    this.setState({ lastAddedUserLevel: '' });
    this.setState({ defaultUserLevelInput: '' });
    this.setState({ saveLevelInputStatus: 'default' });
    deleteUserLevel(id);
  }

  renameUserLevel(id, name) {
    //  If the id is false, then the user has clicked the rename button. If the name is false, then the user has clicked the svg.
    if (name === false) {
      const userLevel = getSpecificUserLevel(id);
      this.setState({
        renamingUserLevel: true,
        renamingUserLevelId: id,
        levelClicked: id,
        defaultUserLevelInput: userLevel?.[0] || '',
        saveLevelInputStatus: 'default',
      });
    } else {
      if (this.checkLevelInput(name)) {
        const targetId =
          id !== null && id !== undefined ? id : this.state.renamingUserLevelId;
        renameUserLevel(targetId, name);
        this.setState({ renamingUserLevel: false });
        this.setState({ renamingUserLevelId: null });
        this.setState({ lastAddedUserLevel: '' });
        this.setState({ defaultUserLevelInput: '' });
        this.setState({ saveLevelInputStatus: 'default' });
        this.setState({ levelClicked: -1 });
      }
    }
  }

  syncTerminalCoordinatesFromGrid(grid) {
    let startNode = null;
    let endNode = null;

    grid.forEach((gridRow) => {
      gridRow.forEach((node) => {
        if (node.isStart) startNode = node;
        if (node.isEnd) endNode = node;
      });
    });

    if (startNode) {
      START_NODE_ROW = startNode.row;
      START_NODE_COL = startNode.col;
    }

    if (endNode) {
      END_NODE_ROW = endNode.row;
      END_NODE_COL = endNode.col;
    }
  }

  loadUserGrid(id) {
    this.cancelPendingSolverRun();
    resetAllNodes(this.state.grid);
    setHasGridBeenReset(true);

    const userLevel = getSpecificUserLevel(id);
    const savedSettings = getSavedSandboxSettings(userLevel);
    const savedGrid = userLevel[1];

    setShowSandboxWallUsage(savedSettings.displayWallUsage);
    setSandboxWallLimit(
      savedSettings.wallLimit,
      this.getWallableNodeCount(savedGrid),
      this.getSandboxWallUsageCount(savedGrid)
    );
    if (savedSettings.endDistance !== null) {
      setCurrentEndDistance(savedSettings.endDistance, this.getMaxEndDistance());
    }

    this.setState({ grid: savedGrid });
    this.setState({ levelClicked: -1 });
    this.setState({ renamingUserLevel: false });
    this.setState({ lastAddedUserLevel: '' });
    this.setState({ defaultUserLevelInput: '' });
    this.setState({ saveLevelInputStatus: 'default' });
    this.setState({ showOptionsMenu: false });
    setVisualizerPaused(false);
    this.setState({
      solverOverlayEnabled: false,
      showSolverSolutionsMenu: false,
      solverResult: null,
      solverProgress: null,
      solverResultStale: false,
      solverOverlayHidden: false,
      solverPanelClosed: false,
      selectedSolverSolutionIndex: 0,
    });

    START_NODE_ROW = userLevel[2][0][0];
    START_NODE_COL = userLevel[2][0][1];
    END_NODE_ROW = userLevel[2][1][0];
    END_NODE_COL = userLevel[2][1][1];
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
          <span className="user-level-row">
            <span className="user-level-index">{i + 1}.</span>
            <span className="user-level-name">{levelName}</span>

            {!this.state.renamingUserLevel ? (
              <span className="user-level-actions">
                  <span
                    className="user-level-action"
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      this.deleteUserLevel(i);
                    }}
                  >
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

                  <span
                    className="user-level-action"
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      this.renameUserLevel(i, false);
                    }}
                  >
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
                </span>
              ) : null}
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
      this.setState({
        defaultUserLevelInput: 'ERROR: INVALID INPUT',
        saveLevelInputStatus: 'error',
      });

      // Change the box style/value default after a set amount of time
      this.setManagedTimeout(() => {
        if (this.state.saveLevelInputStatus === 'error') {
          this.setState({
            defaultUserLevelInput: '',
            saveLevelInputStatus: 'default',
          });
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
      saveLevelInputStatus: 'default',
    });
  };

  getFilteredLoadLevelOptions() {
    const query = this.state.loadLevelSearch.trim().toLowerCase();
    const options = getLoadLevelOptions();

    if (!query) return options;

    return options.filter((option) => {
      return (
        option.value.toLowerCase().includes(query) ||
        option.label.toLowerCase().includes(query) ||
        option.type.toLowerCase().includes(query)
      );
    });
  }

  showLoadLevelDropdown = () => {
    this.setState({
      showLoadLevelDropdown: true,
      loadLevelSearch: this.state.loadLevelInputValue,
    });
  };

  updateLoadLevelInput = (event) => {
    this.setState({
      loadLevelInputValue: event.target.value,
      loadLevelSearch: event.target.value,
      showLoadLevelDropdown: true,
    });
  };

  updateLoadLevelSearch = (event) => {
    this.setState({ loadLevelSearch: event.target.value });
  };

  selectLoadLevelOption = (value) => {
    this.setState({
      loadLevelInputValue: value,
      loadLevelSearch: '',
      showLoadLevelDropdown: false,
    }, () => this.loadTestGrid(value));
  };

  handleLoadLevelInputKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this.loadTestGrid(this.state.loadLevelInputValue);
  };

  refreshSettings = () => {
    this.setState(({ settingsRefresh }) => ({
      settingsRefresh: settingsRefresh + 1,
    }));
  };

  toggleSandboxNodeNumbers = () => {
    setShowSandboxNodeNumbers(!getShowSandboxNodeNumbers());
    this.refreshSettings();
  };

  toggleCampaignMissileTrail = () => {
    setUseCampaignMissileTrailInSandbox(!getUseCampaignMissileTrailInSandbox());
    this.refreshSettings();
  };

  toggleSandboxEndExplosion = () => {
    setSandboxEndExplosionToggled(!getSandboxEndExplosionToggled());
    this.refreshSettings();
  };

  updateMissileTrailLength = (event) => {
    if (!getUseCampaignMissileTrailInSandbox()) return;
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

  toggleSandboxWallUsage = () => {
    const nextShowWallUsage = !getShowSandboxWallUsage();
    setShowSandboxWallUsage(nextShowWallUsage);
    if (!nextShowWallUsage) {
      this.cancelPendingSolverRun();
      this.setState({
        solverOverlayEnabled: false,
        solverResult: null,
        solverProgress: null,
        solverResultStale: false,
        solverOverlayHidden: false,
        solverPanelClosed: false,
        solverStatus: 'idle',
        showSolverSolutionsMenu: false,
        selectedSolverSolutionIndex: 0,
      });
    }
    this.refreshSettings();
  };

  updateSandboxWallLimit = (event) => {
    this.applySandboxWallLimitValue(event.target.value);
  };

  updateSandboxEndDistance = (event) => {
    this.applySandboxEndDistanceValue(event.target.value);
  };

  refreshSolver = () => {
    this.setState(({ solverRefresh = 0 }) => ({
      solverRefresh: solverRefresh + 1,
    }));
  };

  toggleSolverOverlay = () => {
    const nextSolverOverlayEnabled = !this.state.solverOverlayEnabled;
    if (!nextSolverOverlayEnabled) this.cancelPendingSolverRun();

    setVisualizerPaused(false);
    this.setState({
      solverOverlayEnabled: nextSolverOverlayEnabled,
      solverResult: null,
      solverProgress: null,
      solverResultStale: false,
      solverOverlayHidden: false,
      solverPanelClosed: false,
      solverStatus: 'idle',
      selectedSolverSolutionIndex: 0,
      showSolverSolutionsMenu: false,
      showOptionsMenu: false,
    }, () => {
      this.lastSolverInputSignature = this.getSolverInputSignature();
    });
  };

  toggleSolverSolutionsMenu = () => {
    this.setState(
      ({ showSolverSolutionsMenu, showOptionsMenu }) => {
        const nextShowSolverSolutionsMenu = !showSolverSolutionsMenu;
        return {
          showSolverSolutionsMenu: nextShowSolverSolutionsMenu,
          showOptionsMenu: nextShowSolverSolutionsMenu ? false : showOptionsMenu,
        };
      },
      () => {
        setVisualizerPaused(this.state.showOptionsMenu);
      }
    );
  };

  selectSolverSolution = (index) => {
    this.setState({ selectedSolverSolutionIndex: index });
  };

  getUnappliedSolutionWallCount(solution = this.getSelectedSolverSolution()) {
    if (!solution) return 0;

    return solution.wallKeys.filter((key) => {
      const { row, col } = parseSandboxNodeKey(key);
      const node = this.state.grid[row]?.[col];
      return (
        node &&
        !node.isStart &&
        !node.isEnd &&
        !node.isWall &&
        !node.isPermanentWall
      );
    }).length;
  }

  canImplementSelectedSolverSolution() {
    const selectedSolution = this.getSelectedSolverSolution();
    if (!selectedSolution) return false;
    if (this.state.solverResultStale) return false;
    if (!getShowSandboxWallUsage() || getSandboxWallLimit() <= 0) return true;

    return selectedSolution.wallKeys.length <= getSandboxWallLimit();
  }

  implementSelectedSolverSolution = () => {
    const selectedSolution = this.getSelectedSolverSolution();
    if (
      !selectedSolution ||
      !this.canImplementSelectedSolverSolution()
    ) {
      return;
    }

    this.suppressNextSolverInvalidation = true;
    const implementedSolverWallKeys = new Set();
    this.setState((prevState) => {
      const solutionWallKeys = new Set(selectedSolution.wallKeys);
      let implementedWallCount = 0;
      let hasChanges = false;
      const grid = prevState.grid.map((gridRow) =>
        gridRow.map((node) => {
          const key = getSandboxNodeKey(node.row, node.col);
          if (
            node.isStart ||
            node.isEnd ||
            node.isPermanentWall ||
            node.isRandomWall
          ) {
            return node;
          }

          const shouldBeSolutionWall = solutionWallKeys.has(key);
          if (shouldBeSolutionWall) {
            implementedWallCount++;
            implementedSolverWallKeys.add(key);
          }

          if (node.isWall === shouldBeSolutionWall) return node;

          hasChanges = true;
          return {
            ...node,
            isWall: shouldBeSolutionWall,
            isPermanentWall: false,
            isRandomWall: false,
          };
        })
      );

      if (
        getShowSandboxWallUsage() &&
        getSandboxWallLimit() > 0 &&
        implementedWallCount > getSandboxWallLimit()
      ) {
        return null;
      }

      if (!hasChanges) return null;

      return { grid };
    }, () => {
      this.materializedSolverWallKeys = implementedSolverWallKeys;
      this.suppressNextSolverInvalidation = false;
      this.lastSolverInputSignature = this.getSolverInputSignature();
      this.refreshSettings();
    });
  };

  getOptionsMenu() {
    let currentPermanentWallClass = null;

    if (permanentWallToggled)
      currentPermanentWallClass = 'node-clickable-toggled';
    else currentPermanentWallClass = 'node-clickable';

    function addUserLevel(saveLevelInput) {
      let userLevel = [
        saveLevelInput,
        this.state.grid,
        [
          [START_NODE_ROW, START_NODE_COL],
          [END_NODE_ROW, END_NODE_COL],
        ],
        {
          schemaVersion: 2,
          settings: {
            wallLimit: getSandboxWallLimit(),
            endDistance: getActualCurrentEndDistance(),
            displayWallUsage: getShowSandboxWallUsage(),
          },
        },
      ];

      if (this.checkLevelInput(saveLevelInput)) {
        saveUserLevels(userLevel);
        changeColorSuccess.call(this, saveLevelInput);
      }
    }

    function changeColorSuccess(savedName) {
      this.setState({
        defaultUserLevelInput: 'LEVEL SAVED!',
        lastAddedUserLevel: savedName,
        saveLevelInputStatus: 'success',
      });
    }

    // Changes the color of the input box text to the default colour (from red), if the user clicks the box before it changes automatically
    function changeColor() {
      if (this.state.saveLevelInputStatus === 'error') {
        this.setState({ defaultUserLevelInput: '' });
      } else if (this.state.saveLevelInputStatus === 'success') {
        this.setState({ defaultUserLevelInput: this.state.lastAddedUserLevel });
      }
      this.setState({ saveLevelInputStatus: 'default' });
    }

    const filteredLoadLevelOptions = this.getFilteredLoadLevelOptions();
    const showWallLimit = getShowSandboxWallUsage();
    const showSolverControls =
      showWallLimit &&
      getSandboxWallLimit() > 0 &&
      getActualCurrentEndDistance() > 0;
    const sandboxMissileTrailEnabled = getUseCampaignMissileTrailInSandbox();
    const campaignLevelSettingsEnabled =
      this.areCampaignLevelSandboxSettingsEnabled();
    const canSaveCurrentLevel =
      this.state.defaultUserLevelInput !== '' &&
      this.state.saveLevelInputStatus === 'default' &&
      !this.state.renamingUserLevel &&
      this.state.levelClicked === -1;
    const saveInputLabel = this.state.renamingUserLevel
      ? `Rename Level ${Number(this.state.renamingUserLevelId) + 1}`
      : 'Save Current Grid';
    const userLevelCount = getUserLevelsFromLocalStorage().length;
    const userLevelListHeight =
      userLevelCount === 0
        ? 72
        : Math.min(220, Math.max(54, userLevelCount * 44 + 20));

    return (
      <>
        <div
          className="visualizer-modal-backdrop"
        ></div>
        <div className="visualizer-modal-shell visualizer-options-shell">
          <div className="visualizer-modal-header">
            <p className="visualizer-modal-title">
              Settings
            </p>
          </div>

          <div className="visualizer-modal-body">
            <div className="visualizer-options-grid sandbox-settings-grid">
              <section className="visualizer-settings-section">
                <div className="visualizer-section-header">Grid Display</div>
                <div className="visualizer-section-controls">
                  <div className="toggle-grid-holder text-info">
                    Grid Outline
                    <div>
                      <NodeToggleGrid
                        currentState={isGridOutlineToggled()}
                        onClick={() => this.toggleGrid()}
                      ></NodeToggleGrid>
                    </div>
                  </div>

                  <div className="visualizer-option-row text-info">
                    <span>Show Node Numbers</span>
                    <button
                      type="button"
                      className={`visualizer-option-toggle ${
                        getShowSandboxNodeNumbers() ? 'is-active' : ''
                      }`}
                      onClick={this.toggleSandboxNodeNumbers}
                    >
                      {getShowSandboxNodeNumbers() ? 'On' : 'Off'}
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
                <div className="visualizer-section-header">Wall Behaviour</div>
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

                  <div className="toggle-permanent-holder text-info">
                    Permanent Wall Mode
                    <div>
                      <NodeChangeWallType
                        currentState={currentPermanentWallClass}
                        onClick={() => this.toggleBetweenWallType()}
                      ></NodeChangeWallType>
                    </div>
                  </div>
                </div>
              </section>

              <section className="visualizer-settings-section">
                <div className="visualizer-section-header">Animation</div>
                <div className="visualizer-section-controls">
                  <div className="visualizer-option-row text-info">
                    <span>Missile Trail</span>
                    <button
                      type="button"
                      className={`visualizer-option-toggle ${
                        sandboxMissileTrailEnabled ? 'is-active' : ''
                      }`}
                      onClick={this.toggleCampaignMissileTrail}
                    >
                      {sandboxMissileTrailEnabled ? 'On' : 'Off'}
                    </button>
                  </div>
                  <div className="visualizer-option-row text-info">
                    <span>End Node Explosion</span>
                    <button
                      type="button"
                      className={`visualizer-option-toggle ${
                        getSandboxEndExplosionToggled() ? 'is-active' : ''
                      }`}
                      onClick={this.toggleSandboxEndExplosion}
                    >
                      {getSandboxEndExplosionToggled() ? 'On' : 'Off'}
                    </button>
                  </div>
                  <label
                    className={`visualizer-option-row text-info ${
                      !sandboxMissileTrailEnabled ? 'is-disabled' : ''
                    }`}
                  >
                    <span>Missile Trail Length</span>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={getMissileTrailLength()}
                      onChange={this.updateMissileTrailLength}
                      onKeyDown={this.preventInvalidIntegerKey}
                      disabled={!sandboxMissileTrailEnabled}
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

              <section className="visualizer-settings-section visualizer-settings-section-wide optionsMenuDevelopment">
                <div className="visualizer-section-header">Development Options</div>
                <div className="visualizer-dev-grid">
                  <div className="visualizer-settings-group">
                    <p className="visualizer-group-title">Load Custom Grid</p>
                    <div
                      className="sandbox-load-picker"
                      ref={this.loadLevelPickerRef}
                    >
                      <label className="sandbox-field-label" htmlFor="loadLevelInput">
                        Saved grids and campaign levels
                      </label>
                      <input
                        type="text"
                        id="loadLevelInput"
                        className="usernameInput visualizer-small-input sandbox-load-input sandbox-load-combobox"
                        maxLength={32}
                        spellCheck="false"
                        placeholder="Select or search a campaign level or template"
                        value={this.state.loadLevelInputValue}
                        onClick={this.showLoadLevelDropdown}
                        onFocus={this.showLoadLevelDropdown}
                        onChange={this.updateLoadLevelInput}
                        onKeyDown={this.handleLoadLevelInputKeyDown}
                        autoComplete="off"
                      />
                      {this.state.showLoadLevelDropdown ? (
                        <div className="sandbox-load-dropdown">
                          <input
                            type="search"
                            className="usernameInput sandbox-load-search"
                            value={this.state.loadLevelSearch}
                            onChange={this.updateLoadLevelSearch}
                            placeholder="Search levels"
                            spellCheck="false"
                            autoComplete="off"
                          />
                          <div className="sandbox-load-option-list">
                            {filteredLoadLevelOptions.length > 0 ? (
                              filteredLoadLevelOptions.map((option) => (
                                <button
                                  type="button"
                                  className="sandbox-load-option"
                                  key={`${option.type}-${option.value}`}
                                  onClick={() =>
                                    this.selectLoadLevelOption(option.value)
                                  }
                                >
                                  <span>{option.label}</span>
                                  <span>{option.type}</span>
                                </button>
                              ))
                            ) : (
                              <p className="sandbox-load-empty">No matches</p>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="visualizer-settings-group">
                    <p className="visualizer-group-title">Presets & Reset</p>
                    <div className="visualizer-option-row text-info">
                      <span>Campaign Level Settings</span>
                      <button
                        type="button"
                        className={`visualizer-option-toggle ${
                          campaignLevelSettingsEnabled ? 'is-active' : ''
                        }`}
                        onClick={this.toggleCampaignLevelSandboxSettings}
                      >
                        {campaignLevelSettingsEnabled ? 'On' : 'Off'}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="standard-button-options"
                      onClick={this.resetSandboxSettings}
                    >
                      Reset Settings
                    </button>
                  </div>

                  <div className="visualizer-settings-group">
                    <p className="visualizer-group-title">Wall Limit & Solver</p>
                    <div className="visualizer-option-row text-info">
                      <span>Show Wall Counter</span>
                      <button
                        type="button"
                        className={`visualizer-option-toggle ${
                          getShowSandboxWallUsage() ? 'is-active' : ''
                        }`}
                        onClick={this.toggleSandboxWallUsage}
                      >
                        {getShowSandboxWallUsage() ? 'On' : 'Off'}
                      </button>
                    </div>
                    {showWallLimit ? (
                      <>
                        <label className="visualizer-option-row text-info">
                          <span>Wall Limit</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={this.getSandboxWallUsageCount()}
                            max={this.getWallableNodeCount()}
                            value={
                              this.state.sandboxWallLimitDraft ??
                              String(getSandboxWallLimit())
                            }
                            onFocus={this.startSandboxWallLimitDraft}
                            onChange={this.updateSandboxWallLimitDraft}
                            onBlur={this.commitSandboxWallLimitDraft}
                            onKeyDown={this.handleSandboxWallLimitKeyDown}
                            className="visualizer-number-input"
                          />
                        </label>
                      </>
                    ) : null}
                    {showSolverControls ? (
                      <div className="visualizer-option-row text-info sandbox-dev-control">
                        <span>Solver Overlay</span>
                        <button
                          type="button"
                          className={`visualizer-option-toggle ${
                            this.state.solverOverlayEnabled ? 'is-active' : ''
                          }`}
                          onClick={this.toggleSolverOverlay}
                        >
                          {this.state.solverOverlayEnabled ? 'On' : 'Off'}
                        </button>
                      </div>
                    ) : null}
                    {this.state.solverOverlayEnabled &&
                    this.state.solverResult?.solutions?.length > 1 ? (
                      <button
                        type="button"
                        className="standard-button-options sandbox-view-solutions-button"
                        onClick={this.toggleSolverSolutionsMenu}
                      >
                      View Solutions
                    </button>
                  ) : null}
                </div>

                  <div className="visualizer-settings-group">
                    <p className="visualizer-group-title">End Distance</p>
                    <label className="visualizer-option-row text-info">
                      <span>Self-Destruct Distance</span>
                      <input
                        type="text"
                        id="endDistanceInput"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="1"
                        max={this.getMaxEndDistance()}
                        value={
                          this.state.sandboxEndDistanceDraft ??
                          String(getActualCurrentEndDistance())
                        }
                        onFocus={this.startSandboxEndDistanceDraft}
                        onChange={this.updateSandboxEndDistanceDraft}
                        onBlur={this.commitSandboxEndDistanceDraft}
                        onKeyDown={this.handleSandboxEndDistanceKeyDown}
                        className="visualizer-number-input"
                      />
                    </label>
                  </div>

                  <div className="visualizer-settings-group">
                    <p className="visualizer-group-title">Grid Cleanup</p>
                    <button
                      type="button"
                      className="standard-button-options"
                      onClick={() => this.removeNormalWalls()}
                    >
                      Remove Normal Walls
                    </button>
                    <button
                      type="button"
                      className="standard-button-options"
                      onClick={() => this.removePermanentWalls()}
                    >
                      Remove Permanent Walls
                    </button>
                  </div>

                  <div className="visualizer-settings-group sandbox-user-level-group">
                    <p className="visualizer-group-title">User Levels</p>
                    <ScrollableBox
                      height={userLevelListHeight}
                      className="sandbox-user-level-scroll"
                    >
                      {this.getUserLevelButtons()}
                    </ScrollableBox>

                    {this.state.levelClicked === -1 ||
                    this.state.renamingUserLevel ? (
                      <div className="sandbox-save-grid-panel">
                        <label className="sandbox-save-level-field">
                    <p
                      id="saveCurrentGridText"
                      className="endDistanceOptions save-current-grid-text"
                    >
                            {saveInputLabel}
                    </p>

                    <input
                      type="text"
                      id="saveLevelInput"
                      className="usernameInput save-level-input"
                      maxLength={250}
                      spellCheck="false"
                            value={this.state.defaultUserLevelInput}
                      onClick={() => {
                        changeColor.call(this);
                      }}
                      onChange={this.handleInputChange}
                            data-status={this.state.saveLevelInputStatus}
                    ></input>
                        </label>

                        {canSaveCurrentLevel ? (
                          <button
                            className="standard-button-options saveUserGridButton"
                            onClick={() =>
                              addUserLevel.call(
                                this,
                                this.state.defaultUserLevelInput
                              )
                            }
                          >
                            Save Grid
                          </button>
                        ) : null}
                        {this.state.renamingUserLevel ? (
                          <button
                            className="standard-button-options saveUserGridButton"
                            onClick={() =>
                              this.renameUserLevel(
                                this.state.renamingUserLevelId,
                                this.state.defaultUserLevelInput
                              )
                            }
                          >
                            Rename Level
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            </div>

            <div className="visualizer-modal-footer">
              <button
                className="optionsMenuButton"
                onClick={() => {
                  this.saveOptions();
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

  saveOptions() {
    if (this.state.sandboxWallLimitDraft !== null) {
      this.applySandboxWallLimitValue(this.state.sandboxWallLimitDraft);
    }
    if (this.state.sandboxEndDistanceDraft !== null) {
      this.applySandboxEndDistanceValue(this.state.sandboxEndDistanceDraft);
    }
    this.setState({
      sandboxWallLimitDraft: null,
      sandboxEndDistanceDraft: null,
    });
    this.toggleOptionsMenu();
  }

  // This function is purely for testing the grid templates
  loadTestGrid(value = this.state.loadLevelInputValue) {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      // If the value of loadLevelInput is not between 1 and 15 (or is not a special grid template), then nothing will happen. If it is, then the grid will be loaded with the corresponding grid template
      const loadLevelInput = String(value).trim();
      const levelNumber = Number(loadLevelInput);
      this.setState({ showLoadLevelDropdown: false });

      if (
        Number.isInteger(levelNumber) &&
        levelNumber >= 1 &&
        levelNumber <= numLevels
      ) {
        this.cancelPendingSolverRun();
        this.removeAllWalls(); // removes all existing walls

        const level = getLevelData(levelNumber);
        const levelGrid = cloneVariable(level.grid);
        this.applyCampaignLevelSandboxSettings(level, levelGrid);

        this.setState({
          grid: levelGrid,
          solverResult: null,
          solverProgress: null,
          solverResultStale: false,
          solverOverlayHidden: false,
          solverPanelClosed: false,
          solverStatus: 'idle',
          selectedSolverSolutionIndex: 0,
          showSolverSolutionsMenu: false,
        });

        // Change the coordinates of the start and end nodes
        START_NODE_ROW = level.startNodeCoords[1];
        START_NODE_COL = level.startNodeCoords[0];
        END_NODE_ROW = level.endNodeCoords[1];
        END_NODE_COL = level.endNodeCoords[0];
      } else {
        const templateGrid = getTemplateGrid(loadLevelInput);

        if (templateGrid) {
          this.cancelPendingSolverRun();
          this.removeAllWalls(); // removes all existing walls
          this.syncTerminalCoordinatesFromGrid(templateGrid);
          this.setState({
            grid: templateGrid,
            solverResult: null,
            solverProgress: null,
            solverResultStale: false,
            solverOverlayHidden: false,
            solverPanelClosed: false,
            solverStatus: 'idle',
            selectedSolverSolutionIndex: 0,
            showSolverSolutionsMenu: false,
          });
        }
      }
    }
  }

  // This function removes every wall on the grid
  removeNormalWalls() {
    this.setState((prevState) => ({
      grid: prevState.grid.map((gridRow) =>
        gridRow.map((node) =>
          node.isWall && !node.isPermanentWall
            ? {
                ...node,
                isWall: false,
                isPermanentWall: false,
                isRandomWall: false,
              }
            : node
        )
      ),
    }), this.refreshSolver);
  }

  removePermanentWalls() {
    this.setState((prevState) => ({
      grid: prevState.grid.map((gridRow) =>
        gridRow.map((node) =>
          node.isPermanentWall
            ? {
                ...node,
                isWall: false,
                isPermanentWall: false,
                isRandomWall: false,
              }
            : node
        )
      ),
    }), this.refreshSolver);
  }

  removeAllWalls() {
    const grid = initialiseGrid();
    this.setState({ grid }, this.refreshSolver);
  }

  getSolverSolutionsMenu() {
    const solutions = this.state.solverResult?.solutions || [];
    if (!this.state.showSolverSolutionsMenu || solutions.length <= 1) return null;
    const menuSize = this.getSolutionsMenuSize();
    const menuPosition = this.state.solverSolutionsMenuPosition;
    const selectedSolution = this.getSelectedSolverSolution();
    const canImplementSolution = this.canImplementSelectedSolverSolution();
    const menuStyle = {
      width: `${menuSize.width}px`,
      height: `${menuSize.height}px`,
    };

    if (menuPosition) {
      menuStyle.left = `${menuPosition.x}px`;
      menuStyle.top = `${menuPosition.y}px`;
      menuStyle.right = 'auto';
    }

    return (
      <div
        className={`sandbox-solver-solutions-menu ${
          menuPosition ? 'is-positioned' : ''
        }`}
        style={menuStyle}
        ref={this.solverSolutionsMenuRef}
      >
        <div
          className="sandbox-solver-solutions-header"
          onMouseDown={this.startSolverSolutionsMenuDrag}
        >
          <span>Safe Path Solutions</span>
          <span className="sandbox-solver-solutions-actions">
            <button
              type="button"
              className={`sandbox-solver-button ${
                this.state.showSolverSolutionPreviews ? 'is-active' : ''
              }`}
              onClick={this.toggleSolverSolutionPreviews}
            >
              Previews
            </button>
            {selectedSolution ? (
              <button
                type="button"
                className="sandbox-solver-button"
                onClick={this.implementSelectedSolverSolution}
                disabled={!canImplementSolution}
              >
                Implement Solution
              </button>
            ) : null}
            <button
              type="button"
              className="optionsMenuButton sandbox-solver-close-button"
              onClick={this.toggleSolverSolutionsMenu}
            >
              Close
            </button>
          </span>
        </div>
        <ScrollableBox className="sandbox-solution-list">
          {solutions.map((solution, index) => (
            <div
              key={solution.id}
              className={`sandbox-solution-card ${
                index === this.state.selectedSolverSolutionIndex
                  ? 'is-active'
                  : ''
              }`}
            >
              <button
                type="button"
                className="sandbox-solution-button"
                onClick={() => this.selectSolverSolution(index)}
              >
                <span className="sandbox-solution-index">{index + 1}.</span>
                <span className="sandbox-solution-copy">
                  <span>{solution.label}</span>
                  <span>{solution.detail}</span>
                </span>
              </button>
              {this.state.showSolverSolutionPreviews ? (
                <span className="sandbox-solution-preview">
                  <MiniGridPreview
                    grid={this.state.grid}
                    highlightWallKeys={solution.wallKeys}
                    ariaLabel={`${solution.label} preview`}
                  />
                </span>
              ) : null}
            </div>
          ))}
        </ScrollableBox>
        <span
          className="sandbox-solutions-resize-handle"
          onMouseDown={this.startSolverSolutionsMenuResize}
          aria-hidden="true"
        />
      </div>
    );
  }

  render() {
    const { grid } = this.state;
    const paletteVariables = getGridPaletteCssVariables();
    const solverWallKeys = this.getSelectedSolverWallKeys();
    const solverHeaderMessage = this.getSandboxSolverHeaderMessage();

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
        className={`visualize-screen visualize-sandbox-screen ${
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

        {plane}
        <div className="topButtonsContainerOutline"></div>
        <div className="topButtonsContainer">
          <div className="topbar-section topbar-left">
            <button
              className="standard-button topbar-control random-walls-button"
              onClick={() => this.startToAnimatePlane()} // add random walls to the grid and animate plane
            >
              Random Walls
            </button>

            {permanentWallToggled ? (
              <button
                type="button"
                className="standard-button topbar-control permanent-wall-topbar-toggle"
                onClick={() => this.toggleBetweenWallType()}
              >
                Permanent Walls: On
              </button>
            ) : null}

            {this.getHeaderWallUsageControl()}
            {this.getHeaderEndDistanceControl()}
            {this.getHeaderSolverRunControl()}
            {this.getHeaderSolverOverlayControls()}

            {solverHeaderMessage ? (
              <p
                className={`topbar-message sandbox-dev-message ${
                  this.isSandboxSolverRunning()
                    ? 'is-pending'
                    : this.state.solverResultStale
                    ? 'is-stale'
                    : this.state.solverResult?.solutions?.length > 0
                    ? 'is-success'
                    : this.state.solverResult
                      ? 'is-error'
                      : ''
                }`}
              >
                {solverHeaderMessage}
              </p>
            ) : null}
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

        {this.getSandboxSolverPanel()}
        {this.getSolverSolutionsMenu()}

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
                      distance,
                      isEnd,
                      isStart,
                      isWall,
                      isPermanentWall,
                      isRandomWall,
                    } = node;
                    let unWallable = isEnd || isStart; // checks to see if the node is an End or start node
                    const nodeKey = getSandboxNodeKey(row, col);
                    const isSolverWall = solverWallKeys.has(nodeKey);
                    const isSolverOnlyWall =
                      isSolverWall &&
                      !isWall &&
                      !isPermanentWall &&
                      !isRandomWall;
                    const isMaterializedSolverWall =
                      this.isMaterializedSolverWall(row, col);

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
                        isSolverWall={isSolverOnlyWall}
                        showNodeNumber={getShowSandboxNodeNumbers()}
                        nodeNumber={distance}
                        key={nodeID}
                        onClick={(row, col) => {
                          if (isSolverOnlyWall) {
                            this.materializeSolverWall(row, col);
                            return;
                          }
                          if (isMaterializedSolverWall) {
                            this.removeMaterializedSolverWall(row, col);
                            return;
                          }
                          this.toggleWall(
                            row,
                            col,
                            isWall,
                            unWallable,
                            isPermanentWall
                          );
                        }}
                        onMouseUp={() => this.dragStop()}
                        onMouseDown={(row, col, event) => {
                          if (isSolverOnlyWall || isMaterializedSolverWall) return;
                          this.dragStart(row, col, event);
                        }}
                        onMouseEnter={(row, col, event) => {
                          this.dragNode(row, col, event);
                        }}
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
    isRandomWall: false,
    previousNode: null,
  };
};
