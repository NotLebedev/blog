import { For, type Component } from "solid-js";

import styles from "./App.module.css";
import Header from "./Components/Header";

const Content: Component<{ children?: any }> = (props) => {
  return (
    <main class={styles.content}>
      {props.children}
      <For each={[...Array(100).keys()]}>
        {(item, index) => {
          return <p>Cock</p>;
        }}
      </For>
    </main>
  );
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
