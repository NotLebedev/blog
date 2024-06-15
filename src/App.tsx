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

export type PageContext =
  | { atTop: Accessor<boolean>; atEnd: Accessor<Boolean> }
  | undefined;
const pageContext: Context<PageContext> = createContext();

export function usePageContext(): PageContext {
  return useContext(pageContext);
}

const Page: Component<{ children?: any; withHeader: boolean }> = (props) => {
  let topDetector: HTMLElement | undefined = undefined;
  let endDetector: HTMLElement | undefined = undefined;

  const [atTop, setAtTop] = createSignal(true);
  const [atEnd, setAtEnd] = createSignal(true);

  onMount(() => {
    new IntersectionObserver((entries) => {
      setAtTop(entries[0].isIntersecting);
    }).observe(topDetector!);
    new IntersectionObserver((entries) => {
      setAtEnd(entries[0].isIntersecting);
    }).observe(endDetector!);
  });

  return (
    <pageContext.Provider value={{ atTop: atTop, atEnd: atEnd }}>
      <div class={styles.App}>
        <Show when={props.withHeader}>
          <Header />
        </Show>
        <div class={styles.positionDetector} ref={topDetector} />
        <Show when={props.withHeader}>
          <div class={styles.headerReservedSpace} />
        </Show>
        <main class={styles.content}>
          {props.children}
          <div class={styles.positionDetector} ref={endDetector} />
        </main>
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
