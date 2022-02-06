import React, { Component } from 'react';
import { getAllCurrentLevelData } from '../currentLevelHandling';
import { EnterSandbox, EnterCampaign } from '../Navigation';
import './homeScreen.css';

export default class HomeScreen extends Component {
  constructor() {
    super();
    this.state = {};
  }

  getCurrentLevelData() {
    console.log(getAllCurrentLevelData());
  }

  renderUselessBar() {
    // Change the variable to modify the speed of the number increasing from 0 to (ms)
    let SPEED = 40;
    // Retrieve the percentage value
    let limit = 100;
    document.getElementById('mainBar').classList = 'bar';

    for (let i = 0; i <= limit; i++) {
      setTimeout(function () {
        document.getElementById('value1').innerHTML = i + '%';
      }, SPEED * i);
    }
  }

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
            onClick={() => this.renderUselessBar()} /* Enters level selection */
          >
            Campaign
          </button>
          <button
            className="buttonMain"
            onClick={() => EnterSandbox()} /* Enters the sandbox */
          >
            Sandbox
          </button>
          <div class="bodyBar">
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
