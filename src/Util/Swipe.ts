import { onCleanup } from "solid-js";

type SwipeDirection = "left" | "right" | "down";

type SwipeHandler = (direction: SwipeDirection) => void;

// [number, number]: [startX, startY] of active single-finger gesture
// "scrolled": gesture was invalidated by a scroll
// undefined: no active gesture
type SwipeState = [number, number] | "scrolled" | undefined;

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
    state = [e.touches[0].clientX, e.touches[0].clientY];
    // detect if scroll happened during swipe
    window.addEventListener("scroll", onScroll, { once: true });
  }

  function onTouchEnd(e: TouchEvent) {
    window.removeEventListener("scroll", onScroll);

    if (!Array.isArray(state)) {
      return;
    }

    const deltaX = e.changedTouches[0].clientX - state[0];
    const deltaY = e.changedTouches[0].clientY - state[1];
    state = undefined;

    if (deltaY > THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
      onSwipe("down");
    } else if (deltaX > THRESHOLD) {
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
