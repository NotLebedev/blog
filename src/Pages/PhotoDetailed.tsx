import {
  Component,
  createResource,
  Show,
  Suspense,
  For,
  createSignal,
  createEffect,
  onCleanup,
  onMount,
  on,
} from "solid-js";
import { useLocation, useNavigate, useParams } from "@solidjs/router";

import style from "./PhotoDetailed.module.css";
import getDB, { ImageInfo } from "../Data/Database";
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
import Card from "../Components/Card";
import classList from "../Util/Classes";
import Tag from "../Components/Tag";
import Arrays from "../Util/Arrays";
import swipe from "../Util/Swipe";

const Toolbar: Component<{
  selfId: string;
  prevId: string | undefined;
  nextId: string | undefined;
}> = (props) => {
  const location = useLocation();
  const [animateShare, setAnimateShare] = createSignal(false);

  function copyShare(this: HTMLButtonElement) {
    navigator.clipboard.writeText(window.location.origin + location.pathname);
    setAnimateShare(true);
    this.onanimationend = () => {
      setAnimateShare(false);
      this.onanimationend = null;
    };
  }

  return (
    <div class={style.toolbar}>
      <a
        class={style.photoInfoButton}
        id={style.close}
        href={`/photo${location.search}#${props.selfId}`}
      >
        <X size="2rem" />
      </a>

      <a
        {...classList(style.photoInfoButton, {
          [style.hidden]: props.prevId === undefined,
        })}
        id={style.prev}
        href={`/photo/${props.prevId ?? ""}${location.search}`}
      >
        <ArrowLeft size="2rem" />
      </a>

      <a
        {...classList(style.photoInfoButton, {
          [style.hidden]: props.nextId === undefined,
        })}
        id={style.next}
        href={`/photo/${props.nextId ?? ""}${location.search}`}
      >
        <ArrowRight size="2rem" />
      </a>

      <button
        id={style.share}
        {...classList(style.photoInfoButton, {
          [style.animate]: animateShare(),
        })}
        onClick={copyShare}
      >
        <ShareNetwork size="2rem" />
        <p>Copied</p>
      </button>
    </div>
  );
};

const Tags: Component<{ class: string; tags?: string[] }> = (props) => {
  return (
    <p class={props.class}>
      <For each={props.tags} fallback={<></>}>
        {(item) => (
          <a class={style.tagLink} href={`/photo?tags=${item}`}>
            <Tag>{item}</Tag>
          </a>
        )}
      </For>
    </p>
  );
};

const InfoCard: Component<{
  imageInfo: ImageInfo;
  previewURL: string;
}> = (props) => {
  return (
    <>
      <Metas
        title={props.imageInfo.name}
        preview={new URL(props.previewURL, document.baseURI).href}
      />
      <Card classList={{ [style.infoBlock]: true }}>
        <h2 class={style.text}>{props.imageInfo.name}</h2>

        <Show when={props.imageInfo.description !== undefined}>
          <ArticleNyTimes class={style.icon} />
          <div
            children={props.imageInfo.description!}
            {...classList(style.text)}
          />
        </Show>

        <Show when={props.imageInfo.camera !== undefined}>
          <Camera class={style.icon} />
          <p class={style.text}>{props.imageInfo.camera}</p>
        </Show>

        <Show when={props.imageInfo.lens !== undefined}>
          <Aperture class={style.icon} />
          <p class={style.text}>{props.imageInfo.lens}</p>
        </Show>

        <Show when={props.imageInfo.film !== undefined}>
          <FilmStrip class={style.icon} />
          <p class={style.text}>{props.imageInfo.film}</p>
        </Show>

        <Tags class={style.text} tags={props.imageInfo.tags} />
      </Card>
    </>
  );
};

const PhotoDetailed: Component = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams: {
    search?: string;
    tags?: string | string[];
  } = location.query;

  const [info, { refetch }] = createResource(async () => {
    const db = await getDB();
    if (db === undefined) {
      return undefined;
    }

    const imageInfo = db.images.find((el) => el.id == params.id);

    if (imageInfo === undefined) {
      return undefined;
    }

    const imageURL = imageInfo.imageUrl;
    const previewURL = imageInfo.previewUrl;

    const tags = Arrays.fromMaybeArray(searchParams.tags);

    const prevURL = db.prevBefore(
      imageInfo.id,
      searchParams.search ?? "",
      tags,
    )?.id;

    const nextURL = db.nextAfter(
      imageInfo.id,
      searchParams.search ?? "",
      tags,
    )?.id;

    return {
      imageInfo,
      imageURL,
      previewURL,
      prevURL,
      nextURL,
    };
  });

  const [showLoading, setShowLoading] = createSignal(false);
  const [showImage, setShowImage] = createSignal(false);

  // Display spinner after slight delay to prevent it blinking
  // even when image is already loaded
  const displayLoading = debounce(() => setShowLoading(true), 100);

  // When page changes to different photo refetch info
  // and restart spinner
  createEffect(
    on(
      () => params.id,
      () => {
        refetch();
        displayLoading();
      },
    ),
  );

  function navPrev() {
    if (info()?.prevURL !== undefined)
      navigate(`/photo/${info()!.prevURL}${location.search}`);
  }

  function navNext() {
    if (info()?.nextURL !== undefined)
      navigate(`/photo/${info()!.nextURL}${location.search}`);
  }

  function navClose() {
    navigate(`/photo${location.search}#${params.id}`);
  }

  swipe((dir) => {
    switch (dir) {
      case "right":
        return navPrev();
      case "left":
        return navNext();
      case "down":
        return navClose();
    }
  });

  onMount(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "Escape":
          return navClose();
        case "ArrowLeft":
          return navPrev();
        case "ArrowRight":
          return navNext();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => document.removeEventListener("keydown", onKeyDown));
  });

  return (
    <div class={style.article}>
      <Toolbar
        selfId={params.id!}
        prevId={info()?.prevURL}
        nextId={info()?.nextURL}
      />
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
            {...classList(style.photoContainer, {
              [style.hidden]: !showImage(),
            })}
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
          <InfoCard
            imageInfo={info()!.imageInfo}
            previewURL={info()!.previewURL}
          />
        </Show>
      </Suspense>
    </div>
  );
};

export default PhotoDetailed;
