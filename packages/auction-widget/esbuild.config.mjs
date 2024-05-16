import { build } from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";

build({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: "dist/auction-widget.js",
  plugins: [solidPlugin()],
  minify: true,
}).catch(() => process.exit(1));
