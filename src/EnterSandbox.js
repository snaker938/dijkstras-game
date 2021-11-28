import React from "react";
import Visualizer from "./Visualizer/Visualizer";
import ReactDOM from "react-dom";

// function App() {
//   console.log("hello!");
//   return (
//     <div className="App">
//       <Visualizer></Visualizer>
//     </div>
//   );
// }

function EnterSandBox() {
  ReactDOM.render(
    <React.StrictMode>
      <div className="App">
        <Visualizer></Visualizer>
      </div>
    </React.StrictMode>,
    document.getElementById("root")
  );
}
export default EnterSandBox;
