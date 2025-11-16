import { Component } from "solid-js";
import Metas from "../Components/Metas";
import classList from "../Util/Classes";
import style from "./Home.module.css";
import ShaderBackground from "../Components/ShaderBackground";
import { HorizontalNav, VerticalNav } from "../Components/Nav";

const Home: Component = () => {
  return (
    <>
      <Metas />
      <ShaderBackground />
      <div {...classList(style.greetCard)}>
        <h1>NotLebedev</h1>
        <div>
          <HorizontalNav {...classList(style.horizontalNav)} />
          <VerticalNav {...classList(style.verticalNav)} />
        </div>
      </div>
    </>
  );
};

export default Home;
