import { Component, createSignal, onMount } from "solid-js";
import { List } from "phosphor-solid-js";
import style from "./Header.module.css";
import createDropDown from "../Util/DropDown";
import Card from "./Card";
import classList from "../Util/Classes";
import { DesktopNav } from "./Nav";

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
    <Card {...classList(style.headerWrapper)} narrow={true}>
      <header>
        <span class={style.header}>
          <a class={style.name}>NotLebedev</a>
          <div class={style.altNav}>
            <DesktopNav {...classList(style.headerNav)} />
            <div class={style.hamburgerMenu}>
              <button onClick={() => setShowDropDown(!showDropDown())}>
                <List size="32" />
              </button>
            </div>
          </div>
        </span>
        <nav
          {...classList(style.dropDown)}
          ref={setNavList}
          role="navigation"
          onClick={() => setShowDropDown(false)}
        >
          {/*<Blog />
          <Photo />
          <About />*/}
        </nav>
      </header>
    </Card>
  );
};

export default Header;
