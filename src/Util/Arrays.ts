class Arrays {
  static equal<T>(lhs: T[], rhs: T[]): boolean {
    if (lhs.length !== rhs.length) {
      return false;
    }

    const length = lhs.length;
    for (let i = 0; i < length; i++) {
      if (lhs[i] !== rhs[i]) {
        return false;
      }
    }

    return true;
  }
}

export default Arrays;
