import { JSX } from "solid-js";

declare module "virtual:data" {
  interface ImageInfo {
    id: string;
    name: string;
    // All previews are 512 high
    previewWidth: number;
    description?: JSX.Element;
    camera?: string;
    lens?: string;
    film?: string;
    tags: string[];

    imageUrl: string;
    previewUrl: string;
  }
  function photo(description: {
    name: string;
    description?: JSX.Element;
    camera?: string;
    lens?: string;
    film?: string;
    tags: string[];
  });

  export type { ImageInfo };

  export { photo };

  export const photos: ImageInfo[];
}
