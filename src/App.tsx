import {
  Accessor,
  Context,
  JSX,
  ParentComponent,
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
  withFooter: boolean;
}> = (props) => {
  return (
    <MetaProvider>
      <Show when={props.withHeader}>
        <Header />
      </Show>
      <main>{props.children}</main>
      <Show when={props.withFooter}>
        <Footer />
      </Show>
    </MetaProvider>
  );
};

const FullPage: Component<{ children?: JSX.Element }> = (props) => {
  return <Page children={props.children} withHeader={true} withFooter={true} />;
};

const NoHeaderPage: Component<{ children?: JSX.Element }> = (props) => {
  return (
    <Page children={props.children} withHeader={false} withFooter={true} />
  );
};

const EmptyPage: ParentComponent = (props) => {
  return (
    <Page children={props.children} withHeader={false} withFooter={false} />
  );
};

export { FullPage, NoHeaderPage, EmptyPage };
