# @encheres-immo/auction-widget

## 0.6.3

### Patch Changes

- f3b2472: Fixed a bug where icons were not displayed correctly on Chrome and Safari. Thanks @Princesseuh !
- 30761e6: Fixed a bug where the bid input's default value was not updated correctly when new bids were placed.

## 0.6.2

### Patch Changes

- 8defdd5: Fixed a bug not dynamically updating the bid history at auction start.

## 0.6.1

### Patch Changes

- Updated dependencies [94ce534]
  - @encheres-immo/widget-client@0.5.1

## 0.6.0

### Minor Changes

- d258d9a: Added automatic reconnection for recently logged-in users.
- 47af2eb: Added a link to create an account when `allow-user-registration` is set to `true`. If false, the agent's contact information will be displayed instead.

### Patch Changes

- 5ff5c88: Fixed a bug where the bid form visibility was not dynamically updated when the auction started or ended.
- 5d8a8db: Added source map for better debugging, and reduced package size when downloaded from npm. Should not affect behaviour and performance in usage.
- Updated dependencies [d258d9a]
- Updated dependencies [5d8a8db]
- Updated dependencies [47af2eb]
- Updated dependencies [087dcf5]
  - @encheres-immo/widget-client@0.5.0

## 0.5.0

### Minor Changes

- 3df41c8: Added event emission functionality to the auction widget. The widget now dispatches events prefixed with `auction-widget:`, which can be handled using JavaScript on your website. The available events are:

  | Name         | Payload                                            | Description                                                                                          |
  | ------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
  | `bid_placed` | `{ amount: number, date: string }`                 | Emitted when a bid is successfully placed. Can be used to play a sound, display a notification, etc. |
  | `new_bid`    | `{ amount: number, bidder: string, date: string }` | Emitted when a new bid is placed. Can be used to play a sound, display a notification, etc.          |
  | `register`   | `{}`                                               | Emitted when the user registers for the auction. Can be used for analytics, display a message, etc.  |

  To listen to an event, add an event listener to the widget element in your website's JavaScript:

  ```js
  document
    .getElementById("auction-widget")
    .addEventListener("auction-widget:new_bid", (event) => {
      console.log("New bid:", event.detail);
    });
  ```

  This event list is meant to be extended in the future, so feel free to ask for new events if you need them!

- 3df41c8: Fixed an error where the form would accept non-number values. Also added a new CSS variable to customize errors color.

  | Variable name                  | Default value |
  | ------------------------------ | ------------- |
  | `--auction-widget-error-color` | `#dc2626`     |

- 3df41c8: Renamed the `source` attribute to `source-name`, to avoid conflicts with existing HTML attribute. This is technically a **breaking change**, but it should not affect any existing usage of the widget.

  ```html
  <!-- Before -->
  <div id="auction-widget" source="APIMO" [... other attributes]></div>
  <!-- After -->
  <div id="auction-widget" source-name="APIMO" [... other attributes]></div>
  ```

- 3df41c8: Added CSS reset to isolate widget styles from host page and ensure consistency across browsers. This change **may cause minor visual changes** as fewer styles are inherited from the host page.

### Patch Changes

- b653663: Fixed a bug where amounts were not correct upon bid confirmation.
- 4a09e38: Fixed an issue where the contact modal was not closing correctly when `allowUserRegistration` was false.
- 91b19eb: Fixed SVG icons not being displayed properly in the widget. A Font Awesome kit is no longer required.
- 6192fa4: Fixed the modal background to prevent elements from appearing above it.
- Updated dependencies [b653663]
- Updated dependencies [f7bcf21]
  - @encheres-immo/widget-client@0.4.2

## 0.4.3

### Patch Changes

- 94f6fd6: Fixed an issue where the connected user's bids showed their anonymous ID instead of 'You'.

## 0.4.2

### Patch Changes

- 088915c: Added documentation on upgrading the widget via NPM or standalone CDN links, along with guidelines for understanding version numbers.

## 0.4.1

### Patch Changes

- 6b3ccbd: Updated README to reflect the package's open-source status, including links for contributions and issue reporting.
- 2336f90: Fixed a bug where the `tos-url` attribute was incorrectly required, added validation for invalid URLs, and added documentation in the package README.
- Updated dependencies [6b3ccbd]
  - @encheres-immo/widget-client@0.4.1

## 0.4.0

### Minor Changes

- 65b24d5: Add an optional attribute to allow users to register for the auction—This registration must be accepted by the agent later, or the user will not be able to place bids. If set to false, agent's contact information will be displayed instead.

  ```html
  <div
    id="auction-widget"
    [...
    other
    attributes]
    allow-user-registration="false"
  ></div>
  ```

  Default value is `true`.

### Patch Changes

- ec8113d: Fixed an issue where bid history was visible to non-participants in private auctions.
- 582816d: Fixes several edge cases where the information displayed did not match the user's permissions/state.
- Updated dependencies [65b24d5]
  - @encheres-immo/widget-client@0.4.0

## 0.3.1

### Patch Changes

- 26bfc84: Improving logging and error handling. Behind the scenes, we also deeply refactored the codebase to improve reliability and maintainability.
- 2cae24d: Display a warning message when a bid seems too high.
- 08adb49: Modified the environment prop to accept specific values ("local", "staging", "production") and set a default value of "production". If you are an external user, please only use "production".
- Updated dependencies [08adb49]
  - @encheres-immo/widget-client@0.3.1

## 0.3.0

### Minor Changes

- 435e9a1: You can now retrieve properties from a CRM by replacing `property-id` by `source` (e.g. `source="APIMO"`), `source-id` (the ID of the property in the CRM), and `source-agency-id` (the ID of the agency in the CRM).

  ```html
  <div
    id="auction-widget"
    api-key="YOUR API KEY"
    source="APIMO"
    source-id="APIMO PROPERTY ID"
    source-agency-id="APIMO AGENCY ID"
  ></div>
  ```

### Patch Changes

- 199980b: Fix a bug which prevented us from using other domains than localhost.
- a3d4f0c: Differentiate the display when there is no amount versus a zero amount.
- 199980b: Fix a bug where using a hash in the URL didn't work (we always returned to the root of the domain).
- Updated dependencies [435e9a1]
  - @encheres-immo/widget-client@0.3.0

## 0.2.1

### Patch Changes

- e9f874c: Fix potential conflicts between our CSS layers and those already created by the user.
- 5a76963: Fix an issue where the login button appeared even when the user was logged in.
- 7744800: Adds modals and bid history CSS styles.
- bcd6adb: Fixes CSS styles for responsive and modals.

## 0.2.0

### Minor Changes

- b7280f9: Allow customization of the API environment: local, staging, or production. Default to production.
- ac9dead: Adds API key and property ID as parameters in the root element.
- 123f7f3: Replace Tailwind CSS with CSS. And add customization options through CSS variables and layers.
- e8aa32c: Build @encheres-immo/auction-widget during release, so it can be available from jsdelivr (CDN).

### Patch Changes

- 6d28483: Fixes the auction being displayed as private by default (even if it is public) in the widget. For that, adds a `isPrivate` field in the auction client.
- Updated dependencies [b7280f9]
- Updated dependencies [6d28483]
  - @encheres-immo/widget-client@0.2.0
