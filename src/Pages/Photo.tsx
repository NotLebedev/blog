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
import getDB, { Database, ImageInfo, getPreviewURL } from "../Data/Database";
import AsyncImage from "../Components/AsyncImage";
import style from "./Photo.module.css";

type ImagePreload = { width: number; image: JSX.Element };
type ScreenSize = { height: number; width: number };

function fitImages(
  images: ImagePreload[],
  screenSize: ScreenSize,
): JSX.Element[][] {
  let result: JSX.Element[][] = [];
  const targetHeight = Math.min(screenSize.height / 3, 512);
  const resizeFactor = targetHeight / 512;

  console.log(targetHeight);
  console.log(resizeFactor);

  let row: JSX.Element[] = [];
  let curWidth = 0;
  for (const info of images) {
    const width = info.width * resizeFactor;
    curWidth += width;
    console.log(curWidth);

    row.push(info.image);

    if (curWidth >= window.innerWidth * 0.9) {
      result.push(row);
      row = [];
      curWidth = 0;
    }
  }

  if (row.length > 0) {
    result.push(row);
  }

  return result;
}

function preloadImages(db: Database): ImagePreload[] {
  let result: ImagePreload[] = [];

  for (const item of db.images) {
    const [imageUrl] = createResource(item, getPreviewURL);
    result.push({
      width: item.previewWidth,
      image: (
        <Suspense fallback={<div>Loading ...</div>}>
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
                {(item) => <div class={style.gridItem}>{item}</div>}
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
