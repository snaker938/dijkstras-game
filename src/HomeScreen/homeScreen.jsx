import React, { Component } from 'react';
import { getAllCurrentLevelData } from '../currentLevelHandling';
import { EnterSandbox, EnterCampaign } from '../Navigation';
import './homeScreen.css';

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
  // document.getElementById('value1').innerHTML = i + '%';

  render() {
    return (
      <>
        <div class="mainBodyHome">
          <div class="light">
            <div class="wire"></div>
            <div class="bulb">
              <span></span>
              <span></span>
            </div>
          </div>
          <button
            className="buttonMain"
            onClick={() =>
              this.renderUselessBar('campaign')
            } /* Enters level selection */
          >
            Campaign
          </button>
          <button
            className="buttonMain"
            onClick={() =>
              this.renderUselessBar('sandbox')
            } /* Enters the sandbox */
          >
            Sandbox
          </button>
          <div id="bodyBar" class="bodyBar">
            <div class="chart">
              <div id="mainBar" class=""></div>
              <span id="value1"></span>
            </div>
          </div>
        </div>
      </>
    );
  }
}
