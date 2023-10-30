import React, { Component } from 'react';
import {
  allLevelNames,
  numLevels,
  allLevelIDs,
  getLevelName,
  getLevelDescription,
  getLevelRandomWallPresses,
  getLevelDifficulty,
  getLevelAllowedWalls,
  getLevelEndDistance,
} from '../../allLevelData';
import backgroundImagePath from '../../assets/mainbackground.png';
import { EnterHomeFromMenu, EnterLevel } from '../../Navigation';
import { numLevelsUnlocked } from '../../currentUserDataHandling';
import './campaignScreen.css';

export default class CampaignScreen extends Component {
  constructor() {
    super();
    this.state = {
      levelClicked: numLevelsUnlocked,
    };
  }

  getLevelButtons = (numLevels) => {
    const buttons = [];
    let levelName;

    for (let i = 1; i <= numLevels; i++) {
      let lastLevelUnlocked;
      let locked = false;
      levelName = allLevelNames[i - 1];
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
              {allLevelIDs[i - 1]}{' '}
            </div>
            <span
              style={
                i < 10 ? { marginLeft: '3.4rem' } : { marginLeft: '3.5rem' }
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
    if (numRandomWallPresses > 0) powerupMessage = 'Active';

    return (
      <div style={{ position: 'absolute', top: '50px' }}>
        <div>
          <div className="levelDescriptionContainer">
            <p className="levelDescription">{getLevelDescription(id)}</p>
          </div>
        </div>
        <div>
          <div
            className="infoContainer"
            style={{ top: '225px', left: '620px' }}
          >
            <span>
              <div className="levelInfoTag">Random Walls</div>
              <p className="infoText"> {powerupMessage}</p>
            </span>
          </div>
        </div>
        <div>
          <div
            className="infoContainer"
            style={{ top: '325px', left: '620px' }}
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
            style={{ top: '425px', left: '620px' }}
          >
            <span>
              <div className="levelInfoTag">End Distance</div>
              <span className="infoText">{getLevelEndDistance(id)}</span>
            </span>
          </div>
        </div>
        <div>
          <div
            className="infoContainer"
            style={{ top: '525px', left: '620px' }}
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
            width: '150%',
            height: '100%',
          }}
        ></div>

        <div className="imgbox">
          <img
            alt="test"
            className="center-fit"
            src={backgroundImagePath}
          ></img>
        </div>
        <div
          onClick={() => {}}
          style={{
            position: 'absolute',
            width: '150%',
            height: '100%',
            background: '#1a1717',
            opacity: '0.3',
            backdropFilter: 'blur(100px)',
            zIndex: '0',
          }}
        ></div>

        <div className="positioningLevelInfoClass">
          <div>
            <div className="levelContainer"></div>
            <div className="levelContainer2"></div>
            <p className="selectStageText">Select Stage</p>
          </div>
          <div style={{ position: 'absolute', top: '65px', left: '51px' }}>
            {this.getLevelButtons(numLevels)}
          </div>
          <div style={{ position: 'absolute', left: '-110px' }}>
            <div className="levelInfoContainer">
              <p className="levelNameToRender">
                {getLevelName(this.state.levelClicked - 1)}
              </p>
            </div>
            <div className="levelInfoContainer2">
              <button
                id="startLevelButton"
                onClick={() =>
                  EnterLevel(
                    document
                      .getElementsByClassName('levelButtonClicked')
                      .item(0).id
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
            {this.getLevelInfo(this.state.levelClicked - 1)}
          </div>
        </div>
      </>
    );
  }
}
