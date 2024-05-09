import { For, type Component, onMount, onCleanup } from "solid-js";
import { Books, Image, Question } from "phosphor-solid";

import styles from "./App.module.css";
import DualText from "./Components/DualText";

const Header: Component = () => {
  let wrapperRef: HTMLElement | undefined = undefined;

  let lastScroll = 0;
  function handleScroll() {
    const currentScroll = window.scrollY;
    const elementHeight = wrapperRef!.clientHeight;
    wrapperRef!.style.top =
      currentScroll > lastScroll ? `${-elementHeight}px` : "0";
    lastScroll = currentScroll;
  }

  onMount(() => {
    document.addEventListener("scroll", handleScroll);
  });

  onCleanup(() => {
    document.removeEventListener("scroll", handleScroll);
  });

  return (
    <section ref={wrapperRef!} class={styles.headerWrapper}>
      <header class={styles.header}>
        <a class={styles.name} href="/">
          <DualText default="@NotLebedev" alt=" Artemiy" />
        </a>
        <nav class={styles.headerNav} role="navigation">
          <ul>
            <li>
              <a href="/blog">
                <Books size={32} />
                <DualText default="Blog" alt="Read" />
              </a>
            </li>
            <li>
              <a href="/photo">
                <Image size={32} />
                <DualText default="Photo" alt="Watch" />
              </a>
            </li>
            <li>
              <a href="/about">
                <Question size={32} />
                <DualText default="About" alt="Learn" />
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
