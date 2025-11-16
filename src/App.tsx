import {
  Accessor,
  Context,
  JSX,
  Show,
  createContext,
  useContext,
  type Component,
} from "solid-js";
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
  return (
    <MetaProvider>
      <Show when={props.withHeader}>
        <Header />
      </Show>
      <main>{props.children}</main>
      <Footer />
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
