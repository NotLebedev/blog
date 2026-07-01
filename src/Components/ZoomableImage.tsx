import { Component, createSignal, onCleanup, onMount } from "solid-js";

import style from "./ZoomableImage.module.css";
import { Vector, apply_on_rows } from "../Data/Vector";
import classList from "../Util/Classes";
import keyHandlerStack from "../Util/KeyHandlerStack";

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

type State =
  // Image is not active and can not be interacted with
  | { enabled: false }
  // Image is active but is not actively interacted with
  | { enabled: true }
  // Image is active and has active pointer interaction
  | {
      enabled: true;
      movedDuringInteraction: boolean; // TODO: do we need this in pointer interaction?
      lastPointerPosition: Vector;
    }
  // Image is active and has active single touch interaction
  | { enabled: true; movedDuringInteraction: boolean; prevTouches: [Vector] }
  // Image is active and has active two touch (pinch) interaction
  | {
      enabled: true;
      movedDuringInteraction: boolean;
      prevTouches: [Vector, Vector];
    };

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

  // Styles
  const [active, setActive] = createSignal(false);
  const [tinted, setTinted] = createSignal(false);
  const [noTransition, setNoTransition] = createSignal(false);
  const [onTop, setOnTop] = createSignal(false);

  const [zoomState, setZoomState] = createSignal({
    position: Vector.zero(),
    scale: 1,
  });

  let state: State = { enabled: false };

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

  function handleTouchStart(event: TouchEvent) {
    event.preventDefault();

    if (event.touches.length === 1) {
      state = {
        enabled: true,
        // Only single touch can deactivate when no movement
        movedDuringInteraction: false,
        // If a touch was added and now there is one in activeTouches
        // then that is the touch that was added
        prevTouches: [Vector.fromClient(event.changedTouches[0])],
      };
    } else if (event.touches.length === 2) {
      // We want only single finger tap to decativate the focused state. Any
      // other touch combination and we assume that some movement was made
      // and set movedDuringInteraction = true

      // One touch added. We promote from one touch dragging to two touch resizing.
      // We would also expect that prevTouches is already set and has one element,
      // and fall back to creating two touches just in case
      if (event.changedTouches.length === 1 && "prevTouches" in state) {
        state = {
          enabled: true,
          movedDuringInteraction: true,
          prevTouches: [
            state.prevTouches[0],
            Vector.fromClient(event.changedTouches[0]),
          ],
        };
      } else {
        // Two touches added at once
        state = {
          enabled: true,
          movedDuringInteraction: true,
          prevTouches: [
            Vector.fromClient(event.changedTouches[0]),
            Vector.fromClient(event.changedTouches[1]),
          ],
        };
      }
    } else {
      // Three and more touches are ignored
      state = { enabled: true };
    }
  }

  function handleTouchMove(event: TouchEvent) {
    event.preventDefault();

    // touchmove but no touchstart? Strange, ignore it just in case
    if (!("prevTouches" in state)) {
      return;
    }

    if (state.prevTouches.length === 1) {
      const newPointerPosition = Vector.fromClient(event.touches[0]);
      const delta = newPointerPosition.sub(state.prevTouches[0]);
      state.prevTouches[0] = newPointerPosition;

      // When using touch devices (or bad mouses) even fast taps
      // have some miniscule amount of motion which we need to dampen
      const isBigMovement = delta.abs() > 0.1;
      // In movedDuringClick we calculate if any of the motions in sequence
      // were big not just the last before release. User can
      // drag image around and then hesitate for a long time before
      // releasing click
      state.movedDuringInteraction ||= isBigMovement;

      const zoomSt = zoomState();
      setZoomState({
        scale: zoomSt.scale,
        position: apply_on_rows(
          {
            position: zoomSt.position.add(delta),
            scale: new Vector(zoomSt.scale, zoomSt.scale),
            size: neutralImageDimensions.size,
          },
          clampPosition,
        ),
      });
    } else {
      const touches = [...event.touches].map(Vector.fromClient) as [
        Vector,
        Vector,
      ];

      const centerPrev = state.prevTouches[0].add(state.prevTouches[1]).div(2);
      const centerCur = touches[0].add(touches[1]).div(2);
      const centerMove = centerCur.sub(centerPrev);

      const scale =
        touches[0].sub(touches[1]).abs() /
        state.prevTouches[0].sub(state.prevTouches[1]).abs();

      state.prevTouches = touches;

      if (Math.abs(scale - 1) > 0.00001) {
        setZoomState(
          calcNewState(
            -Math.log(scale) / ZOOM_FACTOR,
            centerPrev.add(centerMove.div(1 - scale)),
          ),
        );
      }
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    event.preventDefault();

    if (event.touches.length === 0) {
      if ("movedDuringInteraction" in state && !state.movedDuringInteraction) {
        // One touch -> zero touches with no movement.
        // We detected a click.
        // (note: there are no click events in touch mode)
        clickDeactivate();
      } else {
        // Went from 2+ touches to zero or there was movement.
        // Does not count as a click.
        state = { enabled: true };
      }
    } else if (event.touches.length === 1) {
      // Down to one touch, use it
      state = {
        enabled: true,
        // We went from 2+ touches down to. This should not be
        // considered a click if no movement happens.
        movedDuringInteraction: true,
        prevTouches: [Vector.fromClient(event.touches[0])],
      };
    } else if (event.touches.length === 2) {
      // Down to two touches, we can start tracking this interaction
      state = {
        enabled: true,
        // Ignoring two touches. See handleTouchStart
        movedDuringInteraction: true,
        prevTouches: [
          Vector.fromClient(event.changedTouches[0]),
          Vector.fromClient(event.changedTouches[1]),
        ],
      };
    } else {
      // Still too much touches
      state = { enabled: true };
    }
  }

  function handlePointerDown(event: PointerEvent) {
    event.preventDefault();

    if (event.pointerType !== "mouse") {
      return;
    }

    image.style.cursor = "grabbing";

    state = {
      enabled: true,
      // At the start of sequence there is no movement
      movedDuringInteraction: false,
      lastPointerPosition: Vector.fromClient(event),
    };
  }

  function handlePointerUp(event: PointerEvent) {
    event.preventDefault();

    if (event.pointerType !== "mouse") {
      return;
    }

    image.style.cursor = "";
    if ("movedDuringInteraction" in state && !state.movedDuringInteraction) {
      clickDeactivate();
    } else {
      state = { enabled: true };
    }
  }

  function handlePointerMove(event: PointerEvent) {
    event.preventDefault();

    // Separate touch operation from mouse handling entierly
    if (event.pointerType !== "mouse") {
      return;
    }

    if (!("lastPointerPosition" in state)) {
      return;
    }

    const newPointerPosition = Vector.fromClient(event);
    const delta = newPointerPosition.sub(state.lastPointerPosition);
    state.lastPointerPosition = newPointerPosition;

    // When using touch devices (or bad mouses) even fast taps
    // have some miniscule amount of motion which we need to dampen
    const isBigMovement = delta.abs() > 0.1;
    // In movedDuringClick we calculate if any of the motions in sequence
    // were big not just the last before release. User can
    // drag image around and then hesitate for a long time before
    // releasing click
    state.movedDuringInteraction ||= isBigMovement;

    const zoomSt = zoomState();
    setZoomState({
      scale: zoomSt.scale,
      position: apply_on_rows(
        {
          position: zoomSt.position.add(delta),
          scale: new Vector(zoomSt.scale, zoomSt.scale),
          size: neutralImageDimensions.size,
        },
        clampPosition,
      ),
    });
  }

  function ifEnabled<T extends Event>(
    func: (event: T) => void,
  ): (event: T) => void {
    return (event) => {
      if (state.enabled) {
        event.stopPropagation();
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
    // During enabled state we use pointerdown pointerup pair
    // and pointermove events in between to differentiate if movement was
    // a click or a dragging motion. See how movedDuringInteraction is used.
    // Click can not be reliably used for this because movementX/Y property
    // measures from last event, not from start of click and is generally
    // unreliable (see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/movementX).
    // We need to remove click listener because it still fires even if pointerup was
    // handled and interferes with state handling
    container.removeEventListener("click", clickActivate);

    container.ontransitionend = () => {
      container.style.width = "";
      container.style.height = "";
      container.style.left = "";
      container.style.top = "";
      image.style.borderRadius = "";

      container.ontransitionend = null;

      setActive(true);
      setNoTransition(true);
      state = { enabled: true };
      keyHandlerStack.push(keyEventHandler);
    };
  }

  function clickDeactivate(): void {
    keyHandlerStack.pop(keyEventHandler);
    setNoTransition(false);
    setTinted(false);
    setZoomState({ position: Vector.zero(), scale: 1 });
    container.style.width = `${wrapper.getBoundingClientRect().width}px`;
    container.style.height = `${wrapper.getBoundingClientRect().height}px`;
    container.style.left = `${wrapper.getBoundingClientRect().left}px`;
    container.style.top = `${wrapper.getBoundingClientRect().top}px`;
    image.style.borderRadius = "1rem";

    state = { enabled: false };

    container.ontransitionend = () => {
      setNoTransition(true);
      setActive(false);
      setOnTop(false);
      container.addEventListener("click", clickActivate);
      container.style.width = "";
      container.style.height = "";
      container.style.left = "";
      container.style.top = "";
      image.style.borderRadius = "";

      container.ontransitionend = null;
    };
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      clickDeactivate();
    }
  }

  const keyEventHandler = { keydown: handleKeyDown };

  // Wait not only for image component to mount, but also until
  // blob is properly loaded
  onMount(() =>
    image.addEventListener("load", () => {
      updateNeutralImageDimensions();

      window.addEventListener("resize", updateNeutralImageDimensions);

      // When image is in disabled state container is exactly the size of
      // image and catches propagated events. When enabled container
      // is whole viewport
      container.addEventListener("click", clickActivate);

      // Handling touches and mouse need to be done sepearately
      // Event though pointerup and pointerdown respond to touch inputs
      // they behave strangely, e.g. pointerup does not fire sometimes e.t.c

      // These handle touch devices exclusively
      container.addEventListener("touchstart", ifEnabled(handleTouchStart));
      container.addEventListener("touchend", ifEnabled(handleTouchEnd));
      container.addEventListener("touchmove", ifEnabled(handleTouchMove));

      // These handle mouse exclusively
      container.addEventListener("wheel", ifEnabled(handleWheel));
      container.addEventListener("pointerdown", ifEnabled(handlePointerDown));
      container.addEventListener("pointerup", ifEnabled(handlePointerUp));
      container.addEventListener("pointermove", ifEnabled(handlePointerMove));

      if (props.onLoad !== undefined) {
        props.onLoad();
      }
    }),
  );

  onCleanup(() => {
    window.removeEventListener("resize", updateNeutralImageDimensions);
    keyHandlerStack.pop(keyEventHandler);
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
