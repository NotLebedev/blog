import { JSX } from "solid-js";

declare module "virtual:photo" {
  function photo(description: {
    name: string;
    description?: JSX.Element;
    camera?: string;
    lens?: string;
    film?: string;
    tags: string[];
  });

  export default photo;
}
