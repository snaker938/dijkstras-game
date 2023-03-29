import React from 'react';
import ReactDOM from 'react-dom';
import HomeScreen from './HomeScreen/homeScreen';
import CampaignScreen from './HomeScreen/CampaignScreen/campaignScreen';
import VisualizeSandbox from './Visualizer/VisualizeSandbox';
import VisualizeLevel from './Visualizer/VisualizeLevel';
import { setCurrentLevel } from './currentLevelHandling';
import {
  setHasShownTutorial,
  setTutorialHasEnded,
  toggleHasShownTutorial,
} from './actualLeveHandling';
import {
  setCurrentDialogueLineNumber,
  setHasDialogueEnded,
  setHasShownDialogueMenu,
} from './dialogueManager';

let inSandbox = false;

// The Home Screen will be rendered on every launch/restart
function FirstStart() {
  inSandbox = false;
  return (
    <div className="firstStart">
      <HomeScreen></HomeScreen>
    </div>
  );
}

function EnterCampaign() {
  inSandbox = false;
  ReactDOM.render(
    <React.StrictMode>
      <div className="App">
        <CampaignScreen></CampaignScreen>
      </div>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

// The Sandbox will be rendered
function EnterSandbox() {
  inSandbox = true;
  ReactDOM.render(
    <React.StrictMode>
      <div className="App">
        <VisualizeSandbox></VisualizeSandbox>
      </div>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

// The Level will be entered, and the currentLevel set to the levelNum
function EnterLevel(levelNum) {
  inSandbox = false;
  setCurrentLevel(levelNum);
  ReactDOM.render(
    <React.StrictMode>
      <div className="App">
        <VisualizeLevel></VisualizeLevel>
      </div>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

// The user wants to enter the home page from the sandbox or level
function EnterHome(animatingPlane) {
  const button = document.getElementById('homeButton');
  const classes = button.classList;

  // Makes sure the user cannot enter the home page which animations are playing
  if (classes.contains('enabled') && !animatingPlane) {
    inSandbox = false;

    setHasShownDialogueMenu(false);
    setCurrentDialogueLineNumber(0);
    setTutorialHasEnded(false);
    setHasShownTutorial(false);
    setHasDialogueEnded(false);

    ReactDOM.render(
      <React.StrictMode>
        <div className="App">
          <HomeScreen></HomeScreen>
        </div>
      </React.StrictMode>,
      document.getElementById('root')
    );
  } else {
  }
}

// The user wants to leave to the Home page, from the campaign screen
function EnterHomeFromMenu() {
  inSandbox = false;
  ReactDOM.render(
    <React.StrictMode>
      <div className="App">
        <HomeScreen></HomeScreen>
      </div>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

export {
  FirstStart,
  EnterCampaign,
  EnterSandbox,
  EnterHome,
  EnterHomeFromMenu,
  EnterLevel,
  inSandbox,
};
