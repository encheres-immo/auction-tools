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

We use [pnpm](https://pnpm.io/) as our package manager, since it's not only faster and safer than npm and yarn, but also because it has better support for monorepos.

Most of the commands are package-specific, so you'll need to navigate to the package you want to work on before running them. 

### Root commands

Install dependencies for all packages, with pnpm:

```bash
pnpm install
```

Generate a changelog:

```bash
pnpm changeset
```

### `/example`

First, set up the environment variables in a `.env` file at the root of the `example` package:

```env
API_KEY = "Your api key"
API_ENV = "local" | "staging" | "production"
PROPERTY_ID = "Your property id"
```

Then, you probably want to install the dependencies with `pnpm install`, and run the dev server with `pnpm run dev`.

More information about the example package can be found in its [README](./example/README.md).

### `/packages/auction-widget`

You probably want to install the dependencies with `pnpm install`, and build the package with `pnpm run build`.

To see the published README of this package, with the usage instructions, click [here](./packages/auction-widget/README.md).

### `/packages/widget-client`

You probably want to install the dependencies with `pnpm install`, and build the package with `pnpm run build`.

To see the published README of this package, with the usage instructions, click [here](./packages/widget-client/README.md).
