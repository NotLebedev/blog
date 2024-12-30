import { Component } from "solid-js";

import style from "./Footer.module.css";
import Link from "./Link";

const copyrightSince = 2024;

const Footer: Component = () => {
  const currentYear = new Date().getFullYear();
  const copyrightYear =
    currentYear == copyrightSince
      ? `${currentYear}`
      : `${copyrightSince}-${currentYear}`;

  return (
    <footer class={style.footer}>
      <p>
        &copy; {copyrightYear} NotLebedev
        <br />
        <Link href="https://creativecommons.org/licenses/by-nc/4.0/?ref=chooser-v1">
          CC BY-NC 4.0
        </Link>
      </p>
    </footer>
  );
};

export default Footer;
