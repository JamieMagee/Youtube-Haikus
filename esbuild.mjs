import * as esbuild from 'esbuild';
import { GasPlugin } from 'esbuild-gas-plugin';
import * as fs from 'node:fs';

try {
  await esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    outfile: 'dist/Code.gs',
    plugins: [GasPlugin],
    minify: true,
    target: 'es2019',
  });

  fs.copyFileSync('src/appsscript.json', 'dist/appsscript.json');
} catch (e) {
  console.error(e);
  process.exit(1);
}
