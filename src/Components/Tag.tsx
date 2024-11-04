import { ParentComponent } from "solid-js";
import classList, { ClassList } from "../Util/Classes";
import style from "./Tag.module.css";

const Tag: ParentComponent<{ classList?: ClassList }> = (props) => {
  return <div {...classList(style.tag, props.classList)}>{props.children}</div>;
};

export default Tag;
