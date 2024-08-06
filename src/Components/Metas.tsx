import { Meta, Title } from "@solidjs/meta";
import { Component, Match, Show, Switch } from "solid-js";

const Metas: Component<{ title?: string; preview?: string }> = (props) => {
  const titlePrefix = "@NotLebedev";
  return (
    <>
      <Switch>
        <Match when={props.title !== undefined}>
          <Title>
            {titlePrefix}
            {" | "}
            {props.title}
          </Title>
          <Meta property="og:title" content={titlePrefix + "|" + props.title} />
        </Match>
        <Match when={true}>
          <Title>{titlePrefix}</Title>
          <Meta property="og:title" content={titlePrefix} />
        </Match>
      </Switch>
      <Show when={props.preview !== undefined}>
        <Meta property="og:image" content={props.preview} />
      </Show>
    </>
  );
};

export default Metas;
