class Fuzzy<T> {
  data: T[];
  index: string[];

  constructor(data: T[], keySelector: (item: T) => string) {
    this.data = data;
    this.index = data.map(keySelector).map((s) => s.toLocaleLowerCase());
  }

  find(query: string): T[] {
    const queryParsed = query.toLocaleLowerCase().split(" ");
    const queryParsedLength = queryParsed.length;

    const result = [];
    const indexSize = this.index.length;

    indexLoop: for (let i = 0; i < indexSize; i++) {
      const element = this.index[i];
      for (let j = 0; j < queryParsedLength; j++) {
        if (!contains(queryParsed[j], element)) {
          continue indexLoop;
        }
      }

      result.push(this.data[i]);
    }

    return result;
  }
}

function contains(needle: string, haystack: string): boolean {
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

export default Fuzzy;
