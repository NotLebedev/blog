import { Component, createSignal, onCleanup, onMount } from "solid-js";

import style from "./ZoomableImage.module.css";
import { Vector, apply_on_rows } from "../Data/Vector";
import classList from "../Util/Classes";

// Based on https://github.com/willnguyen1312/zoom-image/blob/main/packages/core/src/createZoomImageWheel.ts

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

const ZoomableImage: Component<{
  src: string;
  classList?: {
    [k: string]: boolean | undefined;
  };
  onLoad?: () => void;
}> = (props) => {
  const ZOOM_FACTOR = 0.001;

  let image!: HTMLImageElement;
  let container!: HTMLDivElement;
  let wrapper!: HTMLDivElement;

  // Dimensions of image when it is not resized
  let neutralImageDimensions!: {
    size: Vector;
    center: Vector;
    // Max zoom factor to limit image size too 100% (1px on image == 1px on screen)
    zoomLimit: number;
  };

  let enabled = false;

  // Styles
  const [active, setActive] = createSignal(false);
  const [tinted, setTinted] = createSignal(false);
  const [noTransition, setNoTransition] = createSignal(false);
  const [onTop, setOnTop] = createSignal(false);

  const [zoomState, setZoomState] = createSignal({
    position: Vector.zero(),
    scale: 1,
  });

  let prevTouches: [Vector, Vector] | undefined = undefined;
  const activePointers: Set<number> = new Set();
  let lastPointerPosition: Vector | undefined = undefined;
  // Track if current pointerdown -> pointerup sequence contained any movement
  // See handlePointerDown and handlePointerMove for more details
  let movedDuringClick = false;

  /**
   * Call this function in {@link onMount} and on resize to calculate
   * original (non-resized) dimensions and position of image
   */
  function updateNeutralImageDimensions() {
    const containerRect = container.getBoundingClientRect();

    let height!: number;
    let width!: number;

    // Image is fited inside container
    // It can be limited by either height of container or width of container which
    // is checked in this if-else and depending on this images original (non-resized)
    // width or height is equal to that of container and other can be derived from
    // image dimensions ratio
    // Because container is adapting to screen size and is not resized with image
    // recalculating imageRect this way works nicely
    if (
      image.naturalWidth / image.naturalHeight >
      containerRect.width / containerRect.height
    ) {
      width = containerRect.width;
      height = image.naturalHeight * (containerRect.width / image.naturalWidth);
    } else {
      height = containerRect.height;
      width = image.naturalWidth * (containerRect.height / image.naturalHeight);
    }

    neutralImageDimensions = {
      size: new Vector(width, height),
      // Center is calculated based an container too
      center: new Vector(
        containerRect.left + containerRect.width / 2,
        containerRect.top + containerRect.height / 2,
      ),
      zoomLimit: image.naturalHeight / height,
    };

    // After calculating new neutral dimensions update zoom to
    // prevent zooming beyond 100% when resizing "up"
    setZoomState(calcNewState(0, Vector.zero()));
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
    const state = zoomState();

    const action = point.sub(neutralImageDimensions.center);
    const target = action.sub(state.position).div(state.scale);

    const scale = clamp(
      state.scale * (1 - delta * ZOOM_FACTOR),
      1,
      neutralImageDimensions.zoomLimit,
    );
    const newPosition = target.mul(-scale).add(action);

    return {
      position: apply_on_rows(
        {
          position: newPosition,
          scale: new Vector(scale, scale),
          size: neutralImageDimensions.size,
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

  function handleTouchMove(event: TouchEvent) {
    if (zoomState().scale > 1.0 || event.touches.length === 2) {
      event.preventDefault();
    }

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

  function handlePointerDown(event: PointerEvent) {
    event.preventDefault();
    // down -> move -> up sequence started
    // At the start of sequence there is no movement
    movedDuringClick = false;
    activePointers.add(event.pointerId);
    console.log("Add " + event.pointerId);
    image.style.cursor = "grabbing";
    if (activePointers.size === 1) {
      lastPointerPosition = Vector.fromClient(event);
    } else {
      lastPointerPosition = undefined;
    }
  }

  function handlePointerUp(event: PointerEvent) {
    event.preventDefault();
    activePointers.delete(event.pointerId);
    console.log("Delete " + event.pointerId);
    lastPointerPosition = undefined;
    image.style.cursor = "";
    if (activePointers.size < 2) {
      prevTouches = undefined;
    }
  }

  function handlePointerMove(event: PointerEvent) {
    event.preventDefault();

    const newPointerPosition = Vector.fromClient(event);

    if (lastPointerPosition !== undefined) {
      const delta = newPointerPosition.sub(lastPointerPosition);

      // When using touch devices (or bad mouses) even fast taps
      // have some miniscule amount of motion which we need to dampen
      const isBigMovement = delta.abs() > 0.1;
      // In movedDuringClick we calculate if any of the motions in sequence
      // were big not just the last before release. User can
      // drag image around and then hesitate for a long time before
      // releasing click
      movedDuringClick ||= isBigMovement;

      const state = zoomState();
      setZoomState({
        scale: state.scale,
        position: apply_on_rows(
          {
            position: state.position.add(delta),
            scale: new Vector(state.scale, state.scale),
            size: neutralImageDimensions.size,
          },
          clampPosition,
        ),
      });
    }

    lastPointerPosition = newPointerPosition;
  }

  function ifEnabled<T>(func: (event: T) => void): (event: T) => void {
    return (event) => {
      if (enabled) {
        func(event);
      }
    };
  }

  function ifDisabled<T>(func: (event: T) => void): (event: T) => void {
    return (event) => {
      if (!enabled) {
        func(event);
      }
    };
  }

  function clickActivate(): void {
    setNoTransition(false);
    setTinted(true);
    setOnTop(true);
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.left = `${-container.getBoundingClientRect().left}px`;
    container.style.top = `${-container.getBoundingClientRect().top}px`;
    image.style.borderRadius = "0";

    container.ontransitionend = () => {
      container.style.width = "";
      container.style.height = "";
      container.style.left = "";
      container.style.top = "";
      image.style.borderRadius = "";

      container.ontransitionend = null;

      setActive(true);
      setNoTransition(true);
      enabled = true;
    };
  }

  function clickDeactivate(): void {
    setNoTransition(false);
    setTinted(false);
    setZoomState({ position: Vector.zero(), scale: 1 });
    container.style.width = `${wrapper.getBoundingClientRect().width}px`;
    container.style.height = `${wrapper.getBoundingClientRect().height}px`;
    container.style.left = `${wrapper.getBoundingClientRect().left}px`;
    container.style.top = `${wrapper.getBoundingClientRect().top}px`;
    image.style.borderRadius = "1rem";

    enabled = false;

    container.ontransitionend = () => {
      setNoTransition(true);
      setActive(false);
      setOnTop(false);
      container.style.width = "";
      container.style.height = "";
      container.style.left = "";
      container.style.top = "";
      image.style.borderRadius = "";

      container.ontransitionend = null;
    };
  }

  function onClick() {
    if (movedDuringClick) {
      return;
    }

    if (enabled) {
      clickDeactivate();
    } else {
      clickActivate();
    }
  }

  // Wait not only for image component to mount, but also until
  // blob is properly loaded
  onMount(() =>
    image.addEventListener("load", () => {
      updateNeutralImageDimensions();

      window.addEventListener("resize", updateNeutralImageDimensions);

      // When image is in disabled state make only it clickable
      // to zoom in. When enabled make entire container (whole
      // viewport) clickable to zoom out
      image.addEventListener("click", ifDisabled(onClick));
      container.addEventListener("click", ifEnabled(onClick));

      container.addEventListener("wheel", ifEnabled(handleWheel));
      container.addEventListener("touchmove", ifEnabled(handleTouchMove));
      container.addEventListener("pointerdown", ifEnabled(handlePointerDown));
      container.addEventListener("pointerup", ifEnabled(handlePointerUp));
      container.addEventListener("pointermove", ifEnabled(handlePointerMove));

      container.addEventListener(
        "touchstart",
        ifEnabled(() => {
          console.log("touchstart");
        }),
      );

      container.addEventListener(
        "touchend",
        ifEnabled(() => {
          console.log("touchend");
        }),
      );

      if (props.onLoad !== undefined) {
        props.onLoad();
      }
    }),
  );

  onCleanup(() => {
    window.removeEventListener("resize", updateNeutralImageDimensions);
  });

  return (
    <div classList={props.classList} ref={wrapper}>
      <div
        {...classList(style.screenShadow, {
          [style.active]: tinted(),
          [style.onTop]: onTop(),
        })}
      />
      <div
        {...classList(style.imageContainer, {
          [style.active]: active(),
          [style.noTransition]: noTransition(),
          [style.onTop]: onTop(),
        })}
        ref={container}
      >
        <img
          src={props.src}
          ref={image}
          style={{
            transform: `translate(${zoomState().position.x}px, ${zoomState().position.y}px) scale(${zoomState().scale})`,
          }}
        />
      </div>
    </div>
  );
};

export default ZoomableImage;
