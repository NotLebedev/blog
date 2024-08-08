interface Filter<T> {
  createIndex(data: T[]): void;
  find(): boolean[];
}

class Filters<T> {
  filters: Filter<T>[];
  data: T[];

  constructor(data: T[], ...filters: Filter<T>[]) {
    this.filters = filters;
    this.data = data;

    for (const filter of this.filters) {
      filter.createIndex(data);
    }
  }

  filter(): T[] {
    const filterMasks = this.filters.map((filter) => filter.find());

    const result = [];
    const dataLength = this.data.length;
    for (let i = 0; i < dataLength; i++) {
      if (this.checkMask(filterMasks, i)) {
        result.push(this.data[i]);
      }
    }

    return result;
  }

  private checkMask(filterMasks: boolean[][], i: number): boolean {
    return filterMasks.find((mask) => !mask[i]) === undefined;
  }
}

class Fuzzy<T> implements Filter<T> {
  currentQuery: string[];
  keySelector: (item: T) => string;
  index: string[];

  constructor(keySelector: (item: T) => string) {
    this.currentQuery = [];
    this.keySelector = keySelector;
    this.index = [];
  }

  query(query: string): void {
    this.currentQuery = query.toLocaleLowerCase().split(" ");
  }

  createIndex(data: T[]): void {
    this.index = data.map(this.keySelector).map((s) => s.toLocaleLowerCase());
  }

  find(): boolean[] {
    const currentQuery = this.currentQuery;
    const currentQueryLength = currentQuery.length;

    const result = [];
    const indexSize = this.index.length;

    indexLoop: for (let i = 0; i < indexSize; i++) {
      const element = this.index[i];
      for (let j = 0; j < currentQueryLength; j++) {
        if (!Fuzzy.contains(currentQuery[j], element)) {
          result.push(false);
          continue indexLoop;
        }
      }

      result.push(true);
    }

    return result;
  }

  private static contains(needle: string, haystack: string): boolean {
    const needleLength = needle.length;
    const haystackLength = haystack.length;

    needleLoop: for (let i = 0, j = 0; i < needleLength; i++) {
      const nextChar = needle.charCodeAt(i);
      while (j < haystackLength) {
        if (haystack.charCodeAt(j++) === nextChar) {
          continue needleLoop;
        }
      }

      return false;
    }

    return true;
  }
}

class Tags<T> implements Filter<T> {
  currentQuery: Set<string>;
  index: Set<string>[];
  keySelector: (item: T) => string[];

  constructor(keySelector: (item: T) => string[]) {
    this.currentQuery = new Set();
    this.index = [];
    this.keySelector = keySelector;
  }

  query(query: string[]): void {
    this.currentQuery = new Set(query);
  }

  createIndex(data: T[]): void {
    this.index = data.map(this.keySelector).map((list) => new Set(list));
  }

  find(): boolean[] {
    return this.index.map((set) => set.isSupersetOf(this.currentQuery));
  }
}

export { Filters, Fuzzy, Tags };
