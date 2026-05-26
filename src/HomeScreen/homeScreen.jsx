import React, { Component } from 'react';
import {
  getCurrentUserName,
  numLevelsUnlocked,
  setCurrentUserName,
} from '../currentUserDataHandling';
import { EnterCampaign, EnterSandbox } from '../Navigation';
import backgroundImagePath from './../assets/mainbackground.png';
import './homeScreen.css';

const INVALID_USERNAME_PATTERN = /[!#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export default class HomeScreen extends Component {
  constructor() {
    super();
    this.state = { showDataMenu: false, showCreditsMenu: false };
    this.usernameInputRef = React.createRef();
  }

  toggleDataMenu() {
    this.setState({ showDataMenu: !this.state.showDataMenu });
  }

  toggleCreditsMenu() {
    this.setState({ showCreditsMenu: !this.state.showCreditsMenu });
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
                  This game was written entirely in ReactJS, HTML and CSS. This
                  code could not have been written without StackOverflow. I
                  would also like to credit a few other people below.
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
                  A small amount of data is stored locally, to provide you with
                  a better experience. All the data stored is listed below.
                  Please click the "Delete All Data" button, to remove all your
                  data.
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
                  <div className="dataInfoTag">Number Of Levels Unlocked</div>
                  <p className="dataText">
                    {numLevelsUnlocked}
                  </p>
                </div>
              </div>

              <div className="homeModalFooter dataModalFooter">
                <button
                  className="standard-button-data deleteDataButton"
                  onClick={() => this.clearAllLocalStorageData()}
                >
                  Delete Data
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

  // This function clears all local storage data
  clearAllLocalStorageData() {
    this.toggleDataMenu();
    localStorage.clear();
  }

  render() {
    return (
      <div className="homeScreenRoot">
        {this.state.showCreditsMenu ? this.getCreditsMenu() : null}
        {this.state.showDataMenu ? this.getDataMenu() : null}
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
        <div className="titleText">DIJKTRA'S GAME</div>

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
