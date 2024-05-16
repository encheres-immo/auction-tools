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

To use the widget, add the following HTML tag to your website:

```html
<div id="auction-widget" api-key="YOUR API KEY" property-id="PROPERTY ID"></div>
```

Replace `YOUR API KEY` with your Enchères Immo API key and `PROPERTY ID` with the ID of the property you want to display.

## Customization

You can customize the widget by setting CSS variables in your website's stylesheet. Here are the available variables:

***WORK IN PROGRESS.***

Also, as required by OAuth2, authentication pages are hosted on the Enchères Immo domain. You can customize the look and feel of these pages through your Enchères Immo "Custom Theme" settings.

## How to contribute

***WORK IN PROGRESS.*** We will soon open-source this widget and provide guidelines on how to contribute. Stay tuned!
