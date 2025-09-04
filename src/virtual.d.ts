import { ImageInfo } from "./Data/Database";

declare module "virtual:data" {
  export const photos: ImageInfo[];
}
