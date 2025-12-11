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

  interface PostInfo {
    id: string;
    title: string;
    date_published: Date;
    date_modified: Date;
    status: "draft" | "published" | "hidden";
    cut: JSX.Element;
  }

  export type { ImageInfo, PostInfo };

  export { post };

  export const photos: ImageInfo[];
  export const posts: PostInfo[];
}
