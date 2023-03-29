import React, { Component } from 'react';
import { getCurrentUserName } from '../currentUserDataHandling';
import { setCurrentUserName } from '../currentUserDataHandling';
import { EnterCampaign, EnterSandbox } from '../Navigation';
import backgroundImagePath from './../assets/mainbackground.png';
import './homeScreen.css';

export default class HomeScreen extends Component {
  constructor() {
    super();
    this.state = { showDataMenu: false, showCreditsMenu: false };
  }

  toggleDataMenu() {
    this.setState({ showDataMenu: !this.state.showDataMenu });
  }

  toggleCreditsMenu() {
    this.setState({ showCreditsMenu: !this.state.showCreditsMenu });
  }

  // This function sets the inputted username, and checks it, and then takes the user to their desired location
  preEnterGame(where) {
    let userNameEntered = document.getElementById('usernameInput').value;
    // Makes sure the username entered is valid.
    if (this.checkUsername(userNameEntered)) {
      setCurrentUserName(document.getElementById('usernameInput').value);
      if (where === 'campaign') {
        EnterCampaign();
      } else {
        EnterSandbox();
      }
    }
  }

  // Changes the color of the input box text to the default colour (from red), if the user clicks the box before it changes automatically
  changeColor() {
    if (document.getElementById('usernameInput').style.color === 'red') {
      document.getElementById('usernameInput').value = '';
    }
    document.getElementById('usernameInput').style.color = 'white';
  }

  // This function will alert the user that the username they entered is not allowed
  checkUsername(userNameEntered) {
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
        if (document.getElementById('usernameInput')) {
          if (
            document.getElementById('usernameInput').value ===
            'ERROR: INVALID INPUT'
          ) {
            document.getElementById('usernameInput').value = '';
            document.getElementById('usernameInput').style.color = 'white';
          }
        }
      }, 3000);
      return false;
    } else {
      return true;
    }
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
          <div className="mainInfoContainer">
            <p
              style={{
                left: '143px',
                opacity: '1',
                marginTop: '12px',
                fontSize: '35px',
              }}
              className="mainTextToRender"
            >
              Credits
            </p>
          </div>
          <div className="mainInfoContainer2">
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
                style={{ top: '300px', left: '20px' }}
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
                style={{ top: '400px', left: '20px' }}
              >
                <span>
                  <div className="creditsInfoTag">Plane Sound Effect</div>
                  <span className="creditsText">soundjay.com (free)</span>
                </span>
              </div>
            </div>
            <div>
              <div
                className="creditsContainer"
                style={{ top: '500px', left: '20px' }}
              >
                <span>
                  <div className="creditsInfoTag">Start Button</div>
                  <span className="creditsText">freefrontend.com (free)</span>
                </span>
              </div>
            </div>

            <button
              style={{ right: '12px', top: '558px' }}
              className="creditsMenuButton"
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

  getDataMenu() {
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
              style={{
                left: '143px',
                opacity: '1',
                marginTop: '12px',
                fontSize: '35px',
              }}
              className="mainTextToRender"
            >
              Data Handling
            </p>
          </div>
          <div className="mainInfoContainer2">
            <div>
              <div className="dataDescriptionContainer">
                <p className="dataDescription">
                  A small amount of data is stored locally, to provide you with
                  a better experience. All the data stored is listed below.
                  Please click the "Delete All Data" button, to remove all your
                  data.
                </p>
              </div>
              <div>
                <div
                  className="dataContainer"
                  style={{ top: '200px', left: '20px' }}
                >
                  <span>
                    <div className="dataInfoTag">Username</div>
                    <p style={{ left: '350px' }} className="dataText">
                      {getCurrentUserName()}
                    </p>
                  </span>
                </div>
              </div>
              <div>
                <div
                  className="dataContainer"
                  style={{ top: '310px', left: '20px' }}
                >
                  <span>
                    <div className="dataInfoTag">Number Of Levels Unlocked</div>
                    <p style={{ left: '350px' }} className="dataText">
                      Temp Number
                    </p>
                  </span>
                </div>
              </div>

              <button
                className="standard-button-data deleteDataButton"
                onClick={() => this.clearAllLocalStorageData()}
              >
                Delete Data
              </button>

              <button
                style={{ right: '12px', top: '558px' }}
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
      <>
        {this.state.showCreditsMenu ? this.getCreditsMenu() : null}
        {this.state.showDataMenu ? this.getDataMenu() : null}
        <div
          style={{
            backgroundColor: 'rgb(187, 211, 223)',
            position: 'absolute',
            left: '0px',
            width: '100%',
            height: '100vh',
          }}
        ></div>
        <div className="imgbox">
          <img
            alt="test"
            className="center-fit"
            src={backgroundImagePath}
          ></img>
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
            onClick={() => {
              this.changeColor();
            }}
            defaultValue={'Player'}
          ></input>
        </div>

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
      </>
    );
  }
}
