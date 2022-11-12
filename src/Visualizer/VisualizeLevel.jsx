import React, { Component } from 'react';
import { EnterHome } from '../Navigation';
import Node from './Node/Node';
import { cloneVariable, resetAllNodes, startDijkstra } from './Visualizer';
import './VisualizerLevel.css';
import './VisualizerSandbox.css';
import './VisualizerBoth.css';
import {
  currentLevel,
  getCurrentLevelGrid,
  getCurrentLevelID,
  getCurrentLevelLives,
  getCurrentLevelName,
  getCurrentLevelNodeCoords,
  getCurrentLevelRandomWallNumber,
  getCurrentLevelRandomWallPresses,
  getCurrentLevelWallsAllowed,
} from '../currentLevelHandling';
import {
  displayOutlineValue,
  getCurrentTutorialStatus,
  getHasTutorialEnded,
  randomIntFromInterval,
  setDisplayOutlineValue,
  toggleHasShownTutorial,
  toggleHasTutorialEnded,
  togglePlaneAnimation,
} from '../actualLevelHandling';
import {
  gridOutlineToggled,
  toggleGridOutline,
  toggleShowingOptionsMenu,
} from '../optionsHandling.js';
import NodeToggleGrid from './Node/NodeToggleGrid';
import {
  currentDialogueLineNumberEnd,
  getCurrentDialogueStatus,
  getCurrentLevelDialogue,
  getCurrentLevelSpeakerPosition,
  getHasDialogueEnded,
  setHasDialogueEnded,
  setHasShownDialogueMenu,
  toggleDialogueMenu,
} from '../dialogueManager';

// // Placeholders for start node coordinates. It gets the current level data
let START_NODE_ROW;
let START_NODE_COL;

let END_NODE_ROW;
let END_NODE_COL;

// Specifies the number of rows and columns
const NUM_ROWS = 26;
const NUM_COLUMNS = 51;

// Specifies the number of walls the player can have active at one time
let NUM_WALLS_TOTAL;
let NUM_WALLS_ACTIVE;

// Wall Presses
let NUM_RANDOM_WALL_PRESSES;
let RANDOM_WALL_NUMBER = getCurrentLevelRandomWallNumber();

// Other level constants
let LEVEL_NAME;
let LEVEL_ID;
let LIVES;

// reloads all level data
export function reloadLevelData() {
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
  LIVES = getCurrentLevelLives();
  // 0,1,2,3 star ---
}

