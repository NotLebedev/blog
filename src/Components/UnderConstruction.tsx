import { Barricade } from "phosphor-solid-js";
import { Component } from "solid-js";

const UnderConstruction: Component = () => {
  return (
    <h2>
      <Barricade size="36" />
      Currently under construction
    </h2>
  );
};

export default UnderConstruction;
