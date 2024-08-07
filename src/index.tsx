/* @refresh reload */
import { render } from "solid-js/web";
import { lazy } from "solid-js";
import { Router, Route } from "@solidjs/router";

import "./index.css";
import { FullPage, NoHeaderPage } from "./App";

const Home = lazy(() => import("./Pages/Home"));
const Photo = lazy(() => import("./Pages/Photo"));
const ImageDetailed = lazy(() => import("./Pages/PhotoDetailed"));
const Blog = lazy(() => import("./Pages/Blog"));
const About = lazy(() => import("./Pages/About"));
const NotFound = lazy(() => import("./Pages/NotFound"));

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(
  () => (
    <Router>
      <Route
        // path="/"
        component={FullPage}
        children={
          <>
            <Route path="/" component={Home} />
            <Route path="/photo" component={Photo} />
            <Route path="/blog" component={Blog} />
            <Route path="/about" component={About} />
            <Route path="*" component={NotFound} />
          </>
        }
      />
      <Route
        // path="/"
        component={NoHeaderPage}
        children={
          <>
            <Route
              path="/photo/:id"
              component={ImageDetailed}
              info={{ noHeader: true }}
            />
          </>
        }
      />
    </Router>
  ),
  root!,
);
