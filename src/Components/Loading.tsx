import { CircleNotch } from "phosphor-solid-js";
import { Component } from "solid-js";
import style from "./Loading.module.css";

const Loading: Component = () => {
  return <CircleNotch class={style.spinner} size="5rem" />;
};

export default Loading;
