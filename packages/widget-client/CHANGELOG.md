# @encheres-immo/widget-client

## 0.5.0

### Minor Changes

- d258d9a: Implemented auto-login by storing the access token in local storage and reusing it if valid in the next session.
- 47af2eb: Added a function to get the registration link, allowing users to create an account on the platform before getting redirected to the auction page.

### Patch Changes

- 5d8a8db: Added source map for better debugging, and reduced package size when downloaded from npm. Should not affect behaviour and performance in usage.
- 087dcf5: Fixed a bug where OAuth redirection failed if the host page URL contained anchors. From now on, anchors and query parameters are stripped from the host page URL before redirection.

## 0.4.2

### Patch Changes

- b653663: Fixed highest bid to be null when no bid has been made yet (previously defaulted to an empty bid object).
- f7bcf21: Added `email` to `Usertype`.

## 0.4.1

### Patch Changes

- 6b3ccbd: Updated README to reflect the package's open-source status, including links for contributions and issue reporting.

## 0.4.0

### Minor Changes

- 65b24d5: Add a method to allows the connected user to register for a specific auction.

  ```ts
  const registration = await client.registerOnAuction(auction);
  console.log("Registration:", registration);
  ```

  This registration must be accepted by the agent later, or the user will not be able to place bids.

## 0.3.1

### Patch Changes

- 08adb49: Expanded the documentation to include prerequisites, usage examples, useful commands, and important notes about the package. Behind the scenes, we also deeply refactored the codebase to improve reliability and maintainability.

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

## 0.2.0

### Minor Changes

- b7280f9: Allow customization of the API environment: local, staging, or production. Default to production.

### Patch Changes

- 6d28483: Fixes the auction being displayed as private by default (even if it is public) in the widget. For that, adds a `isPrivate` field in the auction client.
