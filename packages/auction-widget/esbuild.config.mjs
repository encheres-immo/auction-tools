import esbuild from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";

async function build() {
  const isDev = process.argv.includes("--watch");

  const config = {
    entryPoints: ["src/index.tsx"],
    bundle: true,
    outfile: "dist/auction-widget.js",
    plugins: [solidPlugin()],
    sourcemap: true,
  };

  if (!isDev) {
    await esbuild.build({
      ...config,
      minify: true,
    });

    return;
  }

  const builder = await esbuild.context({ ...config, minify: false });

  await builder.watch();

  process.on("beforeExit", () => {
    builder.dispose && builder.dispose();
  });
}

await build();
