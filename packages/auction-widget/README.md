# Enchères Immo's auction widget

Add a real-estate auction widget to your website, powered by Enchères Immo's API 🚀 

## Prerequisites

To use this widget, you need an API key from Enchères Immo. If you are a real estate professional and not yet a partner of Enchères Immo, please [book a demo](https://1awi3zs5bi0.typeform.com/to/N63LlgvM) to get started. If you are already a partner, contact us to get your API key.

## Installation

This widget is available as a package on npm. To install it, run:

```bash
# Using npm
npm install @encheresimmo/auction-widget
# Using pnpm
pnpm install @encheresimmo/auction-widget
# Using yarn (not recommended)
yarn add @encheresimmo/auction-widget
```

This widget is also available as a standalone script. To use it, add the following script and style tags to your HTML file:

```html
<script src="https://cdn.jsdelivr.net/npm/@encheres-immo/auction-widget@0/dist/auction-widget.js" defer></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@encheres-immo/auction-widget@0/dist/auction-widget.css">
```

## Usage

To use the widget, add the following HTML tag to your website, and replace `YOUR API KEY` with your Enchères Immo API key and `PROPERTY ID` with the Enchères Immo's ID of the property you want to display.

```html
<div id="auction-widget" api-key="YOUR API KEY" property-id="PROPERTY ID"></div>
```

Alternatively, you can retrieve your property from a CRM by replacing `property-id` by `source` (e.g. `source="APIMO"`), `source-id` (the ID of the property in the CRM), and `source-agency-id` (the ID of the agency in the CRM).

```html
<div id="auction-widget" api-key="YOUR API KEY" source="APIMO" source-id="APIMO PROPERTY ID" source-agency-id="APIMO AGENCY ID"></div>
```

## Configuration

### Features

You can enable or disable features of the widget by setting the corresponding attributes on the HTML tag. Here are the available features:

| Attribute                 | Default | Description                                                                                                                                                                                                                              |
| ------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allow-user-registration` | `true`  | Display a button to allow users to register for the auction—This registration must be accepted by the agent later, or the user will not be able to place bids. If set to `false`, agent's contact information will be displayed instead. |

### Styling

You can customize the widget by setting CSS variables in your website's stylesheet. Here are the available variables:

| Variable name                      | Default value |
| ---------------------------------- | ------------- |
| `--auction-widget-highlight-color` | `#ef673d`     |
| `--auction-widget-dark-color`      | `#002d40`     |
| `--auction-widget-border-radius`   | `0.5rem`      |
| `--auction-widget-btn-radius`      | `0.5rem`      |
| `--auction-widget-base-font`       | `sans-serif`  |
| `--auction-widget-title-font`      | `sans-serif`  |
| `--auction-widget-countdown-font`  | `monospace`   |

For example, to change the highlight color to blue, add the following CSS to your website's stylesheet:

```css
:root {
  --auction-widget-highlight-color: blue;
}
```

To override the default styles, you can also use the layer `@auction-widget-override` :

```css
@auction-widget {
  .auction-widget-label {
    border-radius: 1rem;
  }
}
```

Finally—as required by OAuth2—authentication pages are hosted on the Enchères Immo domain. You can customize the look and feel of these pages through your Enchères Immo "Custom Theme" settings.

## How to contribute

This widget is maintained by the [Enchères Immo](https://encheres-immo.com/) team, but we also deeply appreciate any contribution from the community, no matter how small or big.

### Quick Links

📖 [Main repository](https://github.com/encheres-immo/auction-widget), with all our public packages.

🐛 [Report a bug](https://github.com/encheres-immo/auction-widget/issues), please read our [contributing guidelines](https://github.com/encheres-immo/auction-widget/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/encheres-immo/auction-widget/blob/main/CODE_OF_CONDUCT.md) first.

🚨 [Report a security vulnerability](https://github.com/encheres-immo/auction-widget/security/advisories/new), and be sure to review our [security policy](https://github.com/encheres-immo/auction-widget/blob/main/SECURITY.md).

💬 [Join the discussion](https://github.com/encheres-immo/auction-widget/discussions), if you have any questions, ideas, or suggestions.

### Useful commands

All commands are run from the root of the package.

| Command          | Description          |
| ---------------- | -------------------- |
| `pnpm install`   | Install dependencies |
| `pnpm run build` | Build the widget     |
| `pnpm run test`  | Run tests            |