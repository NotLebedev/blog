import { Component } from "solid-js";
import Metas from "../Components/Metas";

const NotFound: Component = () => {
  return (
    <>
      <Metas title="404" />
      <h1>This page does not exist</h1>
      <p>
        You should <a href="/">go home</a>.
      </p>
    </>
  );
};

export default NotFound;
