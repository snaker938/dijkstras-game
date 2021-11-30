import React, { Component } from "react";
import { getAllCurrentLevelData } from "../currentLevelHandling";
import { EnterSandbox, EnterCampaign } from "../Navigation";
import "./homeScreen.css";

export default class HomeScreen extends Component {
  constructor() {
    super();
    this.state = {};
  }

  getCurrentLevelData() {
    console.log(getAllCurrentLevelData());
  }

  render() {
    return (
      <>
        <div>This is the home screen!</div>
        <button
          className="play-sandbox-button"
          onClick={() => EnterSandbox()} /* Enters the sandbox */
        >
          Sandbox
        </button>
        <button
          className="play-campaign-button"
          onClick={() => EnterCampaign()} /* Enters level selection */
        >
          Campaign
        </button>
        <button
          className="play-campaign-button"
          onClick={() =>
            this.getCurrentLevelData()
          } /* views available data about the current level */
        >
          View Current Level Data
        </button>
      </>
    );
  }
}
