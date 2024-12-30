import { Component, ComponentProps } from "solid-js";

import styles from "./Link.module.css";
import classList from "../Util/Classes";

const Link: Component<Omit<ComponentProps<"a">, "class">> = (props) => {
  return <a {...props} {...classList(styles.link, props.classList)} />;
};

export default Link;
