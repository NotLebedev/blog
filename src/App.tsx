import type { Component } from "solid-js";

import styles from "./App.module.css";

const App: Component<{ children?: any }> = (props) => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <p>Hello, World!</p>
        <nav>
          <a href="/" style={{ "margin-right": "10px" }}>
            Home
          </a>
          <a href="/images/capitol-bw">One</a>
        </nav>
        {props.children}
      </header>
    </div>
  );
};

export default App;
