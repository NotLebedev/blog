import {
  Accessor,
  Context,
  JSX,
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
import { MetaProvider } from "@solidjs/meta";

export type PageContext = { atTop: Accessor<boolean> };
const pageContext: Context<PageContext | undefined> = createContext();

export function usePageContext(): PageContext {
  return useContext(pageContext)!;
}

const Page: Component<{
  children?: JSX.Element;
  withHeader: boolean;
}> = (props) => {
  let topDetector!: HTMLDivElement;
  let endDetector!: HTMLDivElement;

  const [atTop, setAtTop] = createSignal(true);

  onMount(() => {
    new IntersectionObserver((entries) => {
      setAtTop(entries[0].isIntersecting);
    }).observe(topDetector);
  });

  return (
    <MetaProvider>
      <pageContext.Provider value={{ atTop: atTop }}>
        <div class={styles.positionDetector} ref={topDetector} />
        <Show when={props.withHeader}>
          <Header />
        </Show>
        <main>
          {props.children}
          <div class={styles.positionDetector} ref={endDetector} />
        </main>
        <Footer />
      </pageContext.Provider>
    </MetaProvider>
  );
};

const FullPage: Component<{ children?: JSX.Element }> = (props) => {
  return <Page children={props.children} withHeader={true} />;
};

const NoHeaderPage: Component<{ children?: JSX.Element }> = (props) => {
  return <Page children={props.children} withHeader={false} />;
};

export { FullPage, NoHeaderPage };
