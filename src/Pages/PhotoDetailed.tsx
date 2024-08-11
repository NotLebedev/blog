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
import { useParams } from "@solidjs/router";

import style from "./PhotoDetailed.module.css";
import getDB, { getImageURL, getPreviewURL } from "../Data/Database";
import ZoomableImage from "../Components/ZoomableImage";
import {
  Aperture,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArticleNyTimes,
  Camera,
  FilmStrip,
  ShareNetwork,
  X,
} from "phosphor-solid-js";
import { usePageContext } from "../App";
import Metas from "../Components/Metas";
import Loading from "../Components/Loading";
import { debounce } from "../Util/debounce";

const AltArrow: Component = () => {
  const { atTop } = usePageContext();
  return (
    <div class={style.altArrow}>
      <div style={{ opacity: atTop() ? "100%" : "0%" }}>
        <ArrowDown class={style.arrow} size="2rem" />
      </div>
      <div style={{ opacity: !atTop() ? "100%" : "0%" }}>
        <ArrowUp class={style.arrow} size="2rem" />
      </div>
    </div>
  );
};

const Toolbar: Component<{
  infoRef: () => HTMLElement;
}> = (props) => {
  function scrollInfo() {
    if (window.scrollY == 0) {
      props.infoRef().scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  return (
    <div class={style.toolbar}>
      <button
        class={style.photoInfoButton}
        id={style.close}
        onClick={() => history.back()}
      >
        <X size="2rem" />
      </button>
      <ArrowLeft size="2rem" id={style.prev} />
      <button
        class={style.photoInfoButton}
        onClick={scrollInfo}
        id={style.more}
      >
        <AltArrow />
      </button>

      <ShareNetwork size="2rem" id={style.share} />
      <ArrowRight size="2rem" id={style.next} />
    </div>
  );
};

const Tags: Component<{ tags?: string[] }> = (props) => {
  return (
    <span class={style.tagInfoItem}>
      <For each={props.tags} fallback={<></>}>
        {(item) => <a class={style.tagLink}>{item}</a>}
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

  let infoRef!: HTMLAnchorElement;

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

  // Display spinner after slight delay to prevent it blinking
  // even when image is already loaded
  const displayLoading = debounce(() => setShowLoading(true), 100);
  onMount(() => displayLoading());

  return (
    <div class={style.article}>
      <div class={style.photoContainer}>
        <Show when={info.loading || showLoading()}>
          <div class={style.loading}>
            <Loading />
          </div>
        </Show>
        <Show when={info.state == "ready"}>
          <ZoomableImage
            src={info()!.imageURL}
            class={style.photoContainer}
            enabled={usePageContext().atTop}
            onLoad={() => {
              displayLoading.cancel();
              setShowLoading(false);
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
            <a ref={infoRef} />
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
      <Toolbar infoRef={() => infoRef} />
    </div>
  );
};

export default PhotoDetailed;
