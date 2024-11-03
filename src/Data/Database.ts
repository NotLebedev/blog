import { Filters, Fuzzy, Tags } from "./Filters";
import { ImagesSearch } from "./ImagesSearch";

type ImageInfo = {
  id: string;
  name: string;
  // All previews are 512 high
  previewWidth: number;
  description?: string;
  camera?: string;
  lens?: string;
  film?: string;
  tags: string[];
};

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
  }

  search(search: string, tags: string[]): ImageInfo[] {
    if (this.imageSearch === undefined) {
      this.imageSearch = new ImagesSearch(this.images);
    }

    this.imageSearch.fuzzy.query(search);
    this.imageSearch.tags.query(tags);

    return this.imageSearch.filters.filter();
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

function getImageURL(info: ImageInfo): string {
  return `/images/${info.id}/image.jpg`;
}

function getPreviewURL(info: ImageInfo): string {
  return `/images/${info.id}/preview.jpg`;
}

export type { Database, ImageInfo };
export { getImageURL, getPreviewURL };
export default getDB;
