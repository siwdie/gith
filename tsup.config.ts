import { defineConfig } from 'tsup'



export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  config: './tsconfig.json',
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