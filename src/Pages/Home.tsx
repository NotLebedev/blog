import { Component } from "solid-js";
import DualText from "../Components/DualText";
import { Warning } from "phosphor-solid-js";

const Home: Component = () => {
  return (
    <>
      <h1>Welcome!</h1>
      <p>
        This is a personal website of{" "}
        <DualText default="@NotLebedev" alt="Artemiy" />, developer,
        photographer and a person interested in many other things.
      </p>
      <p>Posting my photos and thoughts on everything here (soon).</p>
      <h2>
        <Warning size={32} />
        Currently under construction
        <Warning size={32} />
      </h2>
    </>
  );
};

export default Home;
