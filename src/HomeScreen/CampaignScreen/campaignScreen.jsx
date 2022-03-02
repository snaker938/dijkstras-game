import React, { Component } from 'react';
import testingImagePath from '../../assets/mainbackground.png';
import {
  allLevelNames,
  numLevels,
  allLevelIDs,
  getLevelName,
  getLevelDescription,
  getLevelRandomWallPresses,
} from '../../allLevelData';
import { EnterLevel, EnterHomeFromMenu } from '../../Navigation';
import './campaignScreen.css';
import campaignText from '../../assets/Campaign_Text.png';

export default class CampaignScreen extends Component {
  constructor() {
    super();
    this.state = {
      levelClicked: 1,
    };
    this.numLevels = numLevels;
    this.allLevelNames = allLevelNames;
    this.allLevelsIds = allLevelIDs;
  }

  getButtonsUsingForLoop = (numLevels) => {
    const buttons = [];

    for (let i = 1; i <= numLevels; i++) {
      let first;
      if (i === 1) {
        first = true;
      } else {
        first = false;
      }
      buttons.push(
        <button
          className={first ? 'levelButtonClicked' : 'levelButtons'}
          id={i}
          onClick={() => this.showLevelInfo(i)}
          key={i}
        >
          <span>
            <div style={{ position: 'absolute', marginLeft: '8px' }}>
              {this.allLevelsIds[i - 1]}{' '}
            </div>
            <span
              style={
                // i < 10 ? { marginLeft: '3.5rem' } : { marginLeft: '3.5rem' }
                { marginLeft: '3rem' }
              }
            >
              {this.allLevelNames[i - 1]}
            </span>
          </span>
        </button>
      );
    }

    return buttons;
  };

  showLevelInfo(levelID) {
    for (let button of document.getElementsByClassName('levelButtonClicked')) {
      button.classList = 'levelButtons';
    }

    document.getElementById(levelID).classList = 'levelButtonClicked';

    this.setState({ levelClicked: levelID });
  }

  getLevelInfo(id) {
    let numRandomWallPresses = getLevelRandomWallPresses(id);
    let powerupMessage = 'None';
    if (numRandomWallPresses > 0) powerupMessage = numRandomWallPresses;
    return (
      <div>
        <div>
          <div className="levelDescriptionContainer">
            <p className="levelDescription">{getLevelDescription(id)}</p>
          </div>
        </div>
        <div>
          <div className="powerupContainer">
            <p className="powerupNumberText"> {powerupMessage}</p>
          </div>
        </div>
      </div>
    );
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
        <div class="imgbox">
          <img alt="test" className="center-fit" src={testingImagePath}></img>
        </div>
        {/* <img
          style={{ position: 'absolute', left: '520px', top: '20px' }}
          src={campaignText}
          alt="capaigntext"
        /> */}
        <div>
          <div style={{ position: 'absolute', left: '53px' }}>
            <div>
              <div className="levelContainer"></div>
              <div className="levelContainer2"></div>
              <p className="selectStageText">Select Stage</p>
            </div>
            <div style={{ position: 'absolute', top: '65px', left: '51px' }}>
              {this.getButtonsUsingForLoop(numLevels)}{' '}
            </div>
            <div style={{ position: 'absolute', left: '-110px' }}>
              <div className="levelInfoContainer">
                {/* <div className="levelNameToRenderContainer"></div> */}
                <p className="levelNameToRender">
                  {getLevelName(this.state.levelClicked - 1)}
                </p>
              </div>
              <div className="levelInfoContainer2"></div>
              {this.getLevelInfo(this.state.levelClicked - 1)}
            </div>
          </div>
          <button
            id="startLevelButton"
            onClick={() =>
              EnterLevel(
                document.getElementsByClassName('levelButtonClicked').item(0).id
              )
            }
            className="campaignScreenButton startLevel"
          >
            Start Game
          </button>
          <button
            className="campaignScreenButton backButton"
            onClick={() => EnterHomeFromMenu()}
          >
            Back
          </button>
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
