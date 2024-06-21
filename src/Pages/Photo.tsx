import {
  Component,
  For,
  Suspense,
  Switch,
  createResource,
  Match,
  createSignal,
  onMount,
  onCleanup,
  JSX,
} from "solid-js";
import getDB, { Database, getPreviewURL } from "../Data/Database";
import AsyncImage from "../Components/AsyncImage";
import style from "./Photo.module.css";
import { ArrowUpRight } from "phosphor-solid-js";

type DisplayableImage = {
  id: string;
  name: string;
  width: number;
  image: JSX.Element;
  type: "DisplayableImage";
};

type AlignmentPlaceholder = {
  type: "AlignmentPlaceholder";
  image: JSX.Element;
};

type ImageHandle = DisplayableImage | AlignmentPlaceholder;
type ScreenSize = { height: number; width: number };

function fitImages(
  images: DisplayableImage[],
  screenSize: ScreenSize,
): ImageHandle[][] {
  const result: ImageHandle[][] = [];
  const targetHeight = Math.min(screenSize.height / 2, 512);
  const resizeFactor = targetHeight / 512;

  let row: ImageHandle[] = [];
  let curWidth = 0;
  for (const info of images) {
    const width = info.width * resizeFactor;
    curWidth += width;
    row.push(info);

    if (curWidth >= window.innerWidth) {
      result.push(row);
      row = [];
      curWidth = 0;
    }
  }

  if (row.length > 0) {
    // If last row has free space add an svg placeholder taking up
    // the rest of space
    row.push({
      type: "AlignmentPlaceholder",
      image: <svg width={window.innerWidth - curWidth} height={512} />,
    });
    result.push(row);
  }

  return result;
}

function preloadImages(db: Database): DisplayableImage[] {
  const result: DisplayableImage[] = [];

  for (const item of db.images) {
    const [imageUrl] = createResource(item, getPreviewURL);
    result.push({
      id: item.id,
      width: item.previewWidth,
      name: item.name,
      type: "DisplayableImage",
      image: (
        <Suspense
          fallback={
            <svg
              width={item.previewWidth}
              height={512}
              style={{
                "max-width": "100%",
                height: "auto",
                display: "block",
              }}
            />
          }
        >
          <AsyncImage src={imageUrl} />
        </Suspense>
      ),
    });
  }

  return result;
}

const PhotoList: Component<{ db: Database }> = (props) => {
  const [rect, setRect] = createSignal({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  const handler = () => {
    setRect({ height: window.innerHeight, width: window.innerWidth });
  };

  onMount(() => {
    window.addEventListener("resize", handler);
  });

  onCleanup(() => {
    window.removeEventListener("resize", handler);
  });

  const [images] = createResource(() => props.db, preloadImages);

  return (
    <div class={style.grid}>
      <For each={fitImages(images()!, rect())}>
        {(item) => {
          return (
            <div class={style.gridRow}>
              <For each={item}>
                {(item) => (
                  <Switch>
                    <Match when={item.type == "DisplayableImage"}>
                      <a
                        class={style.gridItem}
                        href={`/photo/${(item as DisplayableImage).id}`}
                      >
                        {item.image}
                        <div class={style.overlay}>
                          <p>{(item as DisplayableImage).name}</p>
                          <ArrowUpRight size={"1.5rem"} />
                        </div>
                      </a>
                    </Match>
                    <Match when={item.type == "AlignmentPlaceholder"}>
                      <div class={style.gridItem}>{item.image}</div>
                    </Match>
                  </Switch>
                )}
              </For>
            </div>
          );
        }}
      </For>
    </div>
  );
};

const Photo: Component = () => {
  const [db] = createResource(getDB);
  return (
    <Suspense fallback={<p>Loading ...</p>}>
      <Switch>
        <Match when={db.error || db() === undefined}>
          <p>Error loading images.</p>
        </Match>
        <Match when={true}>
          <PhotoList db={db()!} />
        </Match>
      </Switch>
    </Suspense>
  );
};

export default Photo;
