import { Component } from "solid-js";

import style from "./Footer.module.css";

const copyrightSince = 2024;

const Footer: Component = () => {
  const currentYear = new Date().getFullYear();
  const copyrightYear =
    currentYear == copyrightSince
      ? `${currentYear}`
      : `${copyrightSince}-${currentYear}`;

  return (
    <footer class={style.footer}>
      <p>&copy;{copyrightYear}, @NotLebedev, All Rights Reserved</p>
    </footer>
  );
};

export default Footer;
