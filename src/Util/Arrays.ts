class Arrays {
  static equal<T>(
    lhs: T[],
    rhs: T[],
    eqFn?: (lhs: T, rhs: T) => boolean,
  ): boolean {
    if (lhs.length !== rhs.length) {
      return false;
    }

    eqFn = eqFn ?? ((lhs, rhs) => lhs === rhs);
    const length = lhs.length;
    for (let i = 0; i < length; i++) {
      if (!eqFn(lhs[i], rhs[i])) {
        return false;
      }
    }

    return true;
  }

  static fromMaybeArray<T>(maybeArray: T | T[] | undefined): T[] {
    if (Array.isArray(maybeArray)) {
      return maybeArray;
    } else if (!maybeArray) {
      return [];
    } else {
      return [maybeArray];
    }
  }
}

export default Arrays;
