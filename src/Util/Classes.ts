export type ClassList = {
  [k: string]: boolean | undefined;
};

/**
 * More flexible way of creating classList which accepts
 * strings and multiple objects.
 * @example
 * <div {...classList(
 *  "foo",
 *  "bar",
 *  {[style.bar]: bar()}
 *  props.classList
 * )}/>
 * // Equivalent to
 * <div classList={
 *  foo: true,
 *  bar: true,
 *  [style.bar]: bar(),
 *  ...props.classList
 * }/>
 * @param classes string or possibly undefined classList object
 * @returns structure that can be expanded using <code>{...classList()}</code>
 */
function classList(...classes: (string | ClassList | undefined)[]): {
  classList: ClassList;
} {
  let result: ClassList = {};
  for (const clazz of classes) {
    if (typeof clazz === "string") {
      result[clazz] = true;
    } else {
      result = { ...result, ...clazz };
    }
  }

  return { classList: result };
}

export default classList;
