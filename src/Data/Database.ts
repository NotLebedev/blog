import { JSX } from "solid-js";
import { Filters, Fuzzy, Tags } from "./Filters";
import { photos } from "virtual:data";

class ImageInfo {
  id!: string;
  name!: string;
  // All previews are 512 high
  previewWidth!: number;
  description?: string;
  camera?: string;
  lens?: string;
  film?: string;
  tags!: string[];

  constructor(json: object) {
    Object.assign(this, json);
  }

  getImageURL(): string {
    return `/images/${this.id}/image.jpg`;
  }

  getPreviewURL(): string {
    return `/images/${this.id}/preview.jpg`;
  }
}

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
  images!: ImageInfo[];
  imageSearch?: ImagesSearch;

  constructor(json: object) {
    Object.assign(this, json);
    this.images = this.images.map((raw) => new ImageInfo(raw));
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

async function fetchDB(): Promise<Database | undefined> {
  const response = await fetch("/db.json");
  if (response.ok) {
    return new Database(await response.json());
  } else {
    return undefined;
  }
}

async function getDB(): Promise<Database | undefined> {
  if (db === undefined) {
    db = await fetchDB();
  }

  return db;
}

function description(description: {
  name: string;
  description?: JSX.Element;
  camera?: string;
  lens?: string;
  film?: string;
  tags: string[];
}) {
  description;
}

export type { Database, ImageInfo };
export { description };
export default getDB;
