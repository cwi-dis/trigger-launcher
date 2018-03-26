import * as React from "react";
import { render } from "react-dom";

import "bulma/css/bulma.css";

window.onload = () => {
  render(
    <div>Hello World!</div>,
    document.getElementById("react")
  );
}
