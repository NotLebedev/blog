import { type Component } from "solid-js";

import styles from "./App.module.css";
import Header from "./Components/Header";

const Content: Component<{ children?: any }> = (props) => {
  return <main class={styles.content}>{props.children}</main>;
};

const App: Component<{ children?: any }> = (props) => {
  return (
    <div class={styles.App}>
      <Header />
      <Content children={props.children} />
    </div>
  );
};

export default App;
