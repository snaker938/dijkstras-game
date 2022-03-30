import React, { Component } from 'react';
import testingImagePath from '../../assets/mainbackground.png';
import {
  allLevelNames,
  numLevels,
  allLevelIDs,
  getLevelName,
  getLevelDescription,
  getLevelRandomWallPresses,
  getLevelDifficulty,
  getLevelAllowedWalls,
  getLevelLives,
} from '../../allLevelData';
import { EnterLevel, EnterHomeFromMenu } from '../../Navigation';
import './campaignScreen.css';
import { numLevelsUnlocked } from '../../currentUserDataHandling';

export default class CampaignScreen extends Component {
  constructor() {
    super();
    this.state = {
      levelClicked: numLevelsUnlocked,
    };
    this.numLevels = numLevels;
    this.allLevelNames = allLevelNames;
    this.allLevelsIds = allLevelIDs;
  }

  getButtonsUsingForLoop = (numLevels) => {
    const buttons = [];
    let levelName;

    for (let i = 1; i <= numLevels; i++) {
      let lastLevelUnlocked;
      let locked = false;
      levelName = this.allLevelNames[i - 1];
      if (i === numLevelsUnlocked) {
        lastLevelUnlocked = true;
      } else {
        lastLevelUnlocked = false;
      }
      if (i > numLevelsUnlocked) {
        levelName = 'Locked';
        locked = true;
      }
      buttons.push(
        <button
          className={
            lastLevelUnlocked
              ? 'levelButtonClicked'
              : locked
              ? 'levelButtonLocked'
              : 'levelButtons'
          }
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
                i < 10 ? { marginLeft: '3.4rem' } : { marginLeft: '3.5rem' }
                // { marginLeft: '3rem' }
              }
            >
              {levelName}
            </span>
          </span>
        </button>
      );
    }

    return buttons;
  };

  showLevelInfo(levelID) {
    if (levelID > numLevelsUnlocked) return;
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
      <div style={{ position: 'absolute', top: '40px' }}>
        <div>
          <div className="levelDescriptionContainer">
            <p className="levelDescription">{getLevelDescription(id)}</p>
          </div>
        </div>
        <div>
          <div
            className="infoContainer"
            style={{ top: '350px', left: '620px' }}
          >
            <span>
              <div className="levelInfoTag">Powerups</div>
              <p className="infoText"> {powerupMessage}</p>
            </span>
          </div>
        </div>
        <div>
          <div
            className="infoContainer"
            style={{ top: '410px', left: '620px' }}
          >
            <span>
              <div className="levelInfoTag">Allowed Walls</div>
              <span className="infoText">{getLevelAllowedWalls(id)}</span>
            </span>
          </div>
        </div>
        <div>
          <div
            className="infoContainer"
            style={{ top: '470px', left: '620px' }}
          >
            <span>
              <div className="levelInfoTag">Lives</div>
              <span className="infoText">{getLevelLives(id)}</span>
            </span>
          </div>
        </div>
        <div>
          <div
            className="infoContainer"
            style={{ top: '530px', left: '620px' }}
          >
            <span>
              <div className="levelInfoTag">Difficulty</div>
              <span className="infoText"> {getLevelDifficulty(id)}</span>
            </span>
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
        <div className="imgbox">
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
