import { Component } from "solid-js";
import DualText from "../Components/DualText";
import UnderConstruction from "../Components/UnderConstruction";
import Metas from "../Components/Metas";

const Home: Component = () => {
  return (
    <>
      <Metas />
      <h1>Welcome!</h1>
      <p>
        This is a personal website of{" "}
        <DualText default="@NotLebedev" alt="Artemiy" />, developer,
        photographer and a person interested in many other things.
      </p>
      <p>Posting my photos and thoughts on everything here (soon).</p>
      <UnderConstruction />
    </>
  );
};

export default Home;
