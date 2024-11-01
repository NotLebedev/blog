import { createSignal, onMount, ParentComponent, Show } from "solid-js";
import Loading from "./Loading";
import debounce from "../Util/Debounce";
import classList, { ClassList } from "../Util/Classes";
import { getPreviewURL, ImageInfo } from "../Data/Database";
import style from "./ImagePreview.module.css";

const ImagePreview: ParentComponent<{
  href: string;
  info: ImageInfo;
  classList?: ClassList;
}> = (props) => {
  const [showLoading, setShowLoading] = createSignal(false);

  // Display spinner after slight delay to prevent it blinking
  // even when image is already loaded
  const displayLoading = debounce(() => setShowLoading(true), 100);
  onMount(() => displayLoading());

  let imageRef!: HTMLImageElement;
  return (
    <a {...classList(style.container, props.classList)} href={props.href}>
      <Show when={showLoading()}>
        <div class={style.loading}>
          <Loading />
        </div>
      </Show>
      <img
        width={props.info.previewWidth}
        height={512}
        src={getPreviewURL(props.info)}
        ref={imageRef}
        class={style.hidden}
        loading="lazy"
        onLoad={() => {
          setShowLoading(false);
          displayLoading.cancel();
          imageRef.className = "";
        }}
      />
      {props.children}
    </a>
  );
};

export default ImagePreview;
