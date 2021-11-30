import React, { Component } from "react";
import { allLevelNames, numLevels } from "../../allLevelData";
import { EnterLevel } from "../../Navigation";
import "./campaignScreen.css";

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
        <div>This is the campaign screen! There are {numLevels} levels</div>
        <div>{this.getButtonsUsingForLoop(numLevels)} </div>
      </>
    );
  }
}
