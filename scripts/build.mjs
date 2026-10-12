import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';

await build({
  entryPoints: ['src/app/proof-carousel.jsx'],
  bundle: true,
  format: 'iife',
  globalName: 'BlackProofCarousel',
  jsx: 'automatic',
  target: 'es2020',
  minify: true,
  outdir: 'public/js',
  entryNames: '[name]',
  logLevel: 'info'
});

const proofs = JSON.parse(await readFile('content/profile/proofs.json', 'utf8'));
await writeFile('content/profile/proofs.js', `window.PROOF_ITEMS = ${JSON.stringify(proofs)};\n`);
