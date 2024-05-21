import {
  Component,
  For,
  Suspense,
  SuspenseList,
  Switch,
  createResource,
  Match,
} from "solid-js";
import getDB, {
  Database,
  ImageInfo,
  getImageURL,
  getPreviewURL,
} from "../Data/Database";
import AsyncImage from "../Components/AsyncImage";
import style from "./Photo.module.css";

function fitImages(images: ImageInfo[]): ImageInfo[][] {
  let result: ImageInfo[][] = [];
  const targetHeight = Math.min(window.innerHeight / 3, 512);
  const resizeFactor = targetHeight / 512;

  console.log(targetHeight);
  console.log(resizeFactor);

  let row: ImageInfo[] = [];
  let curWidth = 0;
  for (const info of images) {
    const width = info.previewWidth * resizeFactor;
    curWidth += width;
    console.log(curWidth);
    row.push(info);

    if (curWidth >= window.innerWidth * 0.8) {
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

const PhotoList: Component<{ db: Database }> = (props) => {
  return (
    <div class={style.grid}>
      <For each={fitImages(props.db.images)}>
        {(item) => {
          return (
            <div class={style.gridRow}>
              <For each={item}>
                {(item) => {
                  const [imageUrl] = createResource(item, getPreviewURL);
                  return (
                    <div class={style.gridItem}>
                      <AsyncImage src={imageUrl} />
                    </div>
                  );
                }}
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
    <Suspense fallback={<p>Loading...</p>}>
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
