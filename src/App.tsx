import {
  Accessor,
  Context,
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

const Content: Component<{
  children?: any;
  topDetectorRef: HTMLElement | undefined;
}> = (props) => {
  const [atTop, setAtTop] = createSignal(true);

  const topObserver = new IntersectionObserver((entries) => {
    setAtTop(entries[0].isIntersecting);
  });

  onMount(() => {
    topObserver.observe(props.topDetectorRef!);
  });

  return (
    <main class={styles.content}>
      <pageContext.Provider value={{ atTop: atTop }}>
        {props.children}
      </pageContext.Provider>
    </main>
  );
};

export function usePageContext(): PageContext {
  return useContext(pageContext);
}

const FullPage: Component<{ children?: any }> = (props) => {
  let topDetectorRef: HTMLElement | undefined = undefined;
  return (
    <div class={styles.App}>
      <Header />
      <div class={styles.topDetector} ref={topDetectorRef} />
      <div class={styles.headerReservedSpace} />
      <Content children={props.children} topDetectorRef={topDetectorRef} />
      <Footer />
    </div>
  );
};

const NoHeaderPage: Component<{ children?: any }> = (props) => {
  let topDetectorRef: HTMLElement | undefined = undefined;
  return (
    <div class={styles.App}>
      <div class={styles.topDetector} ref={topDetectorRef} />
      <Content children={props.children} topDetectorRef={topDetectorRef} />
      <Footer />
    </div>
  );
};

export { FullPage, NoHeaderPage };
