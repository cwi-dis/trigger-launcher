import * as React from "react";
import { render } from "react-dom";

import "bulma/css/bulma.css";
import "./css/style.css";

import App from "./components/app";

window.onload = () => {
  render(
    <App />,
    document.getElementById("react")
  );
};
