import React from 'react';
import { createRoot } from 'react-dom/client';
import HomeScreen from './HomeScreen/homeScreen';
import CampaignScreen from './HomeScreen/CampaignScreen/campaignScreen';
import VisualizeSandbox from './Visualizer/VisualizeSandbox';
import VisualizeLevel from './Visualizer/VisualizeLevel';
import { setCurrentLevel } from './currentLevelHandling';
import { setHasShownTutorial, setTutorialHasEnded } from './actualLeveHandling';
import {
  setCurrentDialogueLineNumber,
  setHasDialogueEnded,
  setHasShownDialogueMenu,
} from './dialogueManager';

let inSandbox = false;
let appRoot = null;

function renderScreen(screen) {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Unable to render Dijkstra app: #root was not found.');
  }

  if (!appRoot) {
    appRoot = createRoot(rootElement);
  }

  appRoot.render(screen);
}

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
  renderScreen(
    <div className="App">
      <CampaignScreen></CampaignScreen>
    </div>
  );
}

// The Sandbox will be rendered
function EnterSandbox() {
  inSandbox = true;
  renderScreen(
    <div className="App">
      <VisualizeSandbox></VisualizeSandbox>
    </div>
  );
}

// The Level will be entered, and the currentLevel set to the levelNum
function EnterLevel(levelNum) {
  inSandbox = false;
  setCurrentLevel(levelNum);
  renderScreen(
    <div className="App">
      <VisualizeLevel></VisualizeLevel>
    </div>
  );
}

// The user wants to enter the home page from the sandbox or level
function EnterHome() {
  inSandbox = false;

  setHasShownDialogueMenu(false);
  setCurrentDialogueLineNumber(0);
  setTutorialHasEnded(false);
  setHasShownTutorial(false);
  setHasDialogueEnded(false);

  renderScreen(
    <div className="App">
      <HomeScreen></HomeScreen>
    </div>
  );
}

// The user wants to leave to the Home page, from the campaign screen
function EnterHomeFromMenu() {
  inSandbox = false;
  renderScreen(
    <div className="App">
      <HomeScreen></HomeScreen>
    </div>
  );
}

export {
  FirstStart,
  renderScreen,
  EnterCampaign,
  EnterSandbox,
  EnterHome,
  EnterHomeFromMenu,
  EnterLevel,
  inSandbox,
};
