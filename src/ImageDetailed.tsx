import { Component, createResource, Match, Suspense, Switch } from "solid-js";
import { useParams } from "@solidjs/router";

import style from "./ImageDetailed.module.css";

type ImageInfo = {
  id: string;
  name: string;
  file: string;
  camera: string;
  lens: string;
};

async function fetchImageInfo(id: string): Promise<ImageInfo | undefined> {
  const response = await fetch("/db.json");
  if (response.ok) {
    const db: { images: [ImageInfo] } = await response.json();
    return db.images.find((element) => element.id === id);
  } else {
    return undefined;
  }
}

async function fetchImageBlob(src: string): Promise<string | undefined> {
  const response = await fetch(src);
  if (response.ok) {
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } else {
    return undefined;
  }
}

const ImageDetailed: Component = () => {
  const params = useParams();
  const [imageInfo] = createResource(() => params.id, fetchImageInfo);
  const [imageBlobURL] = createResource(
    () => imageInfo()?.file,
    fetchImageBlob,
  );
  return (
    <>
      <Suspense fallback={<div>Loading</div>}>
        <div class={style.container}>
          <Switch>
            <Match
              when={
                imageInfo.error ||
                imageBlobURL.error ||
                imageInfo() === undefined ||
                imageBlobURL() == undefined
              }
            >
              <span>Image not found :(</span>
            </Match>
            <Match when={imageInfo() && imageBlobURL()}>
              <span>{imageInfo()?.name}</span>
              <img class={style.image} src={imageBlobURL()!} />
            </Match>
          </Switch>
        </div>
      </Suspense>
    </>
  );
};

export default ImageDetailed;
