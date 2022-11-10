import React, { Component } from 'react';
import { EnterSandbox, EnterCampaign } from '../Navigation';
import './homeScreen.css';
import testingImagePath from '.././assets/mainbackground.png';
import {
  getCurrentUserName,
  setCurrentUserName,
} from '../currentUserDataHandling';

export default class HomeScreen extends Component {
  constructor() {
    super();
    this.state = { rerender: [], showCreditsMenu: false };
  }

  // This function sets the inputted username, and checks it, and then takes the user to their desired location
  preEnterGame(where) {
    let userNameEntered = document.getElementById('usernameInput').value;
    // Makes sure the username entered is valid.
    if (checkUsername(userNameEntered)) {
      setCurrentUserName(document.getElementById('usernameInput').value);
      if (where === 'campaign') {
        EnterCampaign();
      } else {
        EnterSandbox();
      }
    }
  }

  toggleCreditsMenu() {
    this.setState({ showCreditsMenu: !this.state.showCreditsMenu });
  }

  getCreditsMenu() {
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
              style={{
                left: '143px',
                opacity: '1',
                marginTop: '12px',
                fontSize: '35px',
              }}
              className="levelNameToRender"
            >
              Credits
            </p>
          </div>
          <div className="levelInfoContainer2">
            <div>
              <div className="creditsDescriptionContainer">
                <p className="creditsDescription">
                  This game was written entirely in ReactJS, HTML and CSS. This
                  code could not have been written without StackOverflow. I
                  would also like to credit a few other people below.
                </p>
              </div>
            </div>
            <div>
              <div
                className="creditsContainer"
                style={{ top: '200px', left: '20px' }}
              >
                <span>
                  <div className="creditsInfoTag">Background Game Art</div>
                  <p className="creditsText">
                    vivekart on Fiverr (commissioned)
                  </p>
                </span>
              </div>
            </div>
            <div>
              <div
                className="creditsContainer"
                style={{ top: '310px', left: '20px' }}
              >
                <span>
                  <div className="creditsInfoTag">Plane Sprite Art</div>
                  <span className="creditsText">UnLucky Studio (free)</span>
                </span>
              </div>
            </div>
            <div>
              <div
                className="creditsContainer"
                style={{ top: '420px', left: '20px' }}
              >
                <span>
                  <div className="creditsInfoTag">Plane Sound Effect</div>
                  <span className="creditsText">soundjay.com (free)</span>
                </span>
              </div>
            </div>

            <button
              style={{ right: '12px', top: '558px' }}
              className="optionsMenuButton"
              onClick={() => {
                this.toggleCreditsMenu();
              }}
            >
              Exit
            </button>
          </div>
        </div>
      </>
    );
  }

  // Changes the color of the input box text to the default colour (from red), if the user clicks the box before it changes automatically
  changeColor() {
    if (document.getElementById('usernameInput').style.color === 'red') {
      document.getElementById('usernameInput').value = '';
    }
    document.getElementById('usernameInput').style.color = 'white';
  }

  // This function clears all local storage data
  clearAllLocalStorageData() {
    localStorage.clear();
  }

  render() {
    return (
      <>
        {this.state.showCreditsMenu ? this.getCreditsMenu() : null}
        <div
          style={{
            backgroundColor: 'rgb(187, 211, 223)',
            position: 'absolute',
            width: '100%',
            height: '100vh',
          }}
        ></div>
        <div className="imgbox">
          <img alt="test" className="center-fit" src={testingImagePath}></img>
        </div>
        <div className="titleText">DIJKTRA'S GAME</div>
        <div className="bottomSector"></div>
        <div>
          <p className="welcomeBackText">Welcome Back, </p>
          <input
            type="text"
            id="usernameInput"
            className="usernameInput"
            maxLength={22}
            spellCheck="false"
            onClick={() => this.changeColor()}
            defaultValue={getCurrentUserName()}
          ></input>
        </div>

        <button
          className="dividerButton campaignStartButton"
          onClick={() => this.preEnterGame('campaign')}
        >
          Campaign
        </button>

        <button
          className="dividerButton sandboxStartButton"
          onClick={() => this.preEnterGame('sandbox')}
        >
          Sandbox
        </button>

        <button
          className="dividerButton medalsButton"
          onClick={() => {
            this.clearAllLocalStorageData();
          }}
        >
          Medals
        </button>

        <button
          className="dividerButton creditsButton"
          onClick={() => {
            this.toggleCreditsMenu();
          }}
        >
          Credits
        </button>
      </>
    );
  }
}

// This function will alert the user that the username they entered is not allowed
function checkUsername(userNameEntered) {
  if (
    userNameEntered === '' ||
    userNameEntered === 'ERROR: INVALID INPUT' ||
    userNameEntered.includes(' ') ||
    userNameEntered.match(/[!#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)
  ) {
    document.getElementById('usernameInput').value = 'ERROR: INVALID INPUT';
    document.getElementById('usernameInput').style.color = 'red';

    // Change the box style/value default after a set amount of time
    setTimeout(() => {
      if (
        document.getElementById('usernameInput').value ===
        'ERROR: INVALID INPUT'
      ) {
        document.getElementById('usernameInput').value = '';
        document.getElementById('usernameInput').style.color = 'white';
      }
    }, 3000);
    return false;
  } else {
    return true;
  }
}
