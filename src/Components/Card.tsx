import { ComponentProps, ParentComponent } from "solid-js";
import style from "./Card.module.css";
import classList from "../Util/Classes";

const Card: ParentComponent<
  Omit<ComponentProps<"div">, "class"> & { narrow?: boolean }
> = (props) => {
  return (
    <div
      // Note, children are added here through prop
      {...props}
      // classList from props is overriden, class prop can not be used
      {...classList(
        style.card,
        { [style.narrow]: props.narrow },
        props.classList,
      )}
    />
  );
};

export default Card;
