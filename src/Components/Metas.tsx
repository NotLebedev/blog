import { Meta, Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { Component, Show } from "solid-js";

const Metas: Component<{ title?: string; preview?: string }> = (props) => {
  const titlePrefix = "@NotLebedev";

  const url = useLocation().pathname;
  const title = () =>
    titlePrefix + (props.title !== undefined ? "|" + props.title : "");

  return (
    <>
      <Title>{title()}</Title>
      <Meta property="og:title" content={title()} />
      <Meta property="twitter:title" content={title()} />

      <Show when={props.preview !== undefined}>
        <Meta property="og:image" content={props.preview} />
        <Meta property="twiter:image" content={props.preview} />
        <Meta name="twitter:card" content="summary_large_image" />
      </Show>

      <Meta property="og:type" content="website" />

      <Meta property="og:url" content={url} />
      <Meta property="twitter:url" content={url} />

      <Meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />
      <Meta name="HandheldFriendly" content="true" />
    </>
  );
};

export default Metas;
