import { JSX } from "solid-js";

declare module "virtual:photo" {
  type Medium = "digital" | "film" | "infrared";
  type Location = "moscow" | "saint petersburg" | "veliky novgorod";
  type Genre =
    | "architecture"
    | "landscape"
    | "wildlife"
    | "weather"
    | "macro"
    | "product"
    | "nature";

  type Tag = Medium | Location | Genre;

  function photo(description: {
    name: string;
    description?: JSX.Element;
    camera?: string;
    lens?: string;
    film?: string;
    tags: Tag[];
  });

  export default photo;
}
