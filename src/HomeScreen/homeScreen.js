import React, { Component } from "react";
import EnterSandbox from "../EnterSandbox";
import EnterCampaign from "../EnterCampaignScreen";
import "./homeScreen.css";

export default class HomeScreen extends Component {
  constructor() {
    super();
    this.state = {};
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
      </>
    );
  }
}
