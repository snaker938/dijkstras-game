import React, { Component } from "react";
import EnterSandBox from "../EnterSandbox";
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
          onClick={() =>
            EnterSandBox()
          } /* starts the dijstra algorithm process */
        >
          Sandbox
        </button>
        <button
          className="play-campaign-button"
          onClick={() =>
            EnterCampaign()
          } /* starts the dijstra algorithm process */
        >
          Campaign
        </button>
      </>
    );
  }
}
