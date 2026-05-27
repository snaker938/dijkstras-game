import React, { Component } from 'react';
import { numLevels } from '../allLevelData';
import {
  getCurrentUserName,
  isUnlockAllLevelsToggled,
  numLevelsUnlocked,
  resetStoredUserData,
  setCurrentUserName,
  setUnlockAllLevelsToggled,
} from '../currentUserDataHandling';
import { EnterCampaign, EnterSandbox } from '../Navigation';
import backgroundImagePath from './../assets/mainbackground.png';
import './homeScreen.css';

const INVALID_USERNAME_PATTERN = /[!#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export default class HomeScreen extends Component {
  constructor() {
    super();
    this.state = {
      showDataMenu: false,
      showCreditsMenu: false,
      showLearningMenu: false,
      dataRefresh: 0,
    };
    this.usernameInputRef = React.createRef();
  }

  toggleDataMenu() {
    this.setState({ showDataMenu: !this.state.showDataMenu });
  }

  toggleCreditsMenu() {
    this.setState({ showCreditsMenu: !this.state.showCreditsMenu });
  }

  toggleLearningMenu() {
    this.setState({ showLearningMenu: !this.state.showLearningMenu });
  }

  toggleAllLevelsUnlocked() {
    setUnlockAllLevelsToggled(!isUnlockAllLevelsToggled());
    this.setState((prevState) => ({
      dataRefresh: prevState.dataRefresh + 1,
    }));
  }

  // This function sets the inputted username, and checks it, and then takes the user to their desired location
  preEnterGame(where) {
    const usernameInput = this.usernameInputRef.current;

    if (!usernameInput) {
      return;
    }

    const userNameEntered = usernameInput.value;

    // Makes sure the username entered is valid.
    if (this.checkUsername(userNameEntered)) {
      setCurrentUserName(userNameEntered);

      if (where === 'campaign') {
        EnterCampaign();
      } else {
        EnterSandbox();
      }
    }
  }

  // Changes the color of the input box text to the default colour (from red), if the user clicks the box before it changes automatically
  changeColor() {
    const usernameInput = this.usernameInputRef.current;

    if (!usernameInput) {
      return;
    }

    if (usernameInput.style.color === 'red') {
      usernameInput.value = '';
    }

    usernameInput.style.color = 'white';
  }

  // This function will alert the user that the username they entered is not allowed
  checkUsername(userNameEntered) {
    const usernameInput = this.usernameInputRef.current;

    if (
      userNameEntered === '' ||
      userNameEntered === 'ERROR: INVALID INPUT' ||
      userNameEntered.includes(' ') ||
      INVALID_USERNAME_PATTERN.test(userNameEntered)
    ) {
      if (usernameInput) {
        usernameInput.value = 'ERROR: INVALID INPUT';
        usernameInput.style.color = 'red';
      }

      // Change the box style/value default after a set amount of time
      setTimeout(() => {
        const input = this.usernameInputRef.current;

        if (input && input.value === 'ERROR: INVALID INPUT') {
          input.value = '';
          input.style.color = 'white';
        }
      }, 3000);

      return false;
    }

    return true;
  }

  getCreditsMenu() {
    return (
      <>
        <div className="homeModalBackdrop"></div>
        <div className="outerCreditsDiv">
          <div className="mainInfoContainer">
            <p className="mainTextToRender">Credits</p>
          </div>
          <div className="mainInfoContainer2">
            <div className="homeModalContent creditsModalContent">
              <div className="creditsDescriptionContainer">
                <p className="creditsDescription">
                  Dijkstra's Game is built with React, HTML and CSS. The visual
                  style, audio, and supporting assets below helped shape the
                  final experience.
                </p>
              </div>
              <div className="creditsRows">
                <div className="creditsContainer">
                  <div className="creditsInfoTag">Background Game Art</div>
                  <p className="creditsText">
                    vivekart on Fiverr (commissioned)
                  </p>
                </div>
                <div className="creditsContainer">
                  <div className="creditsInfoTag">Plane Sprite Art</div>
                  <span className="creditsText">UnLucky Studio (free)</span>
                </div>
                <div className="creditsContainer">
                  <div className="creditsInfoTag">Plane Sound Effect</div>
                  <span className="creditsText">soundjay.com (free)</span>
                </div>
                <div className="creditsContainer">
                  <div className="creditsInfoTag">Start Button</div>
                  <span className="creditsText">freefrontend.com (free)</span>
                </div>
              </div>

              <div className="homeModalFooter creditsModalFooter">
                <button
                  className="creditsMenuButton"
                  onClick={() => {
                    this.toggleCreditsMenu();
                  }}
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  getDataMenu() {
    return (
      <>
        <div className="homeModalBackdrop"></div>

        <div className="outerDataDiv">
          <div className="mainInfoContainer">
            <p className="mainTextToRender">Data Handling</p>
          </div>
          <div className="mainInfoContainer2">
            <div className="homeModalContent dataModalContent">
              <div className="dataDescriptionContainer">
                <p className="dataDescription">
                  A small amount of progress data is stored locally on this
                  device. You can review it below, unlock every campaign level,
                  or delete the stored data at any time.
                </p>
              </div>
              <div className="dataRows">
                <div className="dataContainer">
                  <div className="dataInfoTag">Username</div>
                  <p className="dataText">
                    {getCurrentUserName()}
                  </p>
                </div>
                <div className="dataContainer">
                  <div className="dataInfoTag">Levels Unlocked</div>
                  <p className="dataText">
                    {numLevelsUnlocked} / {numLevels}
                  </p>
                </div>
                <div className="dataContainer">
                  <div className="dataInfoTag">Unlock All Levels</div>
                  <button
                    type="button"
                    className={`dataToggleButton ${
                      isUnlockAllLevelsToggled() ? 'is-active' : ''
                    }`}
                    aria-pressed={isUnlockAllLevelsToggled()}
                    onClick={() => this.toggleAllLevelsUnlocked()}
                  >
                    {isUnlockAllLevelsToggled()
                      ? 'All 15 Unlocked'
                      : 'Locked Progress'}
                  </button>
                </div>
              </div>

              <div className="homeModalFooter dataModalFooter">
                <button
                  className="standard-button-data deleteDataButton"
                  onClick={() => this.clearAllLocalStorageData()}
                >
                  Delete Stored Data
                </button>

                <button
                  className="dataMenuButton"
                  onClick={() => {
                    this.toggleDataMenu();
                  }}
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  getLearningMenu() {
    return (
      <>
        <div className="homeModalBackdrop"></div>

        <div className="outerLearningDiv">
          <div className="mainInfoContainer">
            <p className="mainTextToRender">Learning</p>
          </div>
          <div className="mainInfoContainer2">
            <div className="homeModalContent learningModalContent">
              <div className="learningIntro">
                Dijkstra's Game turns a shortest-path algorithm into a puzzle:
                keep a route open, but make the shortest route too long for the
                missile to survive.
              </div>

              <div className="learningGrid">
                <section className="learningSection">
                  <h2>The Grid</h2>
                  <p>
                    Each square is a node. Moving up, down, left, or right is an
                    edge with cost 1. Walls remove nodes from the graph, so the
                    missile has to search around them.
                  </p>
                </section>

                <section className="learningSection">
                  <h2>Dijkstra's Algorithm</h2>
                  <p>
                    Dijkstra starts at the green node, gives it distance 0, then
                    repeatedly visits the unfinished node with the smallest known
                    distance.
                  </p>
                  <pre className="learningFormula">
                    {'dist[start] = 0\n' +
                      'dist[other nodes] = infinity\n' +
                      'dist[v] = min(dist[v], dist[u] + 1)'}
                  </pre>
                </section>

                <section className="learningSection">
                  <h2>How You Win</h2>
                  <p>
                    Let D be the end distance and d(start, end) be the shortest
                    path after your walls are placed. You win when a path still
                    exists and d(start, end) is greater than D.
                  </p>
                </section>

                <section className="learningSection">
                  <h2>The Solver</h2>
                  <p>
                    The solver searches for wall sets that obey the wall limit,
                    keep at least one path open, and force the shortest path past
                    the end distance. Blue overlay nodes show a suggested wall
                    set before you implement it.
                  </p>
                </section>

                <section className="learningSection">
                  <h2>Solver Conditions</h2>
                  <p>
                    The solver is looking for a set of walls W where W fits
                    inside the remaining wall limit, the target is still
                    reachable, and the verified shortest path is longer than the
                    end distance.
                  </p>
                  <pre className="learningFormula">
                    {'|W| <= wall limit\n' +
                      'path still exists\n' +
                      'shortestPath > endDistance'}
                  </pre>
                </section>

                <section className="learningSection">
                  <h2>Solver Results</h2>
                  <p>
                    Safe Path Solutions lists verified wall sets. A preview shows
                    how each set changes the grid, while Implement Solution
                    replaces the current editable walls with the selected
                    answer.
                  </p>
                </section>

                <section className="learningSection learningSectionWide">
                  <h2>Reading the Animation</h2>
                  <p>
                    The expanding colour wave is the algorithm's frontier. Node
                    numbers show distance from the start. A wall only matters if
                    it changes the shortest route the missile would choose.
                  </p>
                </section>
              </div>

              <div className="homeModalFooter learningModalFooter">
                <button
                  className="creditsMenuButton"
                  onClick={() => {
                    this.toggleLearningMenu();
                  }}
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // This function clears all local storage data
  clearAllLocalStorageData() {
    resetStoredUserData();
    if (this.usernameInputRef.current) {
      this.usernameInputRef.current.value = '';
    }
    this.setState((prevState) => ({
      showDataMenu: false,
      dataRefresh: prevState.dataRefresh + 1,
    }));
  }

  render() {
    return (
      <div className="homeScreenRoot">
        {this.state.showCreditsMenu ? this.getCreditsMenu() : null}
        {this.state.showDataMenu ? this.getDataMenu() : null}
        {this.state.showLearningMenu ? this.getLearningMenu() : null}
        <div
          style={{
            backgroundColor: 'rgb(187, 211, 223)',
            position: 'absolute',
            left: '0px',
            width: '100%',
            height: '100%',
            // zIndex: '1000000',
          }}
        ></div>
        <div className="imgbox">
          <img
            alt="Dijkstra's game background"
            className="center-fit"
            src={backgroundImagePath}
          />
        </div>
        <div className="titleText">DIJKSTRA'S GAME</div>

        <div>
          <p className="welcomeBackText">Welcome Back, </p>
          <input
            type="text"
            id="usernameInput"
            ref={this.usernameInputRef}
            className="usernameInput"
            maxLength={22}
            spellCheck={false}
            onClick={() => {
              this.changeColor();
            }}
            defaultValue={getCurrentUserName()}
          />
        </div>

        <div className="bottomSector">
          <button
            className="dividerButton campaignStartButton"
            onClick={() => {
              this.preEnterGame('campaign');
            }}
          >
            Campaign
          </button>

          <button
            className="dividerButton sandboxStartButton"
            onClick={() => {
              this.preEnterGame('sandbox');
            }}
          >
            Sandbox
          </button>

          <button
            className="dividerButton dataButton"
            onClick={() => {
              this.toggleDataMenu();
            }}
          >
            Data
          </button>

          <button
            className="dividerButton learningButton"
            onClick={() => {
              this.toggleLearningMenu();
            }}
          >
            Learning
          </button>

          <button
            className="dividerButton creditsButton"
            onClick={() => {
              this.toggleCreditsMenu();
            }}
          >
            Credits
          </button>
        </div>
      </div>
    );
  }
}
