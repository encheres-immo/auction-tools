# Enchères Immo's auction widget

Add a real-estate auction widget to your website, powered by Enchères Immo's API 🚀 

## Production

This workspace is a monorepo that contains the following packages:

| Package                   | Link                                                                                                                                     | README                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `docs`                    | WIP                                                                                                                                      | [README](./docs/README.md)                    |
| `example`                 | WIP                                                                                                                                      | [README](./example/README.md)                 |
| `packages/auction-widget` | [![npm version](https://badge.fury.io/js/@encheres-immo%2Fauction-widget.svg)](https://badge.fury.io/js/@encheres-immo%2Fauction-widget) | [README](./packages/auction-widget/README.md) |
| `packages/widget-client`  | [![npm version](https://badge.fury.io/js/@encheres-immo%2Fwidget-client.svg)](https://badge.fury.io/js/@encheres-immo%2Fwidget-client)   | [README](./packages/widget-client/README.md)  |

## Development

We use [pnpm](https://pnpm.io/) as our package manager, since it's not only faster and safer than npm and yarn, but also because it has better support for monorepos. Global commands are :

| Command          | Action                |
| :--------------- | :-------------------- |
| `pnpm install`   | Installs dependencies |
| `pnpm changeset` | Generate a changelog  |

For package-specific commands and instructions, please refer to the README of the package, listed above.