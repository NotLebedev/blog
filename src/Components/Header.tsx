import { Component, createSignal, onMount } from "solid-js";
import { Books, Image, List, Question } from "phosphor-solid-js";
import style from "./Header.module.css";
import createDropDown from "../Util/DropDown";
import Card from "./Card";
import classList from "../Util/Classes";
import { useLocation, Location } from "@solidjs/router";

function activePath(location: Location<unknown>): number {
  switch (location.pathname.split("/").at(1) ?? "") {
    case "blog":
      return 0;
    case "photo":
      return 1;
    case "about":
      return 2;
    default:
      return 0;
  }
}

type Icon = Component<{ size: number }>;
function makeNavLink(name: string, href: string, icon: Icon) {
  const Icon = icon;
  return () => (
    <a class={style.navLink} href={href}>
      <Icon size={32} />
      {name}
    </a>
  );
}

const Blog: Component = makeNavLink("Blog", "/blog", Books as Icon);
const Photo: Component = makeNavLink("Photo", "/photo", Image as Icon);
const About: Component = makeNavLink("About", "/about", Question as Icon);

const Header: Component = () => {
  const [navList, setNavList] = createSignal<HTMLElement>();
  const [showDropDown, setShowDropDown] = createDropDown(navList);
  const location = useLocation();

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
            <nav class={style.headerNav} role="navigation">
              <Blog />
              <Photo />
              <About />
              <span
                class={style.navFocus}
                style={{ "--index": activePath(location) }}
              />
            </nav>
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
          <Blog />
          <Photo />
          <About />
        </nav>
      </header>
    </Card>
  );
};

export default Header;
