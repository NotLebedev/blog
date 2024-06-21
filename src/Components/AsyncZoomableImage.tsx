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
  const activePointers: Set<number> = new Set();

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

  function calcNewState(
    delta: number,
    point: Vector,
  ): { position: Vector; scale: number } {
    console.log(delta);
    const state = zoomState();

    const action = point.sub(imageRect.center);
    const target = action.sub(state.position).div(state.scale);

    const scale = clamp(state.scale * (1 - delta * ZOOM_FACTOR), 1, zoomLimit);
    const newPosition = target.mul(-scale).add(action);

    return {
      position: apply_on_rows(
        {
          position: newPosition,
          scale: new Vector(scale, scale),
          size: new Vector(imageRect.width, imageRect.height),
        },
        clampPosition,
      ),
      scale: scale,
    };
  }

  /**
   * Note that image uses absolute positioning, thus transform is relative to center
   */
  function handleWheel(event: WheelEvent) {
    event.preventDefault();

    setZoomState(calcNewState(event.deltaY, Vector.fromClient(event)));
  }

  let prevTouches: [Vector, Vector] | undefined = undefined;
  function handleTouchMove(event: TouchEvent) {
    event.preventDefault();

    if (event.touches.length === 2) {
      const touches: [Vector, Vector] = [...event.touches].map(
        (touch) => new Vector(touch.clientX, touch.clientY),
      ) as [Vector, Vector];

      if (prevTouches !== undefined) {
        const centerPrev = prevTouches[0].add(prevTouches[1]).div(2);
        const centerCur = touches[0].add(touches[1]).div(2);
        const centerMove = centerCur.sub(centerPrev);

        const scale =
          touches[0].sub(touches[1]).abs() /
          prevTouches[0].sub(prevTouches[1]).abs();

        if (Math.abs(scale - 1) > 0.00001) {
          setZoomState(
            calcNewState(
              -Math.log(scale) / ZOOM_FACTOR,
              centerPrev.add(centerMove.div(1 - scale)),
            ),
          );
        }
      }

      prevTouches = touches;
    }
  }

  function handlePointerDown(ev: PointerEvent) {
    activePointers.add(ev.pointerId);
  }

  function handlePointerUp(ev: PointerEvent) {
    activePointers.delete(ev.pointerId);
    if (activePointers.size < 2) {
      prevTouches = undefined;
    }
  }

  function mountZoom() {
    saveOriginalRect();
    createZoomLimit();
    image.addEventListener("wheel", handleWheel);
    image.addEventListener("touchmove", handleTouchMove);
    image.addEventListener("pointerdown", handlePointerDown);
    image.addEventListener("pointerup", handlePointerUp);
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
