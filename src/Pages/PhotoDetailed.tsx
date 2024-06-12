import {
  Component,
  createResource,
  Show,
  Suspense,
  Switch,
  Match,
  JSX,
} from "solid-js";
import { useParams } from "@solidjs/router";

import style from "./PhotoDetailed.module.css";
import getDB, { getImageURL } from "../Data/Database";
import AsyncImage from "../Components/AsyncImage";
import {
  Aperture,
  ArrowDown,
  ArrowUp,
  ArticleNyTimes,
  Camera,
  FilmStrip,
} from "phosphor-solid-js";
import { usePageContext } from "../App";

const AltArrow: Component<{ atTop: boolean }> = (props) => {
  return (
    <div class={style.altArrow}>
      <div style={{ opacity: props.atTop ? "100%" : "0%" }}>
        <ArrowDown class={style.arrow} size="3rem" />
      </div>
      <div style={{ opacity: !props.atTop ? "100%" : "0%" }}>
        <ArrowUp class={style.arrow} size="3rem" />
      </div>
    </div>
  );
};

const PhotoDetailed: Component = () => {
  const params = useParams();

  const InfoItem: Component<{
    // eslint-disable-next-line no-unused-vars
    icon: (props: any, ref: any) => JSX.Element;
    text: string | undefined;
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

  // Putting all chained resources into separate component
  // https://github.com/solidjs/solid/discussions/1015
  const Suspended = () => {
    let infoRef: HTMLElement | undefined = undefined;

    const [db] = createResource(getDB);

    const [imageInfo] = createResource(db, (db) =>
      db?.images?.find((el) => el.id == params.id),
    );

    const [imageURL] = createResource(imageInfo, getImageURL);
    const { atTop } = usePageContext()!;

    function scrollInfo() {
      if (window.scrollY == 0) {
        infoRef!.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    return (
      <div class={style.article}>
        <Switch>
          <Match when={db.error || imageInfo.error || imageInfo == undefined}>
            <p>Could not load image</p>
          </Match>
          <Match when={true}>
            <AsyncImage src={imageURL} />
            <button class={style.photoInfoButton} onClick={scrollInfo}>
              <AltArrow atTop={atTop()} />
            </button>
            <div class={style.infoBlock}>
              <Show when={imageInfo()}>
                <a ref={infoRef} />
                <InfoItem icon={Spacing} text={imageInfo()?.name} />
                <InfoItem
                  icon={ArticleNyTimes}
                  text={imageInfo()?.description}
                />
                <InfoItem icon={Camera} text={imageInfo()?.camera} />
                <InfoItem icon={Aperture} text={imageInfo()?.lens} />
                <InfoItem icon={FilmStrip} text={imageInfo()?.flim} />
              </Show>
            </div>
          </Match>
        </Switch>
      </div>
    );
  };

  return (
    <>
      <Suspense fallback={<p>Loading</p>}>
        <Suspended />
      </Suspense>
    </>
  );
};

export default PhotoDetailed;
