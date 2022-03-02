import React from 'react';
import HomeScreen from './HomeScreen/homeScreen';
import { setCurrentLevel } from './currentLevelHandling';
import ReactDOM from 'react-dom';
import CampaignScreen from './HomeScreen/CampaignScreen/campaignScreen';
import VisualizeLevel from './Visualizer/VisualizeLevel';
import VisualizeSandbox from './Visualizer/VisualizeSandbox';

let inSandbox = false;

function FirstStart() {
  inSandbox = false;
  return (
    <div className="firstStart">
      <HomeScreen></HomeScreen>
    </div>
  );
}

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

function EnterLevel(levelNum) {
  console.log('Trying to enter level ', levelNum);
  inSandbox = false;
  setCurrentLevel(levelNum);
  ReactDOM.render(
    <React.StrictMode>
      <div className="App">
        <VisualizeLevel />
      </div>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

function EnterHome() {
  inSandbox = false;
  const button = document.getElementById('homeButton');
  const classes = button.classList;
  if (classes.contains('enabled')) {
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

export { inSandbox };
export {
  FirstStart,
  EnterCampaign,
  EnterHome,
  EnterLevel,
  EnterSandbox,
  EnterHomeFromMenu,
};
