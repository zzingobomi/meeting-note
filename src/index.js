import React from "react";
import ReactDOM from "react-dom";
import { RecoilRoot } from "recoil";
import App from "components/App";
import "./i18n";
import "./style.scss";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

ReactDOM.render(
  <RecoilRoot>
    <App />
  </RecoilRoot>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
