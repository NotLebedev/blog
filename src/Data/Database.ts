type ImageInfo = {
  id: string;
  name: string;
  // All previews are 512 high
  previewWidth: number;
  description?: string;
  camera?: string;
  lens?: string;
  flim?: string;
  tags: string[];
};

type Database = {
  images: ImageInfo[];
};

let db: Database | undefined = undefined;

async function fetchDB(): Promise<Database | undefined> {
  const response = await fetch("/db.json");
  if (response.ok) {
    return await response.json();
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
