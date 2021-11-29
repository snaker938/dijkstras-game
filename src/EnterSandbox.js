import React from "react";
import Visualizer from "./Visualizer/Visualizer";
import ReactDOM from "react-dom";

function EnterSandbox() {
  ReactDOM.render(
    <React.StrictMode>
      <div className="App">
        <Visualizer></Visualizer>
      </div>
    </React.StrictMode>,
    document.getElementById("root")
  );
}
export default EnterSandbox;
