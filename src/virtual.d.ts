declare module "virtual:data" {
  interface ImageInfo {
    id: string;
    name: string;
    // All previews are 512 high
    previewWidth: number;
    description?: string;
    camera?: string;
    lens?: string;
    film?: string;
    tags: string[];

    imageUrl: string;
    previewUrl: string;
  }

  export type { ImageInfo };

  export const photos: ImageInfo[];
}
