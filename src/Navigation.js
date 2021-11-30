import React from "react";
import HomeScreen from "./HomeScreen/homeScreen";
import Visualizer from "./Visualizer/Visualizer";
import { setCurrentLevel } from "./currentLevelHandling";
import ReactDOM from "react-dom";
import CampaignScreen from "./HomeScreen/CampaignScreen/campaignScreen";

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
        <Visualizer></Visualizer>
      </div>
    </React.StrictMode>,
    document.getElementById("root")
  );
}

function EnterLevel(levelNum) {
  inSandbox = false;
  setCurrentLevel(levelNum);
  ReactDOM.render(
    <React.StrictMode>
      <div className="App">
        <Visualizer></Visualizer>
      </div>
    </React.StrictMode>,
    document.getElementById("root")
  );
}

function EnterHome() {
  inSandbox = false;
  ReactDOM.render(
    <React.StrictMode>
      <div className="App">
        <HomeScreen></HomeScreen>
      </div>
    </React.StrictMode>,
    document.getElementById("root")
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
    document.getElementById("root")
  );
}

export { inSandbox };
export { FirstStart, EnterCampaign, EnterHome, EnterLevel, EnterSandbox };
