import { Component } from "solid-js";

const NotFound: Component = () => {
  return (
    <>
      <h1>This page does not exist</h1>
      <p>
        You should <a href="/">go home</a>.
      </p>
    </>
  );
};

export default NotFound;
