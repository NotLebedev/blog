type ImageInfo = {
  id: string;
  name: string;
  file: string;
  camera?: string;
  lens?: string;
  flim?: string;
};

type Database = {
  images: [ImageInfo];
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

export type { Database, ImageInfo };
export default getDB;
