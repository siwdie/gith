import { defineConfig } from 'tsup'
import pkg from './package.json'


export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm', 'cjs'],
  config: './tsconfig.json',
  noExternal: Object.keys(pkg.dependencies),
  clean: true,
  splitting: false,
  sourcemap: false,
  dts: false,
  minify: true,
  outExtension ({format}) {
    return {
      js: (format === 'esm') ? '.mjs' : '.cjs'
    }
  },
});