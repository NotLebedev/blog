import { Component, createSignal, onMount } from "solid-js";
import { Books, Image, List, Question } from "phosphor-solid-js";
import DualText from "./DualText";
import styles from "./Header.module.css";

const Header: Component = () => {
  const [showDropDown, setShowDropDown] = createSignal(false);

  function hideDropDown() {
    setShowDropDown(false);
  }

  onMount(() => {
    window.addEventListener("resize", hideDropDown);
    document.addEventListener("scroll", hideDropDown);
  });

  return (
    <section class={styles.headerWrapper}>
      <header>
        <span class={styles.header}>
          <a class={styles.name} href="/">
            <DualText default="@NotLebedev" alt=" Artemiy" />
          </a>
          <div class={styles.altNav}>
            <nav class={styles.headerNav} role="navigation">
              <a class={styles.navLink} href="/blog">
                <Books size={32} />
                <DualText default="Blog" alt="Read" />
              </a>
              <a class={styles.navLink} href="/photo">
                <Image size={32} />
                <DualText default="Photo" alt="Watch" />
              </a>
              <a class={styles.navLink} href="/about">
                <Question size={32} />
                <DualText default="About" alt="Learn" />
              </a>
            </nav>
            <div class={styles.hamburgerMenu}>
              <button onClick={() => setShowDropDown(!showDropDown())}>
                <List size="32" />
              </button>
            </div>
          </div>
        </span>
        <nav
          classList={{ [styles.dropDown]: true, [styles.show]: showDropDown() }}
          role="navigation"
          onClick={() => setShowDropDown(false)}
        >
          <a class={styles.navLink} href="/blog">
            <Books size={32} />
            <DualText default="Blog" alt="Read" />
          </a>
          <a class={styles.navLink} href="/photo">
            <Image size={32} />
            <DualText default="Photo" alt="Watch" />
          </a>
          <a class={styles.navLink} href="/about">
            <Question size={32} />
            <DualText default="About" alt="Learn" />
          </a>
        </nav>
      </header>
    </section>
  );
};

export default Header;
