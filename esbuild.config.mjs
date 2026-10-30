// Bundles src/main.ts and chalk-talk's engine into main.js, the one script Obsidian loads. `production` builds once,
// minified; without it, it rebuilds on every change.
import esbuild from 'esbuild'
import { builtinModules } from 'node:module'

const production = process.argv[2] === 'production'
const context = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian', 'electron', '@codemirror/*', '@lezer/*', ...builtinModules],
  format: 'cjs',
  target: 'es2020',
  logLevel: 'info',
  sourcemap: production ? false : 'inline',
  minify: production,
  treeShaking: true,
  outfile: 'main.js',
  banner: { js: '/*! Chalk Talk for Obsidian — MIT. Bundles chalk-talk (MIT), Rough.js (MIT), mermaid-to-excalidraw and Mermaid (MIT), Caveat and Shantell Sans (SIL OFL). */' },
})
if (production) {
  await context.rebuild()
  await context.dispose()
} else await context.watch()
