# @encheres-immo/auction-widget

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
