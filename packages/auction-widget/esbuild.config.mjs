import {build} from 'esbuild';
import {solidPlugin} from "esbuild-plugin-solid";


build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/output.js',
  plugins: [solidPlugin()],
  minify: true,
}).catch(() => process.exit(1))