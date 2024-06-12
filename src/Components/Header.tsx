import { Component, onCleanup, onMount } from "solid-js";
import { Books, Image, Question } from "phosphor-solid-js";
import DualText from "./DualText";
import styles from "./Header.module.css";

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

export default Header;
