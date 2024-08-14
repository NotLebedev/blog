/**
 * Wrapper around {@link HTMLElement.addEventListener}/{@link HTMLElement.removeEventListener}
 * that ensures that previous listener set through this object is removed
 * before adding new one.
 *
 * Note that different object of this class for same element and event type
 * do not remove each others listeners, when using
 * {@link this.setListener}/{@link this.removeListener}, meaning
 * multiple {@link UniqueEventListener}s can be used to manage
 * separate debouncing logics on the same object
 */
class UniqueEventListener<
  ELEMENT extends HTMLElement,
  K extends keyof HTMLElementEventMap,
> {
  private element: ELEMENT;
  private eventType: K;
  private listener: ((ev: HTMLElementEventMap[K]) => unknown) | undefined;

  constructor(
    element: ELEMENT,
    eventType: K,
    listener?: (ev: HTMLElementEventMap[K]) => unknown,
  ) {
    this.element = element;
    this.eventType = eventType;
    this.listener = listener;

    if (this.listener !== undefined) {
      this.element.addEventListener(this.eventType, this.listener);
    }
  }

  /**
   * Add new listener for underlying element and event, removing old
   * one set through this object.
   */
  setListener(listener: (ev: HTMLElementEventMap[K]) => unknown): void {
    this.removeListener();

    this.listener = listener;
    this.element.addEventListener(this.eventType, this.listener);
  }

  /**
   * Remove event listener previously set through this object
   */
  removeListener(): void {
    if (this.listener !== undefined) {
      this.element.removeEventListener(this.eventType, this.listener);
    }
  }
}

export default UniqueEventListener;
