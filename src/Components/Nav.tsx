import { Component } from "solid-js";
import style from "./Nav.module.css";
import { Books, Image, Question } from "phosphor-solid-js";
import classList, { ClassList } from "../Util/Classes";
import { useLocation } from "@solidjs/router";

function activePath(): number | undefined {
  const location = useLocation();

  switch (location.pathname.split("/").at(1) ?? "") {
    case "blog":
      return 0;
    case "photo":
      return 1;
    case "about":
      return 2;
    default:
      return undefined;
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

const DesktopNav: Component<{ classList?: ClassList }> = (props) => {
  return (
    <nav {...classList(style.headerNav, props.classList)} role="navigation">
      <Blog />
      <Photo />
      <About />
      <span
        class={style.navFocus}
        style={{
          "--index": activePath(),
          "--show": activePath() === undefined ? undefined : 1,
        }}
      />
    </nav>
  );
};

export { DesktopNav };
