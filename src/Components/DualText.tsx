import { Component } from "solid-js";

import styles from "./DualText.module.css";

const DualText: Component<{ default: string; alt: string }> = (props) => {
  const ariaLabel = `${props.default}/${props.alt}`;
  return (
    <div class={styles.container} aria-label={ariaLabel}>
      <span class={styles.default}>{props.default}</span>
      <span class={styles.alt}>{props.alt}</span>
    </div>
  );
};

export default DualText;
