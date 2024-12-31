import { marked } from "marked";
import { Component, createResource, Match, Suspense, Switch } from "solid-js";
import classList, { ClassList } from "../Util/Classes";

const Md: Component<{ text: string; classList?: ClassList }> = (props) => {
  const [rawHtml] = createResource(() => marked.parse(props.text));
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Switch>
        <Match when={rawHtml.error || rawHtml() === undefined}>
          <p>Error rendering text.</p>
        </Match>
        <Match when={true}>
          {/* eslint-disable-next-line solid/no-innerhtml */}
          <div innerHTML={rawHtml()!} {...classList(props.classList)} />
        </Match>
      </Switch>
    </Suspense>
  );
};

export default Md;
