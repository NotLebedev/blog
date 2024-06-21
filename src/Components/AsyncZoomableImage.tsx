import { Component, Resource, createSignal, onMount } from "solid-js";
import AsyncImage from "./AsyncImage";

import style from "./AsyncZoomableImage.module.css";
import { Vector, apply_on_rows } from "../Data/Vector";

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
    height: number;
    width: number;
    center: Vector;
  };
  // Max zoom factor to limit image size too 100% (1px on image == 1px on screen)
  let zoomLimit!: number;

  const ZOOM_FACTOR = 0.001;
  const [zoomState, setZoomState] = createSignal({
    position: new Vector(0, 0),
    scale: 1,
  });

  /**
   * Call this function in {@link onMount} to save original position of image
   * This way no container is needed to handle positioning of image
   */
  function saveOriginalRect() {
    const clientRect = image.getBoundingClientRect();
    imageRect = {
      height: clientRect.height,
      width: clientRect.width,
      center: new Vector(
        clientRect.left + clientRect.width / 2,
        clientRect.top + clientRect.height / 2,
      ),
    };
  }

  function createZoomLimit() {
    zoomLimit = image.naturalHeight / imageRect.height;
  }

  function clampPosition(args: {
    position: number;
    scale: number;
    size: number;
  }): number {
    const halfSize = args.size / 2;
    // Beginning moved past original beginning
    if (args.position - halfSize * args.scale > -halfSize) {
      return halfSize * (args.scale - 1);
    }

    // End moved before original end
    if (args.position + halfSize * args.scale < halfSize) {
      return -halfSize * (args.scale - 1);
    } else {
      return args.position;
    }
  }

  /**
   * Note that image uses absolute positioning, thus transform is relative to center
   */
  function handleWheel(event: WheelEvent) {
    event.preventDefault();

    const state = zoomState();

    const delta = event.deltaY;
    const action = Vector.fromClient(event).sub(imageRect.center);
    const target = action.sub(state.position).div(state.scale);

    const scale = clamp(state.scale * (1 - delta * ZOOM_FACTOR), 1, zoomLimit);
    const newPosition = target.mul(-scale).add(action);

    setZoomState({
      position: apply_on_rows(
        {
          position: newPosition,
          scale: new Vector(scale, scale),
          size: new Vector(imageRect.width, imageRect.height),
        },
        clampPosition,
      ),
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
          transform: `translate(${zoomState().position.x}px, ${zoomState().position.y}px) scale(${zoomState().scale})`,
        }}
      />
    </div>
  );
};

export default AsyncZoomableImage;
