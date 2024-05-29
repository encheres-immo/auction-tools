import { Show, type Component, JSXElement } from "solid-js";
const CenteredModal: Component<{
  children: JSXElement;
  success: boolean | void;
  icon_class: string | void;
  title: string | void;
}> = (props: any) => {
  return (
    <div>
      <div id="auction-widget-modal-background"></div>

      <div class="auction-widget-modal">
        <div id="auction-widget-modal-content">
          <div>
            <Show when={props.success}>
              <div class="auction-widget-icon">
                <i class="fas fa-check" />
              </div>
            </Show>
            <Show when={props.icon_class}>
              <div class="auction-widget-icon">
                <i class={props.icon_class} />
              </div>
            </Show>
            <div>
              <Show when={props.title}>
                <h3>{props.title}</h3>
              </Show>
              <div>{props.children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenteredModal;
