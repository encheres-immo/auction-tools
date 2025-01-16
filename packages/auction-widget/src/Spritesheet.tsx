import type { Component } from "solid-js";

/**
 * List of available icons in the Spritesheet component.
 */
export type Icons =
  | "check"
  | "envelope"
  | "gavel"
  | "phone"
  | "user"
  | "user-lock";

/**
 * Icon component to display an SVG icon from the Spritesheet.
 * Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use
 */
export const Icon = (props: {
  name: Icons;
  parentClass?: string;
  svgClass?: string;
}) => {
  return (
    <div class={`${props.parentClass}`}>
      <svg class={props.svgClass}>
        <use href={`#${props.name}`} />
      </svg>
    </div>
  );
};

/**
 * A hidden SVG spritesheet, used to avoid loading the same SVG multiple times.
 * For usage, see the Icon component.
 * Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol
 *
 * ## Find new icons
 * Go to -> https://icones.js.org/
 * Filter for Font Awesome 6 collections (Solid is preferred)
 * Click on the icon you want to use and then copy « SVG Symbol »
 * Paste the symbol in the Spritesheet component, and update the id with the icon name.
 * Add the icon name to the Icons type above.
 */
export const Spritesheet: Component = (props) => {
  return (
    <svg style="position: absolute; width: 0; height: 0; overflow: hidden;">
      <symbol viewBox="0 0 448 512" id="check">
        <path
          fill="currentColor"
          d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z"
        ></path>
      </symbol>

      <symbol viewBox="0 0 512 512" id="envelope">
        <path
          fill="currentColor"
          d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4l217.6 163.2c11.4 8.5 27 8.5 38.4 0l217.6-163.2c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48zM0 176v208c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V176L294.4 339.2a63.9 63.9 0 0 1-76.8 0z"
        ></path>
      </symbol>

      <symbol viewBox="0 0 512 512" id="gavel">
        <path
          fill="currentColor"
          d="M318.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-120 120c-12.5 12.5-12.5 32.8 0 45.3l16 16c12.5 12.5 32.8 12.5 45.3 0l4-4l106.8 106.7l-4 4c-12.5 12.5-12.5 32.8 0 45.3l16 16c12.5 12.5 32.8 12.5 45.3 0l120-120c12.5-12.5 12.5-32.8 0-45.3l-16-16c-12.5-12.5-32.8-12.5-45.3 0l-4 4L330.6 74.6l4-4c12.5-12.5 12.5-32.8 0-45.3l-16-16zm-152 288c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l48 48c12.5 12.5 32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-1.4-1.4l58.8-58.7l-45.3-45.3l-58.7 58.7l-1.4-1.4z"
        ></path>
      </symbol>

      <symbol viewBox="0 0 512 512" id="phone">
        <path
          fill="currentColor"
          d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64c0 247.4 200.6 448 448 448c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368c-70.4-33.3-127.4-90.3-160.7-160.7l49.3-40.3c13.7-11.2 18.4-30 11.6-46.3l-40-96z"
        ></path>
      </symbol>

      <symbol viewBox="0 0 448 512" id="user">
        <path
          fill="currentColor"
          d="M224 256a128 128 0 1 0 0-256a128 128 0 1 0 0 256m-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512h388.6c16.4 0 29.7-13.3 29.7-29.7c0-98.5-79.8-178.3-178.3-178.3z"
        ></path>
      </symbol>

      <symbol viewBox="0 0 640 512" id="user-lock">
        <path
          fill="currentColor"
          d="M224 256a128 128 0 1 0 0-256a128 128 0 1 0 0 256m-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512h362.8c-5.4-9.4-8.6-20.3-8.6-32V352q0-3.15.3-6.3c-31-26-71-41.7-114.6-41.7h-91.4zM528 240c17.7 0 32 14.3 32 32v48h-64v-48c0-17.7 14.3-32 32-32m-80 32v48c-17.7 0-32 14.3-32 32v128c0 17.7 14.3 32 32 32h160c17.7 0 32-14.3 32-32V352c0-17.7-14.3-32-32-32v-48c0-44.2-35.8-80-80-80s-80 35.8-80 80"
        ></path>
      </symbol>
    </svg>
  );
};
