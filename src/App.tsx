import type { JSX, Component } from 'solid-js';

import logo from './logo.svg';
import styles from './App.module.css';

const App: Component<{name: string}> = (props) => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <p>Hello, {props.name}!</p>
        <img src={logo} class={styles.logo} alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          class={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
      </header>
    </div>
  );
};

export default App;
