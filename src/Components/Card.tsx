import { ComponentProps, ParentComponent } from "solid-js";
import style from "./Card.module.css";

const Card: ParentComponent<ComponentProps<"div"> & { narrow?: boolean }> = (
  props,
) => {
  return (
    <div
      {...props}
      classList={{
        [style.card]: true,
        [style.narrow]: props.narrow,
        ...props.classList,
      }}
    >
      {props.children}
    </div>
  );
};

export default Card;
