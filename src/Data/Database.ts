import { Filters, Fuzzy, Tags } from "./Filters";
import { ImageInfo } from "virtual:data";

class ImagesSearch {
  fuzzy: Fuzzy<ImageInfo>;
  tags: Tags<ImageInfo>;
  filters: Filters<ImageInfo>;

  constructor(images: ImageInfo[]) {
    this.fuzzy = new Fuzzy<ImageInfo>(
      (image) =>
        image.name +
        " " +
        image.description +
        " " +
        image.tags.reduce((prev, curr) => prev + " " + curr, ""),
    );
    this.tags = new Tags<ImageInfo>((image) => image.tags);

    this.filters = new Filters(images, this.fuzzy, this.tags);
  }
}

class Database {
  images: ImageInfo[];
  imageSearch?: ImagesSearch;

  constructor(images: ImageInfo[]) {
    this.images = images;
  }

  search(search: string, tags: string[]): ImageInfo[] {
    if (this.imageSearch === undefined) {
      this.imageSearch = new ImagesSearch(this.images);
    }

    this.imageSearch.fuzzy.query(search);
    this.imageSearch.tags.query(tags);

    return this.imageSearch.filters.filter();
  }

  private shift(
    currentId: string,
    search: string,
    tags: string[],
    shift: number,
  ) {
    const filtered = this.search(search, tags);

    const idx = filtered.findIndex((img) => currentId === img.id);
    if (idx === -1 || idx + shift < 0 || idx + shift >= filtered.length) {
      return undefined;
    } else {
      return filtered[idx + shift];
    }
  }

  prevBefore(
    currentId: string,
    search: string,
    tags: string[],
  ): ImageInfo | undefined {
    return this.shift(currentId, search, tags, -1);
  }

  nextAfter(
    currentId: string,
    search: string,
    tags: string[],
  ): ImageInfo | undefined {
    return this.shift(currentId, search, tags, 1);
  }
}

let db: Database | undefined = undefined;

async function fetchDB(): Promise<Database> {
  const data = await import("virtual:data");
  return new Database(data.photos);
}

async function getDB(): Promise<Database> {
  if (db === undefined) {
    db = await fetchDB();
  }

  return db;
}

export type { Database, ImageInfo };
export default getDB;
