import {
  Component,
  createResource,
  Show,
  Suspense,
  For,
  createSignal,
  onMount,
} from "solid-js";
import { useLocation, useParams } from "@solidjs/router";

import style from "./PhotoDetailed.module.css";
import getDB, { getImageURL, getPreviewURL } from "../Data/Database";
import ZoomableImage from "../Components/ZoomableImage";
import {
  Aperture,
  ArrowLeft,
  ArrowRight,
  ArticleNyTimes,
  Camera,
  FilmStrip,
  ShareNetwork,
  X,
} from "phosphor-solid-js";
import Metas from "../Components/Metas";
import Loading from "../Components/Loading";
import debounce from "../Util/Debounce";

const Toolbar: Component<{
  selfId: string;
}> = (props) => {
  const location = useLocation();

  return (
    <div class={style.toolbar}>
      <a
        class={style.photoInfoButton}
        id={style.close}
        href={`/photo${location.search}#${props.selfId}`}
      >
        <X size="2rem" />
      </a>

      <ArrowLeft size="2rem" id={style.prev} />
      <ArrowRight size="2rem" id={style.next} />

      <ShareNetwork size="2rem" id={style.share} />
    </div>
  );
};

const Tags: Component<{ class: string; tags?: string[] }> = (props) => {
  return (
    <p class={props.class}>
      <For each={props.tags} fallback={<></>}>
        {(item) => (
          <a class={style.tagLink} href={`/photo?tags=${item}`}>
            {item}
          </a>
        )}
      </For>
    </p>
  );
};

const PhotoDetailed: Component = () => {
  const params = useParams();

  const [info] = createResource(async () => {
    const imageInfo = (await getDB())?.images?.find((el) => el.id == params.id);

    if (imageInfo === undefined) {
      return undefined;
    }

    const imageURL = getImageURL(imageInfo);
    const previewURL = getPreviewURL(imageInfo);

    return {
      imageInfo,
      imageURL,
      previewURL,
    };
  });

  const [showLoading, setShowLoading] = createSignal(false);
  const [showImage, setShowImage] = createSignal(false);

  // Display spinner after slight delay to prevent it blinking
  // even when image is already loaded
  const displayLoading = debounce(() => setShowLoading(true), 100);
  onMount(() => displayLoading());

  return (
    <div class={style.article}>
      <Toolbar selfId={params.id} />
      <div
        style={{
          "aspect-ratio": (info()?.imageInfo?.previewWidth ?? 512) / 512,
        }}
        class={style.photoTop}
      >
        <Show when={showLoading()}>
          <div class={style.loading}>
            <Loading />
          </div>
        </Show>
        <Show when={info.state == "ready"}>
          <ZoomableImage
            src={info()!.imageURL}
            classList={{
              [style.photoContainer]: true,
              [style.hidden]: !showImage(),
            }}
            onLoad={() => {
              displayLoading.cancel();
              setShowLoading(false);
              setShowImage(true);
            }}
          />
        </Show>
      </div>
      <Suspense fallback={<p>Loading...</p>}>
        <Show
          when={!(info.error || info() == undefined)}
          fallback={<p>Could not load image info</p>}
        >
          <Metas
            title={info()!.imageInfo.name}
            preview={new URL(info()!.previewURL, document.baseURI).href}
          />
          <div class={style.infoBlock}>
            <h2 class={style.text}>{info()!.imageInfo.name}</h2>

            <Show when={info()!.imageInfo.description !== undefined}>
              <ArticleNyTimes class={style.icon} />
              <p class={style.text}>{info()!.imageInfo.description}</p>
            </Show>

            <Show when={info()!.imageInfo.camera !== undefined}>
              <Camera class={style.icon} />
              <p class={style.text}>{info()!.imageInfo.camera}</p>
            </Show>

            <Show when={info()!.imageInfo.lens !== undefined}>
              <Aperture class={style.icon} />
              <p class={style.text}>{info()!.imageInfo?.lens}</p>
            </Show>

            <Show when={info()!.imageInfo.film !== undefined}>
              <FilmStrip class={style.icon} />
              <p class={style.text}>{info()!.imageInfo.film}</p>
            </Show>

            <Tags class={style.text} tags={info()!.imageInfo.tags} />
          </div>
        </Show>
      </Suspense>
    </div>
  );
};

export default PhotoDetailed;
