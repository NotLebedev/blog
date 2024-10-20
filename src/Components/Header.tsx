import { Component, createSignal, onMount } from "solid-js";
import { Books, Image, List, Question } from "phosphor-solid-js";
import DualText from "./DualText";
import style from "./Header.module.css";
import createDropDown from "../Util/DropDown";
import Card from "./Card";

const Header: Component = () => {
  const [navList, setNavList] = createSignal<HTMLElement>();
  const [showDropDown, setShowDropDown] = createDropDown(navList);

  function hideDropDown() {
    setShowDropDown(false);
  }

  onMount(() => {
    window.addEventListener("resize", hideDropDown);
    document.addEventListener("scroll", hideDropDown);
  });

  return (
    <Card classList={{ [style.headerWrapper]: true }} narrow={true}>
      <header>
        <span class={style.header}>
          <a class={style.name} href="/">
            <DualText default="@NotLebedev" alt=" Artemiy" />
          </a>
          <div class={style.altNav}>
            <nav class={style.headerNav} role="navigation">
              <a class={style.navLink} href="/blog">
                <Books size={32} />
                <DualText default="Blog" alt="Read" />
              </a>
              <a class={style.navLink} href="/photo">
                <Image size={32} />
                <DualText default="Photo" alt="Watch" />
              </a>
              <a class={style.navLink} href="/about">
                <Question size={32} />
                <DualText default="About" alt="Learn" />
              </a>
            </nav>
            <div class={style.hamburgerMenu}>
              <button onClick={() => setShowDropDown(!showDropDown())}>
                <List size="32" />
              </button>
            </div>
          </div>
        </span>
        <nav
          classList={{ [style.dropDown]: true }}
          ref={setNavList}
          role="navigation"
          onClick={() => setShowDropDown(false)}
        >
          <a class={style.navLink} href="/blog">
            <Books size={32} />
            <DualText default="Blog" alt="Read" />
          </a>
          <a class={style.navLink} href="/photo">
            <Image size={32} />
            <DualText default="Photo" alt="Watch" />
          </a>
          <a class={style.navLink} href="/about">
            <Question size={32} />
            <DualText default="About" alt="Learn" />
          </a>
        </nav>
      </header>
    </Card>
  );
};

export default Header;
