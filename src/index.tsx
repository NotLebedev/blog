/* @refresh reload */
import { render } from "solid-js/web";
import { lazy } from "solid-js";
import { Router, Route } from "@solidjs/router";

import "./index.css";
import App from "./App";

const Home = lazy(() => import("./Pages/Home"));
const ImageDetailed = lazy(() => import("./ImageDetailed"));
const NotFound = lazy(() => import("./Pages/NotFound"));

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(
  () => (
    <Router root={App}>
      <Route path="/" component={Home} />
      <Route path="/photo/:id" component={ImageDetailed} />
      <Route path="*" component={NotFound} />
    </Router>
  ),
  root!,
);
