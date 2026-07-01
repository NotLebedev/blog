type KeyEventType = "keydown" | "keyup";
type KeyEventHandler = (event: KeyboardEvent) => unknown;
type KeyEventHandlers = Partial<Record<KeyEventType, KeyEventHandler>>;

class KeyEventListeners {
  private handlers: KeyEventHandlers[] = [];
  private listening = false;

  private handleKeyEvent = (event: KeyboardEvent): void => {
    if (event.type !== "keydown" && event.type !== "keyup") {
      return;
    }

    const handler = this.handlers.at(-1)?.[event.type];

    if (handler !== undefined) {
      handler(event);
    }
  };

  /**
   * Add a pair of key handlers to the top of the stack.
   */
  push(handler: KeyEventHandlers): void {
    this.handlers.push(handler);
    this.ensureListening();
  }

  /**
   * Remove a pair of key handlers from the stack, together with every entry
   * above it.
   */
  pop(handler: KeyEventHandlers): void {
    const index = this.handlers.lastIndexOf(handler);

    if (index === -1) {
      return;
    }

    this.handlers.splice(index);

    if (this.handlers.length === 0) {
      this.stopListening();
    }
  }

  private ensureListening(): void {
    if (this.listening) {
      return;
    }

    // eslint-disable-next-line no-restricted-syntax -- This is the central keyboard listener used by the stack.
    document.addEventListener("keydown", this.handleKeyEvent);
    // eslint-disable-next-line no-restricted-syntax -- This is the central keyboard listener used by the stack.
    document.addEventListener("keyup", this.handleKeyEvent);
    this.listening = true;
  }

  private stopListening(): void {
    if (!this.listening) {
      return;
    }

    document.removeEventListener("keydown", this.handleKeyEvent);
    document.removeEventListener("keyup", this.handleKeyEvent);
    this.listening = false;
  }
}

/**
 * A stack of key event handlers for pages that need temporary keyboard
 * precedence.
 *
 * Only the top entry in the stack receives `keydown`/`keyup` events from
 * `document`, so pushing a new entry suppresses handlers below it until the
 * entry is removed.
 */
const keyHandlerStack = new KeyEventListeners();

export type { KeyEventHandler, KeyEventHandlers, KeyEventType };
export default keyHandlerStack;
