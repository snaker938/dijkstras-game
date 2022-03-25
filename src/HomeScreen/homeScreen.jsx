import React, { Component } from 'react';
import { Modal, Button } from 'bootstrap';
import { getAllCurrentLevelData } from '../currentLevelHandling';
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
    this.state = {};
  }

  getCurrentLevelData() {
    console.log(getAllCurrentLevelData());
  }

  // This function sets the inputted username, and checks it, and then takes the user to their desired location
  preEnterGame(where) {
    let userNameEntered = document.getElementById('usernameInput').value;
    if (
      userNameEntered === '' ||
      userNameEntered === 'ERROR: NO NAME ENTERED' ||
      userNameEntered.includes(' ') ||
      userNameEntered.match(/[!#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    ) {
      document.getElementById('usernameInput').value = 'ERROR: INVALID INPUT';
      document.getElementById('usernameInput').style.color = 'red';

      // Change the box style/value default
      setTimeout(() => {
        document.getElementById('usernameInput').value = '';
        document.getElementById('usernameInput').style.color = 'white';
      }, 3000);
    } else {
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

  renderUselessBar(where) {
    document.getElementById('mainBar').classList = 'bar';
    for (let i = 0; i <= 100; i++) {
      setTimeout(function () {
        if (i === 100) {
          if (where === 'campaign') EnterCampaign();
          else EnterSandbox();
        }
      }, i * 23);
    }
  }

  // Creates a NEW modal window. Includes a button to clear all local storage data. Includes a button to close the modal window.
  openSettingsModalWindow() {}

  // This function clears all local storage data
  clearAllLocalStorageData() {
    localStorage.clear();
  }

  render() {
    return (
      <>
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
          className="dividerButton settingsButton"
          onClick={() => {
            this.openSettingsModalWindow();
          }}
        >
          Settings
        </button>

        <button className="dividerButton creditsButton" onClick={() => {}}>
          Credits
        </button>
      </>
    );
  }
}
