interface OnceFunction<THIS, ARGS extends Array<unknown>, RETURN> {
  (this: THIS, ...args: ARGS): RETURN;
  reset(): void;
  readonly called: boolean;
}

/**
 * Create a wrapper around {@link fn} that will ensure
 * that it is called only once (on the first call to
 * resulting function, to be specific)
 */
function once<THIS, ARGS extends Array<unknown>, RETURN>(
  fn: (this: THIS, ...args: ARGS) => RETURN,
): OnceFunction<THIS, ARGS, RETURN> {
  let called = false;
  let result!: RETURN;

  const onceFunction = function (this: THIS, ...args: ARGS): RETURN {
    if (!called) {
      called = true;
      result = fn.call(this, ...args);
    }

    return result;
  };

  onceFunction.called = called;

  onceFunction.reset = () => {
    called = false;
  };

  return onceFunction;
}

export type { OnceFunction };
export default once;
