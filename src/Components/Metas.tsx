import { Meta, Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { Component, Show } from "solid-js";

const Metas: Component<{ title?: string; preview?: string }> = (props) => {
  const titlePrefix = "NotLebedev";

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

      {/* These metas disable pinch-zooming to avoid
        wierdness with image viewer and whatnot. Also mobile
        viewport resize behavior is configured according to
        https://developer.chrome.com/blog/viewport-resize-behavior?hl=en
        to prevent layout shifting when bars, keyboards and other
        overlays may appear */}
      <Meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, interactive-widget=resizes-visual"
      />
      <Meta name="HandheldFriendly" content="true" />
    </>
  );
};

export default Metas;
