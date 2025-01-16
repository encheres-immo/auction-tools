import { type Component, JSXElement } from "solid-js";
import { Icon, Icons } from "./Spritesheet.jsx";

/**
 * A centered modal to display a message to the user.
 */
const CenteredModal: Component<{
  children: JSXElement;
  title: string;
  icon: Icons;
}> = (props: any) => {
  return (
    <div>
      <div id="auction-widget-modal-background"></div>

      <div class="auction-widget-modal">
        <div id="auction-widget-modal-content">
          <Icon name={props.icon} parentClass="auction-widget-icon" />
          <div>
            <h3>{props.title}</h3>
            <div>{props.children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenteredModal;
