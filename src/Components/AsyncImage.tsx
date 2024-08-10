import {
  Component,
  ErrorBoundary,
  JSX,
  Match,
  Switch,
  createResource,
} from "solid-js";

async function fetchImageBlob(src: string): Promise<string | undefined> {
  const response = await fetch(src);
  if (response.ok) {
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } else {
    return undefined;
  }
}

const AsyncImage: Component<{
  src: string;
  ref?: HTMLImageElement | undefined;
  style?: JSX.CSSProperties;
}> = (props) => {
  const errorMessage = <p>Failed to load image.</p>;
  const [imageBlobURL] = createResource(() => props.src, fetchImageBlob);

  return (
    <ErrorBoundary fallback={() => errorMessage}>
      <Switch>
        <Match when={imageBlobURL.error || imageBlobURL() === undefined}>
          {errorMessage}
        </Match>
        <Match when={imageBlobURL()}>
          <img ref={props.ref} src={imageBlobURL()!} style={props.style} />
        </Match>
      </Switch>
    </ErrorBoundary>
  );
};

export default AsyncImage;
