import React from "react";
import ReactDOM from "react-dom";
import HomeScreen from "./HomeScreen/homeScreen";

function EnterHome() {
  ReactDOM.render(
    <React.StrictMode>
      <div className="App">
        <HomeScreen></HomeScreen>
      </div>
    </React.StrictMode>,
    document.getElementById("root")
  );
}
export default EnterHome;
