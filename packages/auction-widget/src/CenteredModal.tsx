import { Show, type Component, JSXElement } from 'solid-js';
const CenteredModal: Component<{children: JSXElement, success: boolean | void, icon_class: string | void, icon_bg_class: string | void, title: string | void}> = (props: any) => {
    return (
    <div class="section">
      <div class="z-50 fixed bottom-0 inset-x-0 px-4 pb-6 sm:inset-0 sm:p-0 sm:flex sm:items-center sm:justify-center">

        <div class="fixed inset-0 transition-opacity">
          <div class="absolute inset-0 bg-gray-500 opacity-75" />
        </div>

        <div class="bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden shadow-xl transform transition-all max-w-sm md:max-w-lg sm:w-full sm:p-6">
          <div>
              <Show when={props.success}>
                  <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100">
                  <svg class="h-6 w-6 text-emerald-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  </div>
              </Show>
              <Show when={props.icon_class}>
                  <div class={"mx-auto flex items-center justify-center h-12 w-12 rounded-full " + props.icon_bg_class}>
                      <i class={props.icon_class} />
                  </div>
              </Show>
            <div class="my-2 text-center sm:my-4">
              <Show when={props.title}>
                <h3 class="text-lg font-medium leading-6 text-gray-900">
                  {props.title}
                </h3>
              </Show>
              <div>
                {props.children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
};

export default CenteredModal;