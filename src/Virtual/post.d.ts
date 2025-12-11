import { JSX } from "solid-js";

module "virtual:post" {
  function post(description: {
    title: string;
    date_modified: Date;
    date_published: Date;
    status: "draft" | "published" | "hidden";
    cut: JSX.Element;
  });

  export default post;
}
