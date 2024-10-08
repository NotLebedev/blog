import {
  Component,
  createResource,
  Show,
  Suspense,
  JSX,
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

const Tags: Component<{ tags?: string[] }> = (props) => {
  return (
    <span>
      <For each={props.tags} fallback={<></>}>
        {(item) => (
          <a class={style.tagLink} href={`/photo?tags=${item}`}>
            {item}
          </a>
        )}
      </For>
    </span>
  );
};

const InfoItem: Component<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: (props: any, ref: any) => JSX.Element;
  text: string | JSX.Element | undefined;
}> = (props) => {
  return (
    <Show when={props.text}>
      <span class={style.photoInfo}>
        <props.icon size="1.5rem" />
        <p>{props.text}</p>
      </span>
    </Show>
  );
};

const Spacing: Component<{ size: string }> = (props) => {
  return <span style={{ width: props.size }} />;
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
        <div
          classList={{ [style.loading]: true, [style.hidden]: !showLoading() }}
        >
          <Loading />
        </div>
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
            <InfoItem icon={Spacing} text={info()!.imageInfo.name} />
            <InfoItem
              icon={ArticleNyTimes}
              text={info()!.imageInfo.description}
            />
            <InfoItem icon={Camera} text={info()!.imageInfo.camera} />
            <InfoItem icon={Aperture} text={info()!.imageInfo?.lens} />
            <InfoItem icon={FilmStrip} text={info()!.imageInfo.flim} />
            <InfoItem
              icon={Spacing}
              text={<Tags tags={info()!.imageInfo.tags} />}
            />
          </div>
        </Show>
      </Suspense>
    </div>
  );
};

export default PhotoDetailed;
