import { Accessor, createEffect, createSignal, Setter } from "solid-js";

function createDropDown<ELEMENT extends HTMLElement>(
  element: Accessor<ELEMENT | undefined>,
): [Accessor<boolean>, Setter<boolean>] {
  const [expand, setExpand] = createSignal(false);

  createEffect(() => {
    const el = element();
    if (el === undefined) {
      return;
    }
    if (expand()) {
      el.style.maxHeight = `${el.scrollHeight}px`;
    } else {
      el.style.maxHeight = "";
    }
  });

  return [expand, setExpand];
}

export default createDropDown;
