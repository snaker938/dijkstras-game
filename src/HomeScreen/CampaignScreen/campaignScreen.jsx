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
    this.selectedLevelButtonRef = React.createRef();
  }

  componentDidMount() {
    this.scrollSelectedLevelIntoView();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.levelClicked !== this.state.levelClicked) {
      this.scrollSelectedLevelIntoView();
    }
  }

  scrollSelectedLevelIntoView = () => {
    if (!this.selectedLevelButtonRef.current) return;

    this.selectedLevelButtonRef.current.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    });
  };

  getLevelButtons = (numLevels) => {
    const buttons = [];
    let levelName;

    for (let i = 1; i <= numLevels; i++) {
      let locked = false;
      levelName = allLevelNames[i - 1];
      if (i > numLevelsUnlocked) {
        levelName = 'Locked';
        locked = true;
      }

      const selected = i === this.state.levelClicked;

      buttons.push(
        <button
          type="button"
          className={
            selected
              ? 'levelButtonClicked'
              : locked
              ? 'levelButtonLocked'
              : 'levelButtons'
          }
          disabled={locked}
          aria-pressed={selected}
          id={i}
          ref={selected ? this.selectedLevelButtonRef : null}
          onClick={() => this.showLevelInfo(i)}
          key={i}
        >
          <span className="levelButtonContent">
            <span className="levelButtonId">{allLevelIDs[i - 1]}</span>
            <span className="levelButtonName">
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
    this.setState({ levelClicked: levelID });
  }

  getLevelInfo(id) {
    let numRandomWallPresses = getLevelRandomWallPresses(id);
    let powerupMessage = 'None';
    if (numRandomWallPresses > 0) powerupMessage = 'Active';

    return (
      <div className="levelInfoBody">
        <div className="levelDescriptionContainer">
          <p className="levelDescription">{getLevelDescription(id)}</p>
        </div>
        <div className="levelInfoRows">
          <div className="infoContainer">
            <div className="levelInfoTag">Random Walls</div>
            <p className="infoText">{powerupMessage}</p>
          </div>
          <div className="infoContainer">
            <div className="levelInfoTag">Allowed Walls</div>
            <span className="infoText">{getLevelAllowedWalls(id)}</span>
          </div>
          <div className="infoContainer">
            <div className="levelInfoTag">End Distance</div>
            <span className="infoText">{getLevelEndDistance(id)}</span>
          </div>
          <div className="infoContainer">
            <div className="levelInfoTag">Difficulty</div>
            <span className="infoText">{getLevelDifficulty(id)}</span>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="campaignScreenRoot">
        <div
          style={{
            backgroundColor: 'rgb(187, 211, 223)',
            position: 'absolute',
            top: '0',
            right: '0',
            bottom: '0',
            left: '0',
            width: '100%',
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
            top: '0',
            right: '0',
            bottom: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: '#1a1717',
            opacity: '0.3',
            backdropFilter: 'blur(100px)',
            zIndex: '0',
          }}
        ></div>

        <div className="positioningLevelInfoClass">
          <div className="campaignStagePanel">
            <div className="levelContainer"></div>
            <div className="levelContainer2"></div>
            <p className="selectStageText">Select Stage</p>
            <div className="levelButtonList">{this.getLevelButtons(numLevels)}</div>
          </div>
          <div className="campaignDetailsPanel">
            <div className="levelInfoContainer">
              <p className="levelNameToRender">
                {getLevelName(this.state.levelClicked - 1)}
              </p>
            </div>
            <div className="levelInfoContainer2">
              {this.getLevelInfo(this.state.levelClicked - 1)}
              <div className="campaignActionRow">
                <button
                  id="startLevelButton"
                  onClick={() =>
                    EnterLevel(this.state.levelClicked)
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}
