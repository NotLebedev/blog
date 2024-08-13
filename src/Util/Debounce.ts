interface Debounced<THIS, ARGS extends Array<unknown>> {
  (this: THIS, ...args: ARGS): void;

  /**
   * Cancel calling original function after wait period
   *
   * If this object was never called, or timeout already
   * ended and function was called does nothing
   */
  cancel(): void;
}

/**
 * Create a debounced version of {@link fn}.
 *
 * Result can be executed and then original function
 * will be called after timeout of {@link wait}.
 * If {@link Debounced.cancel} is called on result before
 * timeout, then function will not be called
 */
function debounce<THIS, ARGS extends Array<unknown>>(
  fn: (this: THIS, ...args: ARGS) => void,
  wait: number,
): Debounced<THIS, ARGS> {
  let timeout: number | undefined;

  const result = function (this: THIS, ...args: ARGS): void {
    const flush = () => {
      result.cancel();
      fn.call(this, ...args);
    };
    timeout = setTimeout(flush, wait);
  };

  result.cancel = () => {
    clearTimeout(timeout);
    timeout = undefined;
  };

  return result;
}

export type { Debounced };
export default debounce;
