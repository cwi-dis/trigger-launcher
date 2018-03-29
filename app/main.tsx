import * as React from "react";
import { render } from "react-dom";

import "bulma/css/bulma.css";

import TriggerLauncher from "./components/trigger_launcher";

window.onload = () => {
  render(
    <TriggerLauncher />,
    document.getElementById("react")
  );
}
