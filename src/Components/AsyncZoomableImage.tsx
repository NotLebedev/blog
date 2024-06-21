import { Component, Resource, createSignal, onMount } from "solid-js";
import AsyncImage from "./AsyncImage";

import style from "./AsyncZoomableImage.module.css";

// based on https://github.com/willnguyen1312/zoom-image/blob/main/packages/core/src/createZoomImageWheel.ts

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

const AsyncZoomableImage: Component<{ src: Resource<string | undefined> }> = (
  props,
) => {
  let image!: HTMLImageElement;
  // Initial image size
  let imageRect!: {
    left: number;
    top: number;
    height: number;
    width: number;
    centerX: number;
    centerY: number;
  };
  // Max zoom factor to limit image size too 100% (1px on image == 1px on screen)
  let zoomLimit!: number;

  const ZOOM_FACTOR = 0.001;
  const [zoomState, setZoomState] = createSignal({ x: 0, y: 0, scale: 1 });

  /**
   * Call this function in {@link onMount} to save original position of image
   * This way no container is needed to handle positioning of image
   */
  function saveOriginalRect() {
    const clientRect = image.getBoundingClientRect();
    imageRect = {
      left: clientRect.left,
      top: clientRect.top,
      height: clientRect.height,
      width: clientRect.width,
      centerX: clientRect.left + clientRect.width / 2,
      centerY: clientRect.top + clientRect.height / 2,
    };
  }

  function createZoomLimit() {
    zoomLimit = image.naturalHeight / imageRect.height;
  }

  function clampPosition(
    position: number,
    scale: number,
    size: number,
  ): number {
    const halfSize = size / 2;
    // Beginning moved past original beginning
    if (position - halfSize * scale > -halfSize) {
      return halfSize * (scale - 1);
    }

    // End moved before original end
    if (position + halfSize * scale < halfSize) {
      return -halfSize * (scale - 1);
    } else {
      return position;
    }
  }

  /**
   * Note that image uses absolute positioning, thus transform is relative to center
   */
  function handleWheel(event: WheelEvent) {
    event.preventDefault();

    const state = zoomState();

    const delta = event.deltaY;
    const actionX = event.clientX - imageRect.centerX;
    const actionY = event.clientY - imageRect.centerY;

    const targetX = (actionX - state.x) / state.scale;
    const targetY = (actionY - state.y) / state.scale;

    const scale = clamp(state.scale * (1 - delta * ZOOM_FACTOR), 1, zoomLimit);

    setZoomState({
      x: clampPosition(-targetX * scale + actionX, scale, imageRect.width),
      y: clampPosition(-targetY * scale + actionY, scale, imageRect.height),
      scale: scale,
    });
  }

  function mountZoom() {
    saveOriginalRect();
    createZoomLimit();
    image.addEventListener("wheel", handleWheel);
  }

  // Wait not only for image component to mound, but also until
  // blob is properly loaded
  onMount(() => image.addEventListener("load", mountZoom));

  return (
    <div class={style.imageContainer}>
      <AsyncImage
        src={props.src}
        ref={image}
        style={{
          transform: `translate(${zoomState().x}px, ${zoomState().y}px) scale(${zoomState().scale})`,
        }}
      />
    </div>
  );
};

export default AsyncZoomableImage;
