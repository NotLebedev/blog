import { Component } from "solid-js";
import Metas from "../Components/Metas";
import classList from "../Util/Classes";
import style from "./Home.module.css";
import ShaderBackground from "../Components/ShaderBackground";
import Card from "../Components/Card";
import { DesktopNav, MobileNav } from "../Components/Nav";

const Home: Component = () => {
  return (
    <>
      <Metas />
      <ShaderBackground />
      <Card {...classList(style.greetCard)}>
        <h1>NotLebedev</h1>
        <div>
          <DesktopNav {...classList(style.horizontalNav)} />
          <MobileNav {...classList(style.verticalNav)} />
        </div>
      </Card>
    </>
  );
};

export default Home;
