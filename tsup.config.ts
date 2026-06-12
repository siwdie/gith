import { defineConfig } from 'tsup'



export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node24',
  outDir: 'dist',
  clean: true,
  bundle: true,
  splitting: false,
  sourcemap: true,
  dts: false,
  treeshake: true,
  minify: false,
  keepNames: true,
  shims: false,
  cjsInterop: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
});