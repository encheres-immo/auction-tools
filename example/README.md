# Enchères Immo's auction widget - Example

This is a simple example of how to use the auction widget. Powered by Astro 🚀 

## Getting started

You'll need to set up the environment variables in a `.env` file at the root of the `example` package :

```env
API_KEY = "Your api key"
API_ENV = "local" | "staging" | "production"
PROPERTY_ID = " Your property id "
```

`API_ENV` is optional and defaults to `production`. `local` requires you to run the Enchères Immo API locally, on port 4000.

## Useful commands

All commands are run from the root of the project, from a terminal:

| Command                    | Action                                           |
| :------------------------- | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm run dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm run build`           | Build your production site to `./dist/`          |
| `pnpm run preview`         | Preview your build locally, before deploying     |
| `pnpm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm run astro -- --help` | Get help using the Astro CLI                     |
