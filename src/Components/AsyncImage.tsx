import {
  Component,
  ErrorBoundary,
  Match,
  Resource,
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
  src: Resource<string | undefined>;
}> = (props) => {
  const errorMessage = <p>Failed to load image.</p>;
  const [imageBlobURL] = createResource(() => props.src(), fetchImageBlob);

  return (
    <ErrorBoundary fallback={() => errorMessage}>
      <Switch>
        <Match when={imageBlobURL.error || imageBlobURL() === undefined}>
          {errorMessage}
        </Match>
        <Match when={imageBlobURL()}>
          <img src={imageBlobURL()!} />
        </Match>
      </Switch>
    </ErrorBoundary>
  );
};

export default AsyncImage;
