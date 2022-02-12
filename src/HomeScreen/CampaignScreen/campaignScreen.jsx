import React, { Component } from 'react';
import { allLevelNames, numLevels } from '../../allLevelData';
import { EnterLevel } from '../../Navigation';
import './campaignScreen.css';
import campaignText from '../../assets/Campaign_Text.png';

export default class CampaignScreen extends Component {
  constructor() {
    super();
    this.state = {};
    this.numLevels = numLevels;
    this.allLevelNames = allLevelNames;
  }

  getButtonsUsingForLoop = (numLevels) => {
    const buttons = [];

    for (let i = 1; i <= numLevels; i++) {
      buttons.push(
        <button onClick={() => EnterLevel(i)} key={i}>
          {this.allLevelNames[i - 1]}
        </button>
      );
    }

    return buttons;
  };

  render() {
    return (
      <>
        <img src={campaignText} alt="capaigntext" />
        <div>
          <div>{this.getButtonsUsingForLoop(numLevels)} </div>
          <p className="campaignContainer"></p>
        </div>
      </>
    );
  }
}

// width: 100%;
//   height: 100%;
//   position: relative;
//   margin: 0 auto;
//   background-color: white;
//   background-image: linear-gradient(to bottom, black, black),
//     linear-gradient(to bottom left, transparent 50%, black 50%),
//     linear-gradient(to bottom right, transparent 50%, black 50%),
//     linear-gradient(to bottom, black, black);
//   background-position: 350px 67px, 560px 66px, 296px 66px, 296px 130px;
//   background-size: 210px 63px, 56px 64px, 56px 64px, 320px 398px;
//   background-repeat: no-repeat;
