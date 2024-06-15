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

const Content: Component<{ children?: any }> = (props) => {
  let topDetectorRef: HTMLElement | undefined = undefined;
  const [atTop, setAtTop] = createSignal(true);

  const topObserver = new IntersectionObserver((entries) => {
    setAtTop(entries[0].isIntersecting);
  });

  onMount(() => {
    topObserver.observe(topDetectorRef!);
  });

  return (
    <main class={styles.content}>
      <div class={styles.topDetector} ref={topDetectorRef} />
      <div class={styles.headerReservedSpace} />
      <pageContext.Provider value={{ atTop: atTop }}>
        {props.children}
      </pageContext.Provider>
    </main>
  );
};

export function usePageContext(): PageContext {
  return useContext(pageContext);
}

const App: Component<{ children?: any }> = (props) => {
  return (
    <div class={styles.App}>
      <Header />
      <Content children={props.children} />
      <Footer />
    </div>
  );
};

export default App;
