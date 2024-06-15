import {
  Accessor,
  Context,
  Show,
  createContext,
  createSignal,
  onMount,
  useContext,
  type Component,
} from "solid-js";

import styles from "./App.module.css";
import Header from "./Components/Header";
import Footer from "./Components/Footer";

export type PageContext = { atTop: Accessor<boolean> } | undefined;
const pageContext: Context<PageContext> = createContext();

export function usePageContext(): PageContext {
  return useContext(pageContext);
}

const Page: Component<{ children?: any; withHeader: boolean }> = (props) => {
  let topDetectorRef: HTMLElement | undefined = undefined;

  const [atTop, setAtTop] = createSignal(true);

  onMount(() => {
    new IntersectionObserver((entries) => {
      setAtTop(entries[0].isIntersecting);
    }).observe(topDetectorRef!);
  });

  return (
    <pageContext.Provider value={{ atTop: atTop }}>
      <div class={styles.App}>
        <Show when={props.withHeader}>
          <Header />
        </Show>
        <div class={styles.positionDetector} ref={topDetectorRef} />
        <Show when={props.withHeader}>
          <div class={styles.headerReservedSpace} />
        </Show>
        <main class={styles.content}>{props.children}</main>

        <Footer />
      </div>
    </pageContext.Provider>
  );
};

const FullPage: Component<{ children?: any }> = (props) => {
  return <Page children={props.children} withHeader={true} />;
};

const NoHeaderPage: Component<{ children?: any }> = (props) => {
  return <Page children={props.children} withHeader={false} />;
};

export { FullPage, NoHeaderPage };