export default class levelVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      showOptionsMenu: false,
      showTutorialMenu: false,
      tutorialPage: 1,
      animatingPlane: false,
      showDialogueMenu: false,
      dialogueLineNumber: 0,
    };
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

    // If the Enter button is pressed, run "this.getDialogueMenu(true)" only if the dialogue menu is open and not (dialogueLineNumber === currentDialogueLineNumberEnd - 1)
    if (
      event.key === 'Enter' &&
      this.state.showDialogueMenu &&
      this.state.dialogueLineNumber !== currentDialogueLineNumberEnd - 1
    ) {
      this.getDialogueMenu(true);
    }
  };

  //   Initialises grid
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress, false);
    const grid = getCurrentLevelGrid();
    this.setState({ grid });
  }

  removeAllWalls() {
    let grid = [];
    this.setState({ grid: grid });
    grid = getCurrentLevelGrid();
    this.setState({ grid: grid });
    NUM_WALLS_ACTIVE = 0;
  }

  toggleGrid() {
    toggleGridOutline();

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
        if (displayOutlineValue) {
          nodeElement.classList.remove('nodeOutline');
          nodeElement.classList.add('nodeNoOutline');
        } else {
          nodeElement.classList.remove('nodeNoOutline');
          nodeElement.classList.add('nodeOutline');
        }
      }
    }

    if (displayOutlineValue) {
      setDisplayOutlineValue(false);
    } else {
      setDisplayOutlineValue(true);
    }
  }

  // When a node is clicked, unless it is the start or end node, it gets toggled between a wall and not-wall
  toggleWall(row, col, isWall, unWallable) {
    resetAllNodes(this.state.grid);
    const { grid } = this.state;
    let node = grid[row][col];
    if (!node.isPermanentWall) {
      // Makes sure the target node is not a wall, and max number of active walls hasnt been reached. Will continue if you are turning a wall into a non wall and the active walls is not 0.
      if (
        (!unWallable &&
          NUM_WALLS_ACTIVE < NUM_WALLS_TOTAL &&
          NUM_WALLS_ACTIVE > 0) ||
        (isWall && NUM_WALLS_ACTIVE > 0) ||
        (!isWall && NUM_WALLS_ACTIVE === 0)
      ) {
        // If it isnt a wall currently, increase the number of active walls by one, else decrease them
        if (!unWallable && !isWall) NUM_WALLS_ACTIVE = NUM_WALLS_ACTIVE + 1;
        else if (!unWallable && isWall) NUM_WALLS_ACTIVE = NUM_WALLS_ACTIVE - 1;
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

  // Animate plane and place random walls on the grid
  startToAnimatePlane() {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      if (NUM_RANDOM_WALL_PRESSES > 0) {
        // This function only runs if the animation is not already playing
        if (!this.state.animatingPlane) {
          togglePlaneAnimation();
          NUM_RANDOM_WALL_PRESSES--;
          resetAllNodes(this.state.grid);
          // Set the animation running to true, which prevents further animations from playing
          this.setState({ animatingPlane: true });

          // Changed the display from "none" to "block" so it becomes visible again
          document.getElementById('plane').style.display = 'block';

          // Play "plane_sound_effect.mp3" then stop it after 6.3 seconds
          let audio = new Audio(
            require(`.././assets/Animated/plane_sound_effect.mp3`).default
          );
          audio.play();
          setTimeout(() => {
            audio.pause();
          }, 6300);

          this.setState({ animatingPlane: true });

          // Set the interval of the animation to play every 0.1 seconds. This animation is not the plane moving across the screen, but the animation of the turbines spinning. Animate the turbines of the plane. This is done by changing the source path of the image to each of the 4 animation frames.
          let x = 1;
          const animateTubines = setInterval(() => {
            if (this.state.animatingPlane) {
              document.getElementById('plane').src =
                require(`.././assets/Animated/${x}.png`).default;
              x++;
              if (4 === x) {
                x = 1;
              }
            } else {
              clearInterval(animateTubines);
            }
          }, 100);

          // This is the code to move the plane across the screen. The plane starts from outside of the screen and move by a certain number of pixels each loop. At the very end of the animation, set animating plane variable to false, so the animation can be played again. The animation can only be played again a few seconds after the plane has reached the other side
          for (let i = 1; i < 800; i++) {
            setTimeout(() => {
              document.getElementById('plane').style.left = `${
                -450 + i * 3.4
              }px`;
              if (i === 799) {
                this.setState({ animatingPlane: false });
                togglePlaneAnimation();
              }
            }, 10 * i);
          }

          // getCurrentLevelRandomWallNumber()
          // This is the code to add random walls onto the grid. The grid is properly re-rendered every 45n i to prevent lag and once again at the end of the iternation
          for (let i = 0; i < Number(getCurrentLevelRandomWallNumber()); i++) {
            setTimeout(() => {
              // console.log(RANDOM_WALL_NUMBER);
              let firstColumn =
                (document.getElementById('plane').getBoundingClientRect().x +
                  520) /
                27.5;

              // Generates a random row and column number
              let row = Math.floor(Math.random() * NUM_ROWS);
              let column = randomIntFromInterval(
                Math.floor(firstColumn),
                Math.ceil(firstColumn)
              );

              let node = this.state.grid[row][column]; // selects the node with the row and column specified above
              let { isEnd, isStart, isWall } = node; // finds out the current properties of the randomly selected node
              let unWallable = isEnd || isStart || node.isPermanentWall; // if the node is a start or end node, or permanent, it cannot be changed

              let grid = this.state.grid;
              // Makes sure the target node is not a wall, and max number of active walls hasnt been reached. Will continue if you are turning a wall into a non wall.
              if (!unWallable) {
                const newNode = {
                  ...node,
                  isWall: !isWall,
                };

                // Places the new node into the grid
                grid[row][column] = newNode;
                // Changes the overall state of the grid which re-renders it.
              }
              if (
                i % 45 === 0 ||
                i === Number(getCurrentLevelRandomWallNumber()) - 1
              )
                this.setState({ grid: grid });
            }, i * 10);
          }
          NUM_WALLS_ACTIVE = 10;
        }
      }
    }
  }

  toggleDialogueMenu() {
    this.setState({ showDialogueMenu: !this.state.showDialogueMenu });
  }

  closeDialogueMenu() {
    setHasDialogueEnded(true);
    this.setState({ showDialogueMenu: false });
    setHasShownDialogueMenu(true);
  }

  getDialogueNextButton(dialogueLineNumber) {
    let dialogueNextPageText = 'Next';
    if (dialogueLineNumber === currentDialogueLineNumberEnd - 1) {
      dialogueNextPageText = 'Exit';

      return (
        <button
          style={{ right: '12px', top: '558px' }}
          className="optionsMenuButton"
          onClick={() => {
            this.closeDialogueMenu();
          }}
        >
          {dialogueNextPageText}
        </button>
      );
    } else {
      return (
        <button
          style={{ right: '12px', top: '558px' }}
          className="optionsMenuButton"
          onClick={() => {
            this.getDialogueMenu(true);
          }}
        >
          {dialogueNextPageText}
        </button>
      );
    }
  }

  getDialogueBlocks(currentDialogueLineNumber) {
    let dialogueBlocks = [];
    let enterText = '<hit enter>';
    let currentLevelSpeakerPosition = cloneVariable(
      getCurrentLevelSpeakerPosition()
    );
    let currentLevelDialogue = cloneVariable(getCurrentLevelDialogue());

    for (let i = 0; i < currentDialogueLineNumberEnd; i++) {
      let dialogue;

      // If the currentLevelDialogue[i][0] is "", then dialogue is given the className of "dialogueBlockTextOther". If the currentLevelSpeakerPosition[i] is 1, then dialogue is given the className of "dialogue-left-side". If it is 2, then dialogue is given the className of "dialogue-right-side".

      // If the currentLevelDialogue[i][0] is not "", then dialogue is given the className of "dialogueBlockText". If the currentLevelSpeakerPosition[i] is 1, then dialogue is given the className of "dialogue-left-side". If it is 2, then dialogue is given the className of "dialogue-right-side".

      // The text "<hit enter>" should only be displayed at the end of all the dialogue that is visible on the screen. This is done by checking if the i is equal to currentDialogueLineNumber. The text should have an opacity of 0.75.

      if (currentLevelDialogue[i][0] === '') {
        dialogue = (
          <>
            <div
              key={i}
              className={
                currentLevelSpeakerPosition[i] === 1
                  ? 'dialogueBlock-left-side'
                  : 'dialogueBlock-right-side'
              }
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
                key={i}
                className={
                  currentLevelSpeakerPosition[i] === 1
                    ? 'dialogueBlock-left-side'
                    : 'dialogueBlock-right-side'
                }
                style={{
                  display: i <= currentDialogueLineNumber ? 'inline' : 'none',
                }}
              >
                <p
                  style={{
                    opacity: '0.75',
                    display:
                      this.state.dialogueLineNumber ===
                      currentDialogueLineNumberEnd - 1
                        ? 'none'
                        : null,
                  }}
                  className="dialogueBlockTextOther"
                >
                  {enterText}
                </p>
              </div>
            ) : null}
          </>
        );
      } else {
        dialogue = (
          <>
            <div
              key={i}
              className={
                currentLevelSpeakerPosition[i] === 1
                  ? 'dialogueBlock-left-side'
                  : 'dialogueBlock-right-side'
              }
              style={{
                display: i <= currentDialogueLineNumber ? 'inline' : 'none',
              }}
            >
              <p className="dialogueBlockText">
                <span style={{ opacity: '0.7' }}>
                  {currentLevelDialogue[i][0]}
                </span>{' '}
                {currentLevelDialogue[i][1]}
              </p>
            </div>
            {i === currentDialogueLineNumber ? (
              <div
                key={i}
                className={
                  currentLevelSpeakerPosition[i] === 1
                    ? 'dialogueBlock-left-side'
                    : 'dialogueBlock-right-side'
                }
                style={{
                  display: i <= currentDialogueLineNumber ? 'inline' : 'none',
                }}
              >
                <p
                  style={{
                    opacity: '0.75',
                    display:
                      this.state.dialogueLineNumber ===
                      currentDialogueLineNumberEnd - 1
                        ? 'none'
                        : null,
                  }}
                  className="dialogueBlockTextOther"
                >
                  {enterText}
                </p>
              </div>
            ) : null}
          </>
        );
      }

      dialogueBlocks.push(dialogue);
    }
    return dialogueBlocks;
  }

  getDialogueMenu(shouldChange) {
    if (shouldChange) {
      this.setState({ dialogueLineNumber: this.state.dialogueLineNumber + 1 });
    }

    let dialogueNextButton = this.getDialogueNextButton(
      this.state.dialogueLineNumber
    );

    let dialogueBlocks = this.getDialogueBlocks(this.state.dialogueLineNumber);

    return (
      <>
        <div
          onClick={() => {}}
          style={{
            // backgroundColor: 'rgb(187, 211, 223)',
            position: 'absolute',
            width: '100%',
            height: '200vh',
            background: '#1a1717',
            opacity: '0.5',
            backdropFilter: 'blur(100px)',
            zIndex: '99',
          }}
        ></div>
        <div style={{ position: 'absolute', left: '-249px', zIndex: '100' }}>
          <div className="levelInfoContainer">
            <p
              style={{ left: '143px', opacity: '1' }}
              className="levelNameToRender"
            >
              {LEVEL_NAME}
            </p>
          </div>

          <div className="levelInfoContainer2">
            {dialogueBlocks}

            {dialogueNextButton}
          </div>
        </div>
      </>
    );
  }

  toggleTutorialMenu() {
    this.setState({ showTutorialMenu: !this.state.showTutorialMenu });
    return;
  }

  nextPage() {
    if (this.state.tutorialPage < 3) {
      this.setState({ tutorialPage: this.state.tutorialPage + 1 });
    } else {
      toggleHasTutorialEnded();
      this.toggleTutorialMenu();
    }
  }

  previousPage() {
    this.setState({ tutorialPage: this.state.tutorialPage - 1 });
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
          style={{
            // backgroundColor: 'rgb(187, 211, 223)',
            position: 'absolute',
            width: '100%',
            height: '200vh',
            background: '#1a1717',
            opacity: '0.5',
            backdropFilter: 'blur(100px)',
            zIndex: '99',
          }}
        ></div>
        <div style={{ position: 'absolute', left: '-249px', zIndex: '100' }}>
          <div className="levelInfoContainer">
            <p
              style={{ left: '143px', opacity: '1' }}
              className="levelNameToRender"
            >
              Tutorial
            </p>
          </div>

          <div
            className="levelInfoContainer2"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              className="tutorialContainer"
              style={{ top: '25px', left: '20px' }}
            >
              <span>{getCurrentTutorialPageText(this.state.tutorialPage)}</span>
            </div>

            <button
              style={{ right: '12px', top: '558px' }}
              className="optionsMenuButton"
              onClick={() => {
                this.nextPage();
              }}
            >
              {tutorialNextPageText}
            </button>

            <button
              style={{ left: '12px', top: '558px' }}
              className="optionsMenuButton"
              onClick={() => {
                this.previousPage();
              }}
            >
              {tutorialPreviousPageText}
            </button>
          </div>
        </div>
      </>
    );
  }

  toggleOptionsMenu() {
    toggleShowingOptionsMenu();
    this.setState({ showOptionsMenu: !this.state.showOptionsMenu });
  }
  saveOptions() {
    toggleShowingOptionsMenu();

    this.toggleOptionsMenu();
  }

  getOptionsMenu() {
    return (
      <>
        <div
          onClick={() => {}}
          style={{
            // backgroundColor: 'rgb(187, 211, 223)',
            position: 'absolute',
            width: '100%',
            height: '200vh',
            background: '#1a1717',
            opacity: '0.5',
            backdropFilter: 'blur(100px)',
            zIndex: '99',
          }}
        ></div>
        <div style={{ position: 'absolute', left: '-249px', zIndex: '100' }}>
          <div className="levelInfoContainer">
            <p
              style={{ left: '143px', opacity: '1' }}
              className="levelNameToRender"
            >
              Settings
            </p>
          </div>
          <div className="levelInfoContainer2">
            <div
              style={{ right: '220px' }}
              className="toggle-grid-holder text-info"
            >
              Toggle Grid Outline
              <div>
                <NodeToggleGrid
                  currentState={gridOutlineToggled}
                  onClick={() => this.toggleGrid()}
                ></NodeToggleGrid>
              </div>
            </div>

            <button
              style={{ right: '12px', top: '558px' }}
              className="optionsMenuButton"
              onClick={() => {
                this.saveOptions();
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

    let src = require(`.././assets/Animated/1.png`).default;

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
        style={{ left: `-450px`, display: 'none' }}
      />
    );

    if (!getCurrentDialogueStatus()) {
      this.toggleDialogueMenu();
      toggleDialogueMenu();
    }

    if (
      Number(currentLevel) === 1 &&
      !getCurrentTutorialStatus() &&
      getHasDialogueEnded()
    ) {
      this.toggleTutorialMenu();
      toggleHasShownTutorial();
    }

    if (LEVEL_ID > 1) toggleHasTutorialEnded();

    let numRandomWallButton;
    let numRandomWallText;

    if (getCurrentLevelRandomWallPresses() !== 0) {
      if (NUM_RANDOM_WALL_PRESSES > 0) {
        numRandomWallButton = (
          <button
            style={{ left: '10px', top: '16px', padding: '5px' }}
            className="standard-button"
            onClick={() => this.startToAnimatePlane()} // add random walls to the grid and animate plane
          >
            Random Walls
          </button>
        );
      } else {
        numRandomWallButton = (
          <button
            style={{
              left: '10px',
              top: '16px',
              padding: '5px',
              opacity: '0.3',
            }}
            className="standard-button-disabled"
            onClick={() => this.startToAnimatePlane()} // add random walls to the grid and animate plane
          >
            Random Walls
          </button>
        );
      }
      numRandomWallText = (
        <p className="numRandomWallText">
          {NUM_RANDOM_WALL_PRESSES} random wall presses left
        </p>
      );
    } else {
      numRandomWallText = null;
      numRandomWallButton = null;
    }

    return (
      <>
        {this.state.showOptionsMenu ? this.getOptionsMenu() : null}
        {plane}

        {this.state.showTutorialMenu && Number(currentLevel) === 1
          ? this.getTutorialMenu()
          : null}

        {this.state.showDialogueMenu ? this.getDialogueMenu(false) : null}

        <div className="topButtonsContainerOutline"> </div>

        <div className="topButtonsContainer">
          {numRandomWallButton}
          <p className="numWallsActiveMessage">
            {NUM_WALLS_ACTIVE} out of {NUM_WALLS_TOTAL} walls used
          </p>
          {numRandomWallText}
          <button
            style={{ right: '100px', top: '16px', padding: '5px' }}
            className="standard-button"
            onClick={() => this.toggleOptionsMenu()} // Options
          >
            Settings
          </button>
          <button
            style={{ right: '10px', top: '16px', padding: '5px' }}
            className="standard-button home-button enabled"
            id="homeButton"
            onClick={() => EnterHome(this.state.animatingPlane)}
          >
            Home
          </button>
          <button
            className="button-82-pushable"
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

        <div className="grid" /*  creates the div that holds the rows*/>
          {grid.map((row, rowID) => {
            return (
              <div
                key={
                  rowID
                } /*  creates the div that holds all the nodes in the row*/
              >
                {row.map((node, nodeID) => {
                  const { row, col, isEnd, isStart, isWall, isPermanentWall } =
                    node;
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
      </>
    );
  }
}
