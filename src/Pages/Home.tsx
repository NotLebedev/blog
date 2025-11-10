import { Component } from "solid-js";
import Metas from "../Components/Metas";
import classList from "../Util/Classes";
import style from "./Home.module.css";
import ShaderBackground from "../Components/ShaderBackground";
import Card from "../Components/Card";

const Home: Component = () => {
  return (
    <>
      <Metas />
      <ShaderBackground />
      <Card {...classList(style.greetCard)}>
        <h1>NotLebedev</h1>
        <p>
          Welcome to my corner of internet. <br />
          Explore my work, art or learn more about me.
        </p>
      </Card>
    </>
  );
};

export default Home;
