import React from "react";
import Visualizer from "./Visualizer/Visualizer";
import ReactDOM from "react-dom";
import { setCurrentLevel } from "./currentLevelHandling";

function EnterLevel(levelNum) {
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
export default EnterLevel;
