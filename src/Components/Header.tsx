import { Component, createSignal, onMount } from "solid-js";
import { List } from "phosphor-solid-js";
import style from "./Header.module.css";
import createDropDown from "../Util/DropDown";
import Card from "./Card";
import classList, { ClassList } from "../Util/Classes";
import { HorizontalNav, VerticalNav } from "./Nav";

const Header: Component<{ classList?: ClassList }> = (props) => {
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
    <header>
      <Card {...classList(style.headerWrapper, props.classList)} narrow={true}>
        <span class={style.header}>
          <a class={style.name} href="/">
            NotLebedev
            <span class={style.nameUnderline} />
          </a>
          <div class={style.altNav}>
            <HorizontalNav {...classList(style.headerNav)} />
            <div class={style.hamburgerMenu}>
              <button onClick={() => setShowDropDown(!showDropDown())}>
                <List size="32" />
              </button>
            </div>
          </div>
        </span>
        <VerticalNav
          {...classList(style.verticalNav)}
          ref={setNavList}
          onClick={() => setShowDropDown(false)}
        />
      </Card>
    </header>
  );
};

export default Header;
