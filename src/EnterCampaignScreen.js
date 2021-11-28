import React from "react";
import ReactDOM from "react-dom";
import CampaignScreen from "./HomeScreen/CampaignScreen/campaignScreen";

function EnterCampaign() {
  ReactDOM.render(
    <React.StrictMode>
      <div className="App">
        <CampaignScreen></CampaignScreen>
      </div>
    </React.StrictMode>,
    document.getElementById("root")
  );
}
export default EnterCampaign;
