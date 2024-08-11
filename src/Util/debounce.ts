export interface Debounced<T extends Array<unknown>> {
  (...args: T): void;
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
function debounce<T extends Array<unknown>>(
  fn: (this: Debounced<T>, ...args: T) => void,
  wait: number,
): Debounced<T> {
  let timeout!: number;

  const result = (...args: T) => {
    const flush = () => {
      result.cancel();
      fn.call(result, ...args);
    };
    timeout = setTimeout(flush, wait);
  };

  result.cancel = () => {
    clearTimeout(timeout);
  };

  return result;
}

export { debounce };
