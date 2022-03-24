import React, { Component } from 'react';
import { Modal, Button } from 'bootstrap';
import { getAllCurrentLevelData } from '../currentLevelHandling';
import { EnterSandbox, EnterCampaign } from '../Navigation';
import './homeScreen.css';
import testingImagePath from '.././assets/mainbackground.png';

export default class HomeScreen extends Component {
  constructor() {
    super();
    this.state = {
      bar: null,
    };
  }

  getCurrentLevelData() {
    console.log(getAllCurrentLevelData());
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
          ></input>
        </div>

        <button
          className="dividerButton campaignStartButton"
          onClick={() => EnterCampaign()}
        >
          Campaign
        </button>

        <button
          className="dividerButton sandboxStartButton"
          onClick={() => EnterSandbox()}
        >
          Sandbox
        </button>

        <button className="dividerButton settingsButton" onClick={() => {}}>
          Settings
        </button>

        <button className="dividerButton creditsButton" onClick={() => {}}>
          Credits
        </button>
      </>
    );
  }
}
