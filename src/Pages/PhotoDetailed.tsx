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
import { Aperture, ArrowDown, Camera, FilmStrip } from "phosphor-solid";

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
    const [db] = createResource(getDB);

    const [imageInfo] = createResource(db, (db) =>
      db?.images?.find((el) => el.id == params.id),
    );

    const [imageURL] = createResource(imageInfo, getImageURL);

    return (
      <div class={style.article}>
        <Switch>
          <Match when={db.error || imageInfo.error || imageInfo == undefined}>
            <p>Could not load image</p>
          </Match>
          <Match when={true}>
            <AsyncImage src={imageURL} />
            <h2 class={style.infoBanner}>
              <ArrowDown />
              Photo Info
              <ArrowDown />
            </h2>
            <Show when={imageInfo()}>
              <InfoItem icon={Spacing} text={imageInfo()?.name} />
              <InfoItem icon={Camera} text={imageInfo()?.camera} />
              <InfoItem icon={Aperture} text={imageInfo()?.lens} />
              <InfoItem icon={FilmStrip} text={imageInfo()?.flim} />
            </Show>
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
