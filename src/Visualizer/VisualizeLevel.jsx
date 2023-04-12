import React, { Component } from 'react';
import {
  getCurrentTutorialStatus,
  getHasTutorialEnded,
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
  getToggleWallOnClick,
  gridOutlineToggled,
  setGridOutlineToggled,
  setHasGridBeenReset,
  setToggleWallOnClick,
} from '../optionsHandling';
import Node from './Node/Node';
import NodeToggleGrid from './Node/NodeToggleGrid';
import NodeToggleOnClick from './Node/NodeToggleOnClick';
import './VisualizeLevel.css';
import { cloneVariable, resetAllNodes, startDijkstra } from './Visualizer';

// Placeholders for start node coordinates. It gets the current level data
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
let RANDOM_WALL_NUMBER;

// Other level constants
let LEVEL_NAME;
let LEVEL_ID;

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
}

export default class levelVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      showOptionsMenu: false, // is the options menu showing
      showTutorialMenu: false,
      tutorialPage: 1,
      animatingPlane: false,
      showDialogueMenu: false,
      dialogueLineNumber: 0,
      dialogueStartLoop: 0,
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
      this.state.dialogueLineNumber !== getCurrentDialogueLineNumberEnd() - 1
    ) {
      let sceneBreakerIndexes = getSceneBreakerIndexes();
      let sceneNextPageIndexes = getSceneNextPageIndexes();

      if (
        !sceneBreakerIndexes.includes(
          Number(this.state.dialogueLineNumber) + 1
        ) &&
        !sceneNextPageIndexes.includes(
          Number(this.state.dialogueLineNumber) + 1
        )
      ) {
        this.getDialogueMenu(true, false, false);
      }
    }
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress, false);
    this.loadBlankGrid();
  }

  loadBlankGrid() {
    const json = require(`../Visualizer/templates/BLANK.json`);
    const newGrid = json.grid;
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
    this.setState({ showDialogueMenu: false });
    setHasDialogueEnded(true);
    setHasShownDialogueMenu(true);

    if (currentLevel > 1) this.loadRealGrid();
  }

  getDialogueNextButton(dialogueLineNumber) {
    let sceneBreakerIndexes = getSceneBreakerIndexes();
    let sceneNextPageIndexes = getSceneNextPageIndexes();

    let dialogueNextPageText = 'Next';
    if (dialogueLineNumber === getCurrentDialogueLineNumberEnd() - 1) {
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
    } else if (sceneBreakerIndexes.includes(Number(dialogueLineNumber) + 1)) {
      return (
        <button
          style={{ right: '12px', top: '558px' }}
          className="optionsMenuButton"
          onClick={() => {
            this.getDialogueMenu(false, true, false);
          }}
        >
          {dialogueNextPageText}
        </button>
      );
    } else if (sceneNextPageIndexes.includes(Number(dialogueLineNumber) + 1)) {
      let dialogueNextPageText = 'Continue';
      return (
        <button
          style={{ right: '12px', top: '558px' }}
          className="optionsMenuButton"
          onClick={() => {
            this.getDialogueMenu(false, false, true);
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

    let nextText = '<press next>';
    let exitText = '<press exit>';

    let continueText = '<press continue>';

    let sceneBreakerIndexes = getSceneBreakerIndexes();

    let nextSceneIndexes = getSceneNextPageIndexes();

    let currentLevelSpeakerPosition = cloneVariable(
      getCurrentLevelSpeakerPosition()
    );
    let currentLevelDialogue = cloneVariable(getCurrentLevelDialogue());

    console.log(
      currentLevelDialogue,
      currentDialogueLineNumber,
      this.state.dialogueStartLoop
    );

    for (
      let i = this.state.dialogueStartLoop;
      i < getCurrentDialogueLineNumberEnd();
      i++
    ) {
      let dialogue;

      let textToDisplay;
      if (
        sceneBreakerIndexes.includes(Number(this.state.dialogueLineNumber) + 1)
      ) {
        textToDisplay = nextText;
      } else if (
        Number(this.state.dialogueLineNumber) ===
        getCurrentDialogueLineNumberEnd() - 1
      ) {
        textToDisplay = exitText;
      } else if (
        nextSceneIndexes.includes(Number(this.state.dialogueLineNumber) + 1)
      ) {
        textToDisplay = continueText;
      } else {
        textToDisplay = enterText;
      }

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
          <>
            <div
              key={i}
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
                key={i}
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
                      getCurrentDialogueLineNumberEnd() - 1
                        ? 'none'
                        : null,
                  }}
                  className="dialogueBlockTextOther"
                >
                  {textToDisplay}
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
                key={i}
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
                      getCurrentDialogueLineNumberEnd() - 1
                        ? 'none'
                        : null,
                  }}
                  className="dialogueBlockTextOther"
                >
                  {textToDisplay}
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

  getSkipAllDialogueButton() {
    return (
      <button
        style={{ left: '10px', top: '16px', zIndex: '1000' }}
        id="skipAllDialogueButton"
        className="optionsMenuButton"
        onClick={() => {
          this.closeDialogueMenu();
        }}
      >
        Skip...
      </button>
    );
  }

  getDialogueMenu(shouldChange1, shouldChange2, shouldChange3) {
    if (shouldChange1) {
      this.setState({ dialogueLineNumber: this.state.dialogueLineNumber + 1 });
    } else if (shouldChange2) {
      this.setState({ dialogueLineNumber: this.state.dialogueLineNumber + 2 });
    } else if (shouldChange3) {
      console.log(this.state.dialogueLineNumber, shouldChange3);
      this.setState({
        dialogueLineNumber: this.state.dialogueLineNumber + 2,
        dialogueStartLoop: this.state.dialogueLineNumber + 2,
      });
    }

    // console.log(
    //   this.state.dialogueLineNumber,
    //   this.state.dialogueStartLoop,
    //   getCurrentLevelDialogue()
    // );

    let dialogueNextButton = this.getDialogueNextButton(
      this.state.dialogueLineNumber
    );

    let skipAllDialogueButton = this.getSkipAllDialogueButton();

    let dialogueBlocks = this.getDialogueBlocks(this.state.dialogueLineNumber);

    return (
      <>
        <div
          onClick={() => {}}
          style={{
            position: 'absolute',
            width: '100%',
            height: '200vh',
            background: '#1a1717',
            opacity: '0.5',
            backdropFilter: 'blur(100px)',
            zIndex: '99',
          }}
        ></div>
        {skipAllDialogueButton}
        <div style={{ position: 'absolute', left: '-249px', zIndex: '100' }}>
          <div className="dialogueBigContainer">
            <p
              style={{ left: '143px', opacity: '1' }}
              className="levelNameToRender"
            >
              {LEVEL_NAME}
            </p>
          </div>

          <div className="dialogueBigContainer2">
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
          style={{
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

  // Animate plane and place random walls on the grid
  startToAnimatePlane() {
    if (document.getElementById('homeButton').classList.contains('enabled')) {
      if (NUM_RANDOM_WALL_PRESSES > 0) {
        document.getElementById('homeButton').classList.remove('enabled');
        NUM_RANDOM_WALL_PRESSES--; // removes a random wall press

        resetAllNodes(this.state.grid);
        if (!this.state.animatingPlane) {
          this.setState({ animatingPlane: true });

          // Change the display from "none" to "block" so it becomes visible again
          document.getElementById('plane').style.display = 'block';

          // Play "plane_sound_effect.mp3" then stop it
          let audio = new Audio(
            require(`.././assets/Animated/plane_sound_effect.mp3`).default
          );
          audio.play();
          setTimeout(() => {
            audio.pause();
          }, 6300);

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
                document.getElementById('homeButton').classList.add('enabled');
              }
            }, 10 * i);
          }

          // This is the code to add random walls onto the grid. The grid is properly re-rendered every 45n i to prevent lag and once again at the end of the iteration

          let randomWallsAdded = [];

          for (let i = 0; i < RANDOM_WALL_NUMBER; i++) {
            setTimeout(() => {
              for (let node of randomWallsAdded) {
                document
                  .getElementById(`node-${node.row}-${node.col}`)
                  .classList.add('node-unwallable');
              }

              let column =
                (document.getElementById('plane').getBoundingClientRect().x +
                  520) /
                27.5;

              column = randomIntFromInterval(
                Math.floor(column),
                Math.ceil(column)
              );

              let grid = this.state.grid;

              if (column <= 50) {
                // Generates a random row and column number
                let row = Math.floor(Math.random() * NUM_ROWS);

                let node = grid[row][column]; // selects the node with the row and column specified above
                let { isEnd, isStart } = node; // finds out the current properties of the randomly selected node
                let unWallable = isEnd || isStart || node.isPermanentWall; // if the node is a start or end node, it cannot be changed

                // Makes sure the target node is not a wall, and max number of active walls hasnt been reached. Will continue if you are turning a wall into a non wall.
                if (!unWallable && randomWallsAdded.indexOf(node) === -1) {
                  // Choose a random number between 1 and 2. If the number is 1, then the node will be added to randomWallsAdded array
                  if (Math.floor(Math.random() * 2) === 1) {
                    randomWallsAdded.push(node);

                    const newNode = {
                      ...node,
                      isWall: true,
                      isPermanentWall: true,
                    };

                    // Places the new node into the grid
                    grid[row][column] = newNode;
                  }
                }
              }
              if (i % 45 === 0 || i === 400 - 1 || column === 51)
                this.setState({ grid: grid });

              if (i === 400 - 1) {
                for (let node of randomWallsAdded) {
                  document
                    .getElementById(`node-${node.row}-${node.col}`)
                    .classList.add('node-unwallable');
                }
              }
            }, i * 10);
          }
        }
      }
    }
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

  toggleOptionsMenu() {
    this.setState({ showOptionsMenu: !this.state.showOptionsMenu });
  }

  getOptionsMenu() {
    return (
      <>
        <div
          onClick={() => {}}
          style={{
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
          <div className="mainInfoContainer">
            <p
              style={{ left: '143px', opacity: '1' }}
              className="mainTextToRender"
            >
              Settings
            </p>
          </div>
          <div className="mainInfoContainer2">
            <div
              style={{ right: '445px' }}
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

            <div
              style={{ right: '10px' }}
              className="toggle-onclick-holder text-info"
            >
              Toggle Wall After Animation
              <div>
                <NodeToggleOnClick
                  currentState={getToggleWallOnClick()}
                  onClick={() => this.toggleOnClick()}
                ></NodeToggleOnClick>
              </div>
            </div>

            <button
              style={{ right: '12px', top: '558px' }}
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

    let src = require(`.././assets/Animated/1.png`).default;

    let plane = null;

    if (
      Number(currentLevel) === 1 &&
      !getCurrentTutorialStatus() &&
      getHasDialogueEnded()
    ) {
      this.toggleTutorialMenu();
      toggleHasShownTutorial();
    }

    if (LEVEL_ID > 1) toggleHasTutorialEnded();

    if (!getCurrentDialogueStatus()) {
      this.toggleDialogueMenu();
      toggleDialogueMenu();
    }

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

    let numRandomWallButton;

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
    } else {
      numRandomWallButton = null;
    }

    return (
      <>
        {this.state.showOptionsMenu ? this.getOptionsMenu() : null}

        {this.state.showDialogueMenu
          ? this.getDialogueMenu(false, false, false)
          : null}

        {this.state.showTutorialMenu && Number(currentLevel) === 1
          ? this.getTutorialMenu()
          : null}

        {plane}

        <div className="topButtonsContainerOutline"> </div>

        <div className="topButtonsContainer">
          {numRandomWallButton}

          <p className="numWallsActiveMessage">
            {NUM_WALLS_ACTIVE} out of {NUM_WALLS_TOTAL} walls used
          </p>

          <p className="currentEndDistanceMessage">
            End Distance: {getCurrentLevelEndDistance()}
          </p>

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
