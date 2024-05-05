/* @refresh reload */
import { render } from "solid-js/web";
import { lazy } from "solid-js";
import { Router, Route } from "@solidjs/router";

import "./index.css";
import App from "./App";
const ImageDetailed = lazy(() => import("./ImageDetailed"));

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(
  () => (
    <Router root={App}>
      <Route path="/images/:id" component={ImageDetailed} />
    </Router>
  ),
  root!,
);
