import { onCleanup } from "solid-js";

type SwipeDirection = "left" | "right";

type SwipeHandler = (direction: SwipeDirection) => void;

// number: startX of active single-finger gesture
// "scrolled": gesture was invalidated by a scroll
// undefined: no active gesture
type SwipeState = number | "scrolled" | undefined;

const THRESHOLD = 50;

function swipe(onSwipe: SwipeHandler) {
  let state: SwipeState;

  function onScroll() {
    state = "scrolled";
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) {
      state = undefined;
      return;
    }
    state = e.touches[0].clientX;
    // detect if scroll happened during swipe
    window.addEventListener("scroll", onScroll, { once: true });
  }

  function onTouchEnd(e: TouchEvent) {
    window.removeEventListener("scroll", onScroll);

    if (typeof state !== "number") {
      return;
    }

    const deltaX = e.changedTouches[0].clientX - state;
    state = undefined;

    if (deltaX > THRESHOLD) {
      onSwipe("right");
    } else if (deltaX < -THRESHOLD) {
      onSwipe("left");
    }
  }

  document.addEventListener("touchstart", onTouchStart);
  document.addEventListener("touchend", onTouchEnd);

  onCleanup(() => {
    console.log("onCleanup");
    document.removeEventListener("touchstart", onTouchStart);
    document.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("scroll", onScroll);
  });
}

export default swipe;
