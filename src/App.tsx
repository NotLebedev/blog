import { For, type Component } from "solid-js";
import { Books, Image, Question } from "phosphor-solid";

import styles from "./App.module.css";

const Header: Component = () => {
  return (
    <section class={styles.headerWrapper}>
      <header class={styles.header}>
        <a class={styles.blinkName} href="/" aria-label="@NotLebedev/Artemiy">
          <span class={styles.atName}>@NotLebedev</span>
          <span class={styles.normalName}> Artemiy</span>
        </a>
        <nav class={styles.headerNav} role="navigation">
          <ul>
            <li>
              <a href="/blog">
                <Books size={32} />
                Blog
              </a>
            </li>
            <li>
              <a href="/photo">
                <Image size={32} />
                Photo
              </a>
            </li>
            <li>
              <a href="/about">
                <Question size={32} />
                About
              </a>
            </li>
          </ul>
        </nav>
      </header>
    </section>
  );
};

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
